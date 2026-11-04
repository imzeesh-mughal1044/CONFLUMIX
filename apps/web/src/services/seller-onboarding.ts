import { readFrontendSession } from "@/lib/auth";
import { calculateSellerCompletion, newProductListingEligibility, readSellerSetup } from "./seller-setup";
import type { SellerMarketplaceIntent, SellerOnboardingRecord } from "@/types/seller-onboarding";

export const sellerOnboardingEvent = "conflumix-seller-onboarding";
const key = (email:string) => `conflumix:seller-onboarding:${encodeURIComponent(email.trim().toLowerCase())}:v1`;

export function readSellerOnboarding(email = readFrontendSession()?.email): SellerOnboardingRecord | null {
  if (!email || typeof window === "undefined") return null;
  try { const value=JSON.parse(localStorage.getItem(key(email))??"null") as SellerOnboardingRecord|null; return value?.accountEmail===email.trim().toLowerCase()?value:null; } catch { return null; }
}

export function startSellerOnboarding(intent:SellerMarketplaceIntent,email=readFrontendSession()?.email){
  if(!email) throw new Error("Sign in before starting seller registration.");
  const now=new Date().toISOString(),existing=readSellerOnboarding(email);
  const record:SellerOnboardingRecord={accountEmail:email.trim().toLowerCase(),intent,newProductsStartedAt:intent!=="reuse"?(existing?.newProductsStartedAt??now):existing?.newProductsStartedAt,reuseInterestSavedAt:intent!=="new-products"?(existing?.reuseInterestSavedAt??now):existing?.reuseInterestSavedAt,createdAt:existing?.createdAt??now,updatedAt:now};
  localStorage.setItem(key(email),JSON.stringify(record));
  window.dispatchEvent(new Event(sellerOnboardingEvent));
  return record;
}

export function hasNewProductIntent(record:SellerOnboardingRecord|null){return Boolean(record?.newProductsStartedAt)}
export function newProductOnboardingStage(){const setup=readSellerSetup(),profile=calculateSellerCompletion(setup).complete&&setup.identityDocumentsSubmitted,eligibility=newProductListingEligibility(setup);return eligibility.eligible?"complete":profile?"categories":"profile"}
export function nextNewProductOnboardingRoute(){const stage=newProductOnboardingStage();return stage==="profile"?"/dashboard/seller-center/setup":stage==="categories"?"/dashboard/seller-center/new-products/categories":"/dashboard/new-products"}
