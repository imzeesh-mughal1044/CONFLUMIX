export type SellerMarketplaceIntent = "new-products" | "reuse" | "both";
export type SellerOnboardingRecord = {
  accountEmail: string;
  intent: SellerMarketplaceIntent;
  newProductsStartedAt?: string;
  reuseInterestSavedAt?: string;
  createdAt: string;
  updatedAt: string;
};
