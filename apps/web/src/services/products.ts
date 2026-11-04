import { products } from "@/data/products";
import { productCategories } from "@/data/product-taxonomy";
import { readManagedListings } from "./listing-management";
import { readStoredListings } from "./product-listings";
import { promotionalPriceForListing, readPromotions } from "./promotions";
import { readSellerSetup } from "./seller-setup";
import type { Product, ProductCategory, ProductQuery, RequirementResult } from "@/types/products";

export async function browseProducts(query: ProductQuery): Promise<Product[]> {
  const search = query.q?.trim().toLowerCase();
  const attribute = query.attribute?.toLowerCase();
  const filtered = readPublicProducts().filter((item) => {
    const text = [item.title, item.description, item.category, item.seller, ...item.attributes.flatMap((entry) => [entry.label, entry.value])].join(" ").toLowerCase();
    return (!search || text.includes(search)) && (!query.category || item.category === query.category) && (query.min === undefined || item.price >= query.min) && (query.max === undefined || item.price <= query.max) && (!query.availability || (query.availability === "in-stock" ? item.stock > 0 : item.stock === 0)) && (!query.seller || item.seller === query.seller) && (!query.locality || item.locality === query.locality) && (!attribute || item.attributes.some((entry) => entry.value.toLowerCase() === attribute));
  });
  return filtered.sort((a, b) => query.sort === "price-low" ? a.price - b.price || a.id.localeCompare(b.id) : query.sort === "price-high" ? b.price - a.price || a.id.localeCompare(b.id) : b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id));
}

export function findProduct(identifier: string): Product | undefined {
  let safeIdentifier = identifier;
  try { safeIdentifier = decodeURIComponent(identifier); } catch { return undefined; }
  safeIdentifier = safeIdentifier.trim().toLowerCase();
  return products.find((item) => item.id.toLowerCase() === safeIdentifier || item.slug.toLowerCase() === safeIdentifier);
}

export function findPublicProduct(identifier:string):Product|undefined{let safe=identifier;try{safe=decodeURIComponent(identifier)}catch{return undefined}safe=safe.trim().toLowerCase();return readPublicProducts().find((item)=>item.id.toLowerCase()===safe||item.slug.toLowerCase()===safe)}
export function readPublicProducts():Product[]{if(typeof window==="undefined")return products;const setup=readSellerSetup(),seller=setup.storeName||"Sound & Form",managed=readManagedListings(seller),promotions=readPromotions(seller);const local=readStoredListings().filter((item)=>item.id&&item.status==="published"&&item.category).flatMap((listing)=>{const record=managed.find((item)=>item.id===listing.id);if(!record||record.status!=="active")return[];const offer=promotionalPriceForListing(record,promotions,managed);return[{id:listing.id!,slug:listing.id!,title:listing.title,description:listing.description,price:offer?.promotionalPrice??record.price,originalPrice:offer?.originalPrice,promotionLabel:offer?.promotion.name,promotionEndDate:offer?.promotion.endDate,category:listing.category as ProductCategory,image:listing.images[0]?.src??"/products/home.jpg",seller,stock:record.quantity,createdAt:record.updatedAt??new Date().toISOString(),locality:setup.locality as Product["locality"],attributes:Object.entries(listing.attributes).filter(([,value])=>value.trim()).map(([label,value])=>({label,value}))} satisfies Product]});const localIds=new Set(local.map((item)=>item.id));const fixture=products.filter((item)=>!localIds.has(item.id)).flatMap((item)=>{if(item.seller!==seller)return[item];const record=managed.find((entry)=>entry.id===item.id);if(!record||record.status!=="active")return[];const offer=promotionalPriceForListing(record,promotions,managed);return[{...item,price:offer?.promotionalPrice??record.price,originalPrice:offer?.originalPrice,promotionLabel:offer?.promotion.name,promotionEndDate:offer?.promotion.endDate,stock:record.quantity}]});return[...local,...fixture]}

export const requirementFields = Object.assign(Object.fromEntries(productCategories.map((category) => [category, []])) as unknown as Record<ProductCategory, string[]>, {
  "Electronics & Smart Devices": ["Brand", "Connectivity", "Colour"],
  "Computers & Laptops": ["Brand", "Connectivity", "Storage", "Colour"],
  "Home & Living": ["Material", "Style"],
  "Clothing & Fashion": ["Size", "Material", "Colour"],
  "Home Appliances": ["Brand", "Capacity"],
  "Outdoor & Travel": ["Material", "Colour"],
});

export function requirementOptions(category: ProductCategory, label: string): string[] {
  return Array.from(new Set(products.filter((item) => item.category === category).flatMap((item) => item.attributes.filter((entry) => entry.label === label).map((entry) => entry.value)))).sort();
}

export function checkRequirements(product: Product, requirements: Record<string, string>): RequirementResult[] {
  return Object.entries(requirements).filter(([, requested]) => requested.trim()).map(([label, requested]) => {
    const actual = product.attributes.find((entry) => entry.label === label)?.value;
    if (!actual) return { label, requested, status: "unknown", explanation: `${label} is not supplied in this listing, so compatibility cannot be confirmed.` };
    const match = actual.toLowerCase() === requested.toLowerCase();
    return { label, requested, actual, status: match ? "match" : "mismatch", explanation: match ? `The listing specifies ${actual}.` : `You selected ${requested}; this listing specifies ${actual}.` };
  });
}

export function requirementAlternatives(current: Product, requirements: Record<string, string>): { product: Product; results: RequirementResult[] }[] {
  return products.filter((item) => item.id !== current.id && item.category === current.category && item.stock > 0).map((product) => ({ product, results: checkRequirements(product, requirements) })).sort((a, b) => {
    const score = (results: RequirementResult[]) => results.reduce((total, result) => total + (result.status === "match" ? 3 : result.status === "mismatch" ? -2 : 0), 0);
    return score(b.results) - score(a.results) || b.product.createdAt.localeCompare(a.product.createdAt) || a.product.id.localeCompare(b.product.id);
  }).slice(0, 4);
}

export function relatedProducts(current: Product, excluded: string[] = []): Product[] {
  return products.filter((item) => item.id !== current.id && !excluded.includes(item.id) && item.category === current.category).sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id)).slice(0, 5);
}
