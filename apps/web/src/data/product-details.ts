import type { ProductDetailData } from "@/types/products";

const standardPolicies = {
  delivery: "Estimated local delivery is 2–4 working days. Final timing is confirmed by the seller.",
  cancellation: "Cancellation is available before the seller confirms dispatch.",
  returns: "Returns are accepted within 7 days for an unused item in its original packaging.",
};

export const productDetails: Record<string, ProductDetailData> = {
  "np-01": {
    gallery: [
      { src: "/products/headphones.jpg", alt: "Black Studio wireless headphones on a desk" },
      { src: "/products/tech.jpg", alt: "Workspace showing technology accessories" },
    ],
    variants: [
      { id: "black", label: "Black", price: 28500, stock: 9 },
      { id: "sand", label: "Sand", price: 29500, stock: 5 },
      { id: "navy", label: "Navy · unavailable", price: 28500, stock: 0 },
    ],
    policies: standardPolicies,
    stockUpdatedAt: "2026-10-24",
  },
  "np-02": { gallery: [{ src: "/marketplace/oak-work-desk.png", alt: "Minimal oak work desk in a bright room" }], policies: { delivery: "Seller-arranged delivery within Lahore. Cost is confirmed before dispatch.", cancellation: standardPolicies.cancellation }, stockUpdatedAt: "2026-10-23" },
  "np-03": { gallery: [{ src: "/marketplace/commuter-backpack.png", alt: "Olive commuter backpack" }], variants: [{ id: "olive", label: "Olive", price: 7900, stock: 14 }, { id: "black", label: "Black", price: 7900, stock: 10 }], policies: standardPolicies },
  "np-04": { gallery: [{ src: "/products/laptop.jpg", alt: "Ultralight laptop open on a wooden desk" }, { src: "/products/tech.jpg", alt: "Laptop and accessories in a workspace" }], variants: [{ id: "512", label: "512GB", price: 189000, stock: 4 }, { id: "1tb", label: "1TB", price: 215000, stock: 2 }], policies: standardPolicies, stockUpdatedAt: "2026-10-22" },
  "np-05": { gallery: [{ src: "/products/chair.jpg", alt: "Linen lounge chair with a wooden frame" }], policies: { delivery: "Seller-arranged delivery in the listed locality.", cancellation: standardPolicies.cancellation } },
  "np-06": { gallery: [{ src: "/marketplace/banners/local-retail.jpg", alt: "Compact kitchen appliance displayed in a local store" }], variants: [{ id: "5l", label: "5 litre", price: 23800, stock: 11 }], policies: standardPolicies, stockUpdatedAt: "2026-10-21" },
};

export function getProductDetailData(productId: string, image: string, title: string): ProductDetailData {
  return productDetails[productId] ?? { gallery: [{ src: image, alt: title }] };
}
