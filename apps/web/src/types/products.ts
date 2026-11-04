import type { Locality } from "./marketplace";
import type { ProductCategory } from "@/data/product-taxonomy";

export type { ProductCategory } from "@/data/product-taxonomy";
export type ProductAttribute = { label: string; value: string };
export type ProductGalleryImage = { src: string; alt: string };
export type ProductVariant = { id: string; label: string; price: number; stock: number };
export type ProductPolicies = { delivery?: string; cancellation?: string; returns?: string };
export type ProductDetailData = {
  gallery: ProductGalleryImage[];
  variants?: ProductVariant[];
  policies?: ProductPolicies;
  stockUpdatedAt?: string;
};
export type RequirementStatus = "match" | "mismatch" | "unknown";
export type RequirementResult = { label: string; requested: string; actual?: string; status: RequirementStatus; explanation: string };
export type Product = {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  promotionLabel?: string;
  promotionEndDate?: string;
  category: ProductCategory;
  image: string;
  seller: string;
  verifiedSeller?: boolean;
  stock: number;
  createdAt: string;
  locality: Locality;
  featured?: boolean;
  attributes: ProductAttribute[];
};

export type ProductSort = "newest" | "price-low" | "price-high";
export type ProductQuery = { q?: string; category?: ProductCategory; min?: number; max?: number; availability?: "in-stock" | "out-of-stock"; seller?: string; locality?: Locality; attribute?: string; sort?: ProductSort };
