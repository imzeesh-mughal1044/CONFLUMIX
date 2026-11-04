import type { ManagedListing } from "@/types/listing-management";
import type { Promotion, PromotionConflict, PromotionPrice, PromotionStatus } from "@/types/promotions";

const key = "conflumix:promotions:v1";
const startTime = (date: string) => new Date(`${date}T00:00:00`).getTime();
const endTime = (date: string) => new Date(`${date}T23:59:59.999`).getTime();

function readAll(): Promotion[] { try { return JSON.parse(localStorage.getItem(key) ?? "[]") as Promotion[]; } catch { return []; } }
function writeAll(value: Promotion[]) { localStorage.setItem(key, JSON.stringify(value)); }
export function readPromotions(seller: string) { return readAll().filter((item) => item.seller === seller).sort((a,b) => b.updatedAt.localeCompare(a.updatedAt)); }
export function promotionStatus(promotion: Promotion, now = new Date()): PromotionStatus { if (!promotion.enabled) return "disabled"; const time=now.getTime(); if (time < startTime(promotion.startDate)) return "scheduled"; if (time > endTime(promotion.endDate)) return "expired"; return "active"; }
export function eligibleListings(promotion: Pick<Promotion,"productIds"|"categories">, listings: ManagedListing[]) { return listings.filter((item) => promotion.productIds.includes(item.id) || promotion.categories.includes(item.category)); }
export function calculatePromotionPrice(price: number, promotion: Pick<Promotion,"discountType"|"discountValue">) { const amount=promotion.discountType === "percentage" ? price * promotion.discountValue / 100 : promotion.discountValue; const promotionalPrice=Math.max(0, Math.round(price-amount)); return { originalPrice:price, promotionalPrice, discountAmount:price-promotionalPrice }; }
export function validatePromotion(promotion: Promotion, listings: ManagedListing[]) {
  const errors: string[]=[]; const scoped=eligibleListings(promotion,listings);
  if (!promotion.name.trim()) errors.push("Enter a promotion name.");
  if (promotion.name.trim().length>80) errors.push("Keep the promotion name to 80 characters or fewer.");
  if (!Number.isFinite(promotion.discountValue)||promotion.discountValue<=0) errors.push("Enter a discount greater than zero.");
  if (promotion.discountType==="percentage"&&promotion.discountValue>100) errors.push("Percentage discounts cannot exceed 100%.");
  if (!promotion.productIds.length&&!promotion.categories.length) errors.push("Select at least one product or category.");
  if (!promotion.startDate||!promotion.endDate||endTime(promotion.endDate)<=startTime(promotion.startDate)) errors.push("The end date must be after the start date.");
  if (promotion.productIds.some((id)=>!listings.some((item)=>item.id===id))) errors.push("One or more selected products are unavailable to this store.");
  if (promotion.discountType==="fixed"&&scoped.some((item)=>promotion.discountValue>=item.price)) errors.push("The fixed discount must be lower than every eligible product price.");
  return errors;
}
export function promotionConflicts(candidate: Promotion, promotions: Promotion[], listings: ManagedListing[]): PromotionConflict[] {
  if (!candidate.enabled) return [];
  const ids=new Set(eligibleListings(candidate,listings).map((item)=>item.id));
  return promotions.filter((other)=>other.id!==candidate.id&&other.enabled&&promotionStatus(other)!=="expired"&&startTime(candidate.startDate)<=endTime(other.endDate)&&startTime(other.startDate)<=endTime(candidate.endDate)).flatMap((other)=>{
    const shared=eligibleListings(other,listings).filter((item)=>ids.has(item.id)); if (!shared.length) return [];
    return [{ promotionId:other.id,promotionName:other.name,productIds:shared.map((item)=>item.id),productTitles:shared.map((item)=>item.title),overlapStart:new Date(Math.max(startTime(candidate.startDate),startTime(other.startDate))).toISOString(),overlapEnd:new Date(Math.min(endTime(candidate.endDate),endTime(other.endDate))).toISOString(),explanation:`${shared.length} product${shared.length===1?"":"s"} would receive both discounts during the overlapping date range.` }];
  });
}
export function savePromotion(promotion: Promotion, listings: ManagedListing[]) { const all=readAll(); const owned=all.filter((item)=>item.seller===promotion.seller); const errors=validatePromotion(promotion,listings); const conflicts=promotionConflicts(promotion,owned,listings); if (errors.length||conflicts.length) return {ok:false,errors,conflicts}; const index=all.findIndex((item)=>item.id===promotion.id&&item.seller===promotion.seller); if(index>=0) all[index]=promotion; else all.push(promotion); writeAll(all); return {ok:true,errors:[],conflicts:[]}; }
export function deactivatePromotion(id:string,seller:string){const all=readAll(),index=all.findIndex((item)=>item.id===id&&item.seller===seller);if(index<0)return false;all[index]={...all[index],enabled:false,updatedAt:new Date().toISOString()};writeAll(all);return true;}
export function promotionalPriceForListing(listing:ManagedListing,promotions:Promotion[],listings:ManagedListing[],now=new Date()):PromotionPrice|null { const applicable=promotions.filter((promotion)=>promotionStatus(promotion,now)==="active"&&eligibleListings(promotion,listings).some((item)=>item.id===listing.id)&&promotionConflicts(promotion,promotions,listings).length===0); if(applicable.length!==1)return null;return {...calculatePromotionPrice(listing.price,applicable[0]),promotion:applicable[0]}; }
