export type MarketplaceMode = "new-products" | "reuse" | "tasks" | "donations";
export type Locality = "DHA Phase 6" | "Gulberg" | "Johar Town" | "Model Town" | "Wapda Town";

type ListingBase = {
  id: string;
  mode: MarketplaceMode;
  title: string;
  description: string;
  category: string;
  locality: Locality;
  createdAt: string;
  status: "available" | "limited" | "open" | "fulfilled";
  featured?: boolean;
  visual: string;
};

export type NewProductListing = ListingBase & {
  mode: "new-products";
  price: number;
  seller: string;
  stock: string;
};

export type ReuseListing = ListingBase & {
  mode: "reuse";
  price: number;
  seller: string;
  condition: "Like new" | "Good" | "Fair";
};

export type TaskListing = ListingBase & {
  mode: "tasks";
  budget: number;
  skill: string;
  workStyle: "Remote" | "Local" | "Hybrid";
};

export type DonationListing = ListingBase & {
  mode: "donations";
  kind: "offer" | "need";
  organization: string;
  quantity: string;
  condition?: string;
  urgency: 1 | 2 | 3;
};

export type MarketplaceListing = NewProductListing | ReuseListing | TaskListing | DonationListing;
export type SortOption = "recommended" | "newest" | "price-low" | "price-high" | "alphabetical" | "urgency";

export type DiscoveryQuery = {
  query?: string;
  mode?: MarketplaceMode | "all";
  locality?: Locality;
  category?: string;
  status?: string;
  condition?: string;
  donationKind?: "offer" | "need";
  sort?: SortOption;
  limit?: number;
};

export type DiscoveryResult = {
  items: MarketplaceListing[];
  total: number;
  categories: string[];
};

