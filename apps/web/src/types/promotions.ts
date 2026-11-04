import type { ProductCategory } from "./products";

export type PromotionDiscountType = "percentage" | "fixed";
export type PromotionStatus = "active" | "scheduled" | "expired" | "disabled";
export type Promotion = {
  id: string;
  seller: string;
  storeId: string;
  name: string;
  discountType: PromotionDiscountType;
  discountValue: number;
  productIds: string[];
  categories: (ProductCategory | "Uncategorized")[];
  startDate: string;
  endDate: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};
export type PromotionConflict = { promotionId: string; promotionName: string; productIds: string[]; productTitles: string[]; overlapStart: string; overlapEnd: string; explanation: string };
export type PromotionPrice = { originalPrice: number; promotionalPrice: number; discountAmount: number; promotion: Promotion };
