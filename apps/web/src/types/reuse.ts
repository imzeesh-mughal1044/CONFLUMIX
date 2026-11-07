import type { Locality } from "@/types/marketplace";

export const reuseConditions = [
  "New",
  "Like New",
  "Good",
  "Fair",
  "Needs Repair",
  "Refurbished",
] as const;
export const reuseClassifications = [
  "Pre-owned",
  "Refurbished",
  "Surplus",
] as const;
export const reuseSellerTypes = [
  "Individual",
  "Local Business",
  "Refurbishment Shop",
  "Secondary Dealer",
] as const;
export const reuseStatuses = [
  "Active",
  "Reserved",
  "Sold",
  "Expired",
  "Removed",
] as const;
export const reuseAvailabilityStates = [
  "Available",
  "Temporarily unavailable",
  "Unavailable",
] as const;
export const reuseVerificationStates = [
  "Unverified",
  "Basic Verified Citizen",
  "Local Business Verified",
] as const;

export type ReuseCondition = (typeof reuseConditions)[number];
export type ReuseClassification = (typeof reuseClassifications)[number];
export type ReuseSellerType = (typeof reuseSellerTypes)[number];
export type ReuseStatus = (typeof reuseStatuses)[number];
export type ReuseAvailability = (typeof reuseAvailabilityStates)[number];
export type ReuseVerification = (typeof reuseVerificationStates)[number];
export type ReuseSort = "newest" | "price-low" | "price-high" | "price-reduced";

export type ReuseMedia = {
  id: string;
  src: string;
  alt: string;
  type: "image";
  local?: boolean;
};
export type ReuseRepairDisclosure = {
  id: string;
  date: string;
  component: string;
  type: "DIY" | "Third-party" | "Authorized";
  notes: string;
  partsWarranty?: string;
};
export type ReusePriceHistory = {
  id: string;
  changedAt: string;
  askingPrice: number;
};
export type ReuseAttribute = { label: string; value: string };

export type ReuseListing = {
  id: string;
  title: string;
  description: string;
  category: string;
  locality: Locality;
  createdAt: string;
  askingPrice: number;
  previousAskingPrice?: number;
  condition: ReuseCondition;
  classification: ReuseClassification;
  status: ReuseStatus;
  availability: ReuseAvailability;
  sellerType: ReuseSellerType;
  sellerName: string;
  sellerVerification: ReuseVerification;
  image?: string;
  media: ReuseMedia[];
  negotiable: boolean;
  brand?: string;
  model?: string;
  purchaseDate?: string;
  usageDuration?: string;
  reasonForSelling?: string;
  warrantyStatus?: string;
  accessories?: string[];
  defects?: string[];
  attributes: ReuseAttribute[];
  sellerNotes?: string;
  handoverMethods: string[];
  repairHistory: ReuseRepairDisclosure[];
  priceHistory: ReusePriceHistory[];
  ownerEmail?: string;
  quantity?: number;
  lifecycle?: "draft" | "published";
  updatedAt?: string;
  version?: number;
  demo: boolean;
};

export type ReuseAttributeDefinition = {
  id: string;
  label: string;
  type: "text" | "number" | "boolean" | "choice" | "date";
  required: boolean;
  options?: string[];
};

export const reuseOfferStatuses = [
  "pending",
  "accepted",
  "rejected",
  "withdrawn",
  "expired",
] as const;
export type ReuseOfferStatus = (typeof reuseOfferStatuses)[number];
export type ReuseOfferEvent = {
  id: string;
  kind: "offer" | "counteroffer";
  actorRole: "buyer" | "seller";
  actorEmail: string;
  actorName: string;
  amount: number;
  message?: string;
  createdAt: string;
};
export type ReuseOffer = {
  id: string;
  listingId: string;
  buyerEmail: string;
  buyerName: string;
  sellerEmail?: string;
  sellerName: string;
  status: ReuseOfferStatus;
  currentAmount: number;
  history: ReuseOfferEvent[];
  createdAt: string;
  updatedAt: string;
  version: number;
  prototype: true;
};

export type ReuseQuery = {
  q?: string;
  category?: string;
  min?: number;
  max?: number;
  condition?: ReuseCondition;
  classification?: ReuseClassification;
  sellerType?: ReuseSellerType;
  locality?: Locality;
  availability?: ReuseAvailability;
  sort: ReuseSort;
};
