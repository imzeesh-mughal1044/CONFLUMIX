import { emailPattern } from "@/lib/validation";
import { readFrontendSession } from "@/lib/auth";
import type { ProductCategory } from "@/types/products";
import type { ListingEligibility, SellerCompletion, SellerSetup } from "@/types/seller-setup";

export const sellerSetupKey = "conflumix:seller-setup:v2";
export const sellerDeclaration = "I declare that the information I have provided is accurate to the best of my knowledge, that I am authorized to submit the information and documents, and that I will follow the applicable CONFLUMIX seller policies.";
export const cnicPattern = /^\d{5}-\d{7}-\d$/;
export const phonePattern = /^(?:\+92|0)?3\d{9}$/;
export const emptySellerSetup: SellerSetup = {
  sellerType: "individual", sellerName: "", email: "", emailVerification: "unverified", phone: "", phoneVerification: "unverified", storeName: "", description: "", publicContact: "", storeAddress: "", city: "", locality: "DHA Phase 6", businessName: "", businessType: "", representativePosition: "", businessEmail: "", businessPhone: "", businessAddress: "", businessRegistration: "", deliveryOptions: [], returnPolicy: "", paymentMethod: "", termsAccepted: false, declarationAccepted: false, identityDocumentsSubmitted: false, identityStatus: "not-submitted", sellerVerification: "pending", accountCreatedAt: "2026-10-01T00:00:00.000Z", sellerRating: null, totalReviews: 0, newProductsEnabled: false, reuseEnabled: false, productCategories: [], productSubcategories: {}, selectedAttributes: {}, categoryCustomAttributes: {}, reuseCategories: [], customCategories: [], customSubcategories: [],
};

export function sellerSetupKeyFor(email:string){return `${sellerSetupKey}:${encodeURIComponent(email.trim().toLowerCase())}`}

export function readSellerSetup(): SellerSetup {
  try { const email=readFrontendSession()?.email;if(!email)return { ...emptySellerSetup };const raw = localStorage.getItem(sellerSetupKeyFor(email)); return raw ? { ...emptySellerSetup, ...JSON.parse(raw) } : { ...emptySellerSetup }; }
  catch { return { ...emptySellerSetup }; }
}
export function saveSellerSetup(setup: SellerSetup) { const email=readFrontendSession()?.email;if(!email)throw new Error("Sign in before saving seller information.");localStorage.setItem(sellerSetupKeyFor(email), JSON.stringify({ ...setup, updatedAt: new Date().toISOString() })); }

export function calculateSellerCompletion(setup: SellerSetup, identityReady = setup.identityDocumentsSubmitted): SellerCompletion {
  const missing: SellerCompletion["missing"] = [];
  let total = 0;
  const require = (condition: unknown, key: string, label: string, step: number) => { total += 1; if (!condition) missing.push({ key, label, step }); };
  require(setup.sellerName.trim(), "sellerName", "Owner or representative name", 0);
  require(emailPattern.test(setup.email.trim()), "email", "Valid email address", 0);
  require(phonePattern.test(setup.phone.replace(/[\s-]/g, "")), "phone", "Valid phone number", 0);
  require(identityReady, "identityDocuments", "CNIC number and both document images", 0);
  require(setup.storeName.trim(), "storeName", "Store name", 1);
  require(setup.storeAddress.trim(), "storeAddress", "Store address", 1);
  require(setup.city.trim(), "city", "City", 1);
  require(setup.locality.trim(), "locality", "Area", 1);
  require(setup.publicContact.trim(), "publicContact", "Support number", 1);
  if (setup.sellerType === "business") {
    require(setup.businessName.trim(), "businessName", "Company or business name", 1);
    require(setup.businessType, "businessType", "Business type", 1);
    require(setup.representativePosition, "representativePosition", "Representative position", 1);
    require(emailPattern.test(setup.businessEmail.trim()), "businessEmail", "Valid business email", 1);
    require(phonePattern.test(setup.businessPhone.replace(/[\s-]/g, "")), "businessPhone", "Valid business phone", 1);
    require(setup.businessAddress.trim(), "businessAddress", "Business address", 1);
  }
  require(setup.deliveryOptions.length, "deliveryOptions", "At least one delivery preference", 2);
  require(setup.returnPolicy.trim(), "returnPolicy", "Return or exchange policy", 2);
  require(setup.paymentMethod, "paymentMethod", "Preferred payment method", 2);
  require(setup.termsAccepted, "termsAccepted", "Terms acceptance", 2);
  require(setup.declarationAccepted, "declarationAccepted", "Seller declaration", 2);
  return { complete: missing.length === 0, percentage: Math.round(((total - missing.length) / Math.max(1, total)) * 100), missing };
}

export function sellerIdentityComplete(setup: SellerSetup) { return calculateSellerCompletion(setup).complete; }
export function newProductSetupComplete(setup: SellerSetup) { return newProductListingEligibility(setup).eligible; }
export function reuseSetupComplete(setup: SellerSetup) { return calculateSellerCompletion(setup).complete && setup.reuseEnabled && setup.reuseCategories.length > 0; }
export function newProductListingEligibility(setup: SellerSetup): ListingEligibility {
  const profileComplete = calculateSellerCompletion(setup).complete && setup.identityDocumentsSubmitted;
  const categoriesComplete = setup.newProductsEnabled && setup.productCategories.length > 0;
  const missing = profileComplete ? [] : calculateSellerCompletion(setup).missing.map((item) => item.label);
  if (!setup.identityDocumentsSubmitted) missing.push("Completed seller profile submission");
  if (!categoriesComplete) missing.push("At least one configured New Product category");
  return { eligible: profileComplete && categoriesComplete, profileComplete, categoriesComplete, missing: Array.from(new Set(missing)) };
}
export function completeSellerProfile(setup: SellerSetup): SellerSetup { return { ...setup, identityDocumentsSubmitted: true, identityStatus: "profile-complete", sellerVerification: "complete", verificationReason: undefined, submittedAt: new Date().toISOString(), termsAcceptedAt: setup.termsAcceptedAt ?? new Date().toISOString() }; }
export function applySellerReview(setup: SellerSetup, decision: "accept" | "reject", reason?: string): SellerSetup {
  if (decision === "accept" && calculateSellerCompletion(setup).complete) return { ...setup, identityStatus: "accepted", sellerVerification: "verified", verificationReason: undefined };
  return { ...setup, identityStatus: decision === "reject" ? "requires-changes" : setup.identityStatus, sellerVerification: decision === "reject" ? "rejected" : "pending", verificationReason: reason };
}
export function resetMaterialVerification(setup: SellerSetup): SellerSetup { return { ...setup, sellerVerification: "pending", identityStatus: setup.identityDocumentsSubmitted ? "pending-review" : "not-submitted" }; }
export function modeStatus(enabled: boolean, complete: boolean, hasData: boolean) { return complete ? "Complete" : enabled || hasData ? "Incomplete" : "Not started"; }
export function configuredSubcategoryCount(setup: SellerSetup) { return Object.values(setup.productSubcategories).reduce((total, values) => total + (values?.length ?? 0), 0); }
export function isConfiguredCategory(setup: SellerSetup, category: ProductCategory) { return setup.productCategories.includes(category); }
