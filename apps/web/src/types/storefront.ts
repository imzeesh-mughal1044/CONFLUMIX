import type { Product, ProductCategory } from "./products";

export type PublicStore = {
  id: string;
  sellerName: string;
  storeName: string;
  sellerType: "Individual seller" | "Business";
  description: string;
  city: string;
  locality: string;
  publicContact?: string;
  delivery: string[];
  returnPolicy: string;
  paymentMethod?: string;
  verified: boolean;
  active: boolean;
  createdAt?: string;
  logo?: string;
  banner?: string;
  rating: number | null;
  reviewCount: number;
};

export type StorefrontRecord = PublicStore & { products: Product[]; categories: ProductCategory[] };
export type SellerActivity = { id: string; title: string; detail: string; at: string };
