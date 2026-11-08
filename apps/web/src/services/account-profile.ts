import type { AuthSession } from "@/lib/auth";
import type { UserProfile } from "@/types/account";
import { newProductListingEligibility, readSellerSetup, reuseSetupComplete } from "./seller-setup";
import { storeIdForName } from "./storefront";

const key = (email: string) => `conflumix:account-profile:${encodeURIComponent(email.toLowerCase())}:v1`;
const publicKey=(id:string)=>`conflumix:public-profile:${id}:v1`;
export const profileEvent = "conflumix-account-profile";

export function publicUserId(email:string){let hash=2166136261;for(const char of email.trim().toLowerCase()){hash^=char.charCodeAt(0);hash=Math.imul(hash,16777619)}return `user-${(hash>>>0).toString(36)}`}
export function defaultProfile(session: AuthSession): UserProfile {
  return { email: session.email, fullName: session.fullName, displayName: session.fullName, locality: "", bio: "", phone: "", avatarUrl: "", publicProfileEnabled:false, createdAt: "", updatedAt: "" };
}

export function readUserProfile(session: AuthSession): UserProfile {
  if (typeof window === "undefined") return defaultProfile(session);
  try {
    const saved = JSON.parse(localStorage.getItem(key(session.email)) ?? "null") as Partial<UserProfile> | null;
    return { ...defaultProfile(session), ...saved, email: session.email };
  } catch { return defaultProfile(session); }
}

export function saveUserProfile(profile: UserProfile) {
  const now=new Date().toISOString(),next = { ...profile, createdAt:profile.createdAt||now, updatedAt: now };
  localStorage.setItem(key(profile.email), JSON.stringify(next));
  const id=publicUserId(profile.email);
  if(next.publicProfileEnabled){const setup=readSellerSetup();localStorage.setItem(publicKey(id),JSON.stringify({ownerEmail:next.email,displayName:next.displayName,locality:next.locality,bio:next.bio,avatarUrl:next.avatarUrl,newProductSeller:newProductListingEligibility(setup).eligible,reuseSeller:reuseSetupComplete(setup),storeId:setup.storeName?storeIdForName(setup.storeName):""}))}else localStorage.removeItem(publicKey(id));
  const session = { email: profile.email, fullName: profile.fullName };
  localStorage.setItem("conflumix.frontend.session", JSON.stringify(session));
  window.dispatchEvent(new Event(profileEvent));
  return next;
}

export function hasSavedProfile(session:AuthSession){return typeof window!=="undefined"&&Boolean(localStorage.getItem(key(session.email)))}
export function readPublicUserProfile(id:string){if(typeof window==="undefined")return null;try{return JSON.parse(localStorage.getItem(publicKey(id))??"null") as {ownerEmail:string;displayName:string;locality:string;bio:string;avatarUrl:string;newProductSeller:boolean;reuseSeller:boolean;storeId:string}|null}catch{return null}}

export function profileCompletion(profile: UserProfile) {
  const fields = [profile.fullName, profile.displayName, profile.locality, profile.bio, profile.avatarUrl];
  return Math.round((fields.filter((value) => value.trim()).length / fields.length) * 100);
}

