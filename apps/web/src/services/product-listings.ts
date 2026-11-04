import type { Product } from "@/types/products";
import type { ListingErrors, ListingFormData } from "@/types/product-listing";

export const currentSeller = {
  name: "CONFLUMIX Store",
  locality: "DHA Phase 6" as const,
};
export const emptyListing: ListingFormData = {
  title: "",
  category: "",
  subcategory: "",
  description: "",
  price: "",
  quantity: "",
  sku: "",
  tags: [],
  images: [],
  attributes: {},
  variants: [],
  delivery: "",
  cancellation: "",
  returns: "",
  status: "draft",
};
export const listingStorageKey = "conflumix:new-product-listings:v1";
export const draftStorageKey = "conflumix:new-product-draft:v1";

export function listingFromProduct(product: Product): ListingFormData {
  return {
    id: product.id,
    title: product.title,
    category: product.category,
    subcategory: "",
    description: product.description,
    price: String(product.price),
    quantity: String(product.stock),
    sku: product.id.toUpperCase(),
    tags: [],
    images: [
      {
        id: `${product.id}-image`,
        src: product.image,
        name: product.title,
        local: false,
      },
    ],
    attributes: Object.fromEntries(
      product.attributes.map((item) => [item.label, item.value]),
    ),
    variants: [],
    delivery: "",
    cancellation: "",
    returns: "",
    status: "published",
  };
}

export function validateListing(data: ListingFormData): ListingErrors {
  const errors: ListingErrors = {};
  if (!data.title.trim()) errors.title = "Enter a product title.";
  else if (data.title.trim().length > 100)
    errors.title = "Keep the title to 100 characters or fewer.";
  if (!data.category) errors.category = "Choose a supported category.";
  if (!data.description.trim())
    errors.description = "Describe the product and any important limitations.";
  const price = Number(data.price);
  if (
    !data.price ||
    !Number.isFinite(price) ||
    price <= 0 ||
    !/^\d+(\.\d{1,2})?$/.test(data.price)
  )
    errors.price =
      "Enter a price greater than zero, with up to two decimal places.";
  const quantity = Number(data.quantity);
  if (
    data.quantity === "" ||
    !Number.isInteger(quantity) ||
    quantity < 0 ||
    quantity > 100000
  )
    errors.quantity = "Enter a whole quantity from 0 to 100,000.";
  if (!data.images.length)
    errors.images = "Add at least one product image before publishing.";
  if (data.images.length > 20)
    errors.images = "A listing can contain no more than 20 product photos.";
  if (data.tags.length > 20) errors.tags = "Use no more than 20 keywords.";
  const invalidTag = data.tags.find(
    (tag) =>
      !/^[A-Za-z0-9][A-Za-z0-9 _-]{0,19}$/.test(tag) || /^\d+\.\d+$/.test(tag),
  );
  if (invalidTag)
    errors.tags = `“${invalidTag}” must be 1–20 characters, start with a letter or number, and cannot be a decimal value.`;
  data.variants.forEach((variant, index) => {
    if (!variant.label.trim())
      errors[`variant-${index}`] = "Each variation needs an option name.";
    if (
      !Number.isFinite(variant.price) ||
      variant.price <= 0 ||
      !Number.isInteger(variant.stock) ||
      variant.stock < 0
    )
      errors[`variant-${index}`] =
        "Each variation needs a valid price and non-negative whole quantity.";
  });
  return errors;
}

export function readStoredListings(): ListingFormData[] {
  try {
    const raw = localStorage.getItem(listingStorageKey);
    const value = raw ? JSON.parse(raw) : [];
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function saveStoredListing(data: ListingFormData) {
  if (data.sectionId && !data.storeId) throw new Error("A shop section assignment requires a store.");
  if (data.sectionId) {
    const sections = JSON.parse(localStorage.getItem("conflumix:new-product-shop-sections:v1") ?? "[]") as Array<{ id: string; storeId: string }>;
    if (!sections.some((item) => item.id === data.sectionId && item.storeId === data.storeId)) throw new Error("The selected shop section does not belong to this store.");
  }
  const records = readStoredListings();
  const next = records.filter((item) => item.id !== data.id);
  next.push(data);
  localStorage.setItem(listingStorageKey, JSON.stringify(next));
}

export function makeLocalId() {
  return `local-${Date.now().toString(36)}`;
}
