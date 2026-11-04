import { products } from "@/data/products";
import type { ListingFormData } from "@/types/product-listing";
import type { Product } from "@/types/products";
import type { SellerSetup } from "@/types/seller-setup";
import type { PublicStore, SellerActivity, StorefrontRecord } from "@/types/storefront";

const deliveryLabels = { pickup: "Store pickup", "local-delivery": "Local delivery", shipping: "Shipping" } as const;
const paymentLabels = { "cash-on-delivery": "Cash on delivery", "bank-transfer": "Bank transfer", "cash-on-pickup": "Cash on pickup" } as const;

const stores: PublicStore[] = [
  { id: "sound-and-form", sellerName: "Sound & Form", storeName: "Sound & Form", sellerType: "Business", description: "Thoughtfully selected personal audio for everyday listening, backed by clear local support.", city: "Lahore", locality: "Gulberg", publicContact: "+92 300 555 0142", delivery: ["Local delivery", "Shipping"], returnPolicy: "Returns are accepted within 7 days for unopened products. Fault-related exchanges are assessed through store support.", paymentMethod: "Cash on delivery", verified: true, active: true, createdAt: "2025-08-14", banner: "/marketplace/banners/local-retail.jpg", logo: "/products/headphones.jpg", rating: null, reviewCount: 0 },
  { id: "quiet-objects", sellerName: "Quiet Objects", storeName: "Quiet Objects", sellerType: "Individual seller", description: "Small, useful pieces for calm and functional homes.", city: "Lahore", locality: "Model Town", delivery: ["Store pickup"], returnPolicy: "Please contact the store within 3 days if an item arrives damaged.", verified: false, active: true, createdAt: "2026-02-03", rating: null, reviewCount: 0 },
  { id: "opening-soon", sellerName: "Opening Soon", storeName: "Opening Soon", sellerType: "Business", description: "A new local store preparing its first collection.", city: "Lahore", locality: "DHA Phase 6", delivery: [], returnPolicy: "Policy will appear when products are published.", verified: false, active: true, rating: null, reviewCount: 0 },
];

export function findStorefront(storeId: string): StorefrontRecord | null {
  const store = stores.find((item) => item.id === decodeURIComponent(storeId).toLowerCase());
  if (!store) return null;
  const visible = products.filter((product) => product.seller === store.storeName);
  return { ...store, products: visible, categories: Array.from(new Set(visible.map((item) => item.category))) };
}

export function publicStoreFromSetup(setup: SellerSetup): PublicStore {
  return {
    id: storeIdForName(setup.storeName), sellerName: setup.sellerName, storeName: setup.storeName,
    sellerType: setup.sellerType === "business" ? "Business" : "Individual seller", description: setup.description,
    city: setup.city, locality: setup.locality, publicContact: setup.publicContact || undefined,
    delivery: setup.deliveryOptions.map((item) => deliveryLabels[item]), returnPolicy: setup.returnPolicy,
    paymentMethod: setup.paymentMethod ? paymentLabels[setup.paymentMethod] : undefined,
    verified: setup.sellerVerification === "verified", active: true, createdAt: setup.accountCreatedAt,
    rating: setup.sellerRating, reviewCount: setup.totalReviews,logo:setup.storeLogo,banner:setup.storeBanner,
  };
}

export function storeIdForName(name: string) { return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "my-store"; }

export function localListingToProduct(listing: ListingFormData, seller: string, locality: Product["locality"]): Product | null {
  if (!listing.id || !listing.category || listing.status !== "published") return null;
  return { id: listing.id, slug: listing.id, title: listing.title, description: listing.description, price: Number(listing.price), category: listing.category, image: listing.images[0]?.src ?? "/products/home.jpg", seller, stock: Number(listing.quantity), createdAt: "2026-10-31", locality, attributes: Object.entries(listing.attributes).map(([label, value]) => ({ label, value })) };
}

export const demoActivity: SellerActivity[] = [
  { id: "a1", title: "Order ORD-1048 needs fulfilment", detail: "Studio wireless headphones · Processing", at: "2026-10-30" },
  { id: "a2", title: "Product stock updated", detail: "Noise-isolating earbuds · 20 available", at: "2026-10-29" },
];
