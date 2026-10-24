import { marketplaceListings } from "@/data/marketplace";
import type { DiscoveryQuery, DiscoveryResult, MarketplaceListing } from "@/types/marketplace";

const normalize = (value: string) => value.trim().toLocaleLowerCase().replace(/\s+/g, " ");
const price = (item: MarketplaceListing) => item.mode === "new-products" || item.mode === "reuse" ? item.price : item.mode === "tasks" ? item.budget : Number.POSITIVE_INFINITY;

function searchableText(item: MarketplaceListing) {
  const specific = item.mode === "new-products" || item.mode === "reuse" ? item.seller : item.mode === "tasks" ? `${item.skill} ${item.workStyle}` : `${item.organization} ${item.kind}`;
  return normalize(`${item.title} ${item.description} ${item.category} ${item.locality} ${specific}`);
}

export async function discoverMarketplace(query: DiscoveryQuery = {}): Promise<DiscoveryResult> {
  const term = normalize(query.query ?? "");
  let items = marketplaceListings.filter((item) => {
    if (term && !searchableText(item).includes(term)) return false;
    if (query.mode && query.mode !== "all" && item.mode !== query.mode) return false;
    if (query.locality && item.locality !== query.locality) return false;
    if (query.category && item.category !== query.category) return false;
    if (query.status && item.status !== query.status) return false;
    if (query.condition && (item.mode !== "reuse" || item.condition !== query.condition)) return false;
    if (query.donationKind && (item.mode !== "donations" || item.kind !== query.donationKind)) return false;
    return true;
  });

  const relevance = (item: MarketplaceListing) => term && normalize(item.title).includes(term) ? 2 : term && normalize(item.category).includes(term) ? 1 : 0;
  items = [...items].sort((a, b) => {
    if (query.sort === "newest") return Date.parse(b.createdAt) - Date.parse(a.createdAt);
    if (query.sort === "price-low") return price(a) - price(b);
    if (query.sort === "price-high") return price(b) - price(a);
    if (query.sort === "alphabetical") return a.title.localeCompare(b.title);
    if (query.sort === "urgency") return (b.mode === "donations" ? b.urgency : 0) - (a.mode === "donations" ? a.urgency : 0);
    return relevance(b) - relevance(a) || Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || Date.parse(b.createdAt) - Date.parse(a.createdAt);
  });

  const categories = [...new Set(marketplaceListings.filter((item) => !query.mode || query.mode === "all" || item.mode === query.mode).map((item) => item.category))].sort();
  return { items: items.slice(0, query.limit ?? items.length), total: items.length, categories };
}

export async function getListing(id: string) {
  return marketplaceListings.find((item) => item.id === id) ?? null;
}
