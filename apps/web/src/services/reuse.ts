import { reuseListings } from "@/data/reuse";
import type { ReuseListing, ReuseQuery } from "@/types/reuse";

const normalize = (value: string) =>
  value.trim().toLocaleLowerCase().replace(/\s+/g, " ");
export const reuseListingEvent = "conflumix-reuse-listings";
const listingKey = "conflumix:reuse:listings:v1";

export function readLocalReuseListings(): ReuseListing[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(
      localStorage.getItem(listingKey) ?? "[]",
    ) as ReuseListing[];
  } catch {
    return [];
  }
}

export function allReuseListings() {
  const local = readLocalReuseListings();
  return [
    ...local,
    ...reuseListings.filter(
      (fixture) => !local.some((item) => item.id === fixture.id),
    ),
  ];
}

function writeLocalReuseListings(items: ReuseListing[]) {
  localStorage.setItem(listingKey, JSON.stringify(items));
  window.dispatchEvent(new Event(reuseListingEvent));
}

export function saveReuseListing(
  listing: ReuseListing,
  expectedVersion?: number,
) {
  const records = readLocalReuseListings();
  const existing =
    records.find((item) => item.id === listing.id) ??
    reuseListings.find((item) => item.id === listing.id);
  if (
    expectedVersion !== undefined &&
    existing &&
    (existing.version ?? 1) !== expectedVersion
  )
    throw new Error(
      "This listing changed in another session. Reload it before saving again.",
    );
  const next = {
    ...listing,
    updatedAt: new Date().toISOString(),
    version: (existing?.version ?? 0) + 1,
    demo: true,
  };
  writeLocalReuseListings([
    next,
    ...records.filter((item) => item.id !== listing.id),
  ]);
  return next;
}

export async function browseReuse(query: ReuseQuery): Promise<ReuseListing[]> {
  const term = normalize(query.q ?? "");
  const filtered = allReuseListings().filter((item) => {
    if (
      (item.lifecycle ?? "published") !== "published" ||
      item.status === "Removed"
    )
      return false;
    if (
      term &&
      !normalize(
        `${item.title} ${item.description} ${item.category} ${item.locality} ${item.sellerName}`,
      ).includes(term)
    )
      return false;
    if (query.category && item.category !== query.category) return false;
    if (query.min !== undefined && item.askingPrice < query.min) return false;
    if (query.max !== undefined && item.askingPrice > query.max) return false;
    if (query.condition && item.condition !== query.condition) return false;
    if (query.classification && item.classification !== query.classification)
      return false;
    if (query.sellerType && item.sellerType !== query.sellerType) return false;
    if (query.locality && item.locality !== query.locality) return false;
    if (query.availability && item.availability !== query.availability)
      return false;
    return true;
  });
  return [...filtered].sort((a, b) => {
    if (query.sort === "price-low") return a.askingPrice - b.askingPrice;
    if (query.sort === "price-high") return b.askingPrice - a.askingPrice;
    if (query.sort === "price-reduced")
      return (
        (b.previousAskingPrice ? b.previousAskingPrice - b.askingPrice : 0) -
        (a.previousAskingPrice ? a.previousAskingPrice - a.askingPrice : 0)
      );
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export async function getReuseListing(id: string) {
  return (
    allReuseListings().find(
      (item) =>
        item.id === id && (item.lifecycle ?? "published") === "published",
    ) ?? null
  );
}

export function getEditableReuseListing(id: string) {
  return allReuseListings().find((item) => item.id === id) ?? null;
}

export async function getRelatedReuseListings(
  listing: ReuseListing,
  limit = 3,
) {
  return allReuseListings()
    .filter(
      (item) =>
        item.id !== listing.id &&
        item.category === listing.category &&
        item.status !== "Removed" &&
        (item.lifecycle ?? "published") === "published",
    )
    .slice(0, limit);
}
