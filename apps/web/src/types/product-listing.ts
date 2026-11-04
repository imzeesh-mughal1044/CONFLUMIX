import type { ProductCategory, ProductVariant } from "./products";

export type ListingStatus = "draft" | "published";
export type ListingImage = {
  id: string;
  src: string;
  name: string;
  local: boolean;
};
export type ListingVideo = {
  id: string;
  src: string;
  name: string;
  local: boolean;
};
export type ListingFormData = {
  id?: string;
  storeId?: string;
  sectionId?: string;
  title: string;
  category: ProductCategory | "";
  subcategory: string;
  description: string;
  price: string;
  quantity: string;
  images: ListingImage[];
  video?: ListingVideo;
  sku: string;
  tags: string[];
  attributes: Record<string, string>;
  variants: ProductVariant[];
  delivery: string;
  cancellation: string;
  returns: string;
  status: ListingStatus;
};
export type ListingErrors = Record<string, string>;
