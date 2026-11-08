import type { ReuseListing } from "@/types/reuse";

export type ReusePriceReductionEvidence = {
  id: string;
  listingId: string;
  title: string;
  category: string;
  changedAt: string;
  previousAskingPrice: number;
  askingPrice: number;
  reduction: number;
};

export type ReuseAnalyticsSnapshot = {
  listingCount: number;
  lifecycle: {
    active: number;
    draft: number;
    reserved: number;
    sold: number;
    expired: number;
    removed: number;
  };
  categoryListingVolume: { category: string; count: number }[];
  priceReductions: ReusePriceReductionEvidence[];
};

export function analyzeReuseSellerRecords(
  listings: ReuseListing[],
  category?: string,
): ReuseAnalyticsSnapshot {
  const scoped = category
    ? listings.filter((item) => item.category === category)
    : listings;
  const categoryCounts = new Map<string, number>();
  scoped.forEach((item) =>
    categoryCounts.set(item.category, (categoryCounts.get(item.category) ?? 0) + 1),
  );
  const priceReductions = scoped.flatMap((item) =>
    [...item.priceHistory]
      .sort((a, b) => a.changedAt.localeCompare(b.changedAt))
      .flatMap((entry, index, history) => {
        const previous = history[index - 1];
        if (!previous || entry.askingPrice >= previous.askingPrice) return [];
        return [{
          id: `${item.id}:${entry.id}`,
          listingId: item.id,
          title: item.title,
          category: item.category,
          changedAt: entry.changedAt,
          previousAskingPrice: previous.askingPrice,
          askingPrice: entry.askingPrice,
          reduction: previous.askingPrice - entry.askingPrice,
        }];
      }),
  ).sort((a, b) => b.changedAt.localeCompare(a.changedAt));
  const published = scoped.filter((item) => item.lifecycle !== "draft");
  return {
    listingCount: scoped.length,
    lifecycle: {
      active: published.filter((item) => item.status === "Active").length,
      draft: scoped.filter((item) => item.lifecycle === "draft").length,
      reserved: published.filter((item) => item.status === "Reserved").length,
      sold: published.filter((item) => item.status === "Sold").length,
      expired: published.filter((item) => item.status === "Expired").length,
      removed: published.filter((item) => item.status === "Removed").length,
    },
    categoryListingVolume: [...categoryCounts]
      .map(([categoryName, count]) => ({ category: categoryName, count }))
      .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category)),
    priceReductions,
  };
}
