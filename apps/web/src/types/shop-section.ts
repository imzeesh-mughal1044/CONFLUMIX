export type ShopSection = {
  id: string;
  storeId: string;
  name: string;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type ShopSectionResult =
  | { ok: true; section: ShopSection }
  | { ok: false; error: string };
