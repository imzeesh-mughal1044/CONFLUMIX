import { donationResources } from "@/data/donations";
import { donationNeeds } from "@/data/donations";
import { donationCategories, type DonationAvailability, type DonationCondition, type DonationDonorType, type DonationResource, type DonationSort, type DonationUrgency, type DonationVerification } from "@/types/donations";

export const donationCategoryLabel = (id: string) => donationCategories.find((item) => item.id === id)?.label ?? "Supported resource";
export const donationLocalities = [...new Set(donationResources.map((item) => item.locality))].sort();
export const donationConditions = [...new Set(donationResources.map((item) => item.condition))] as DonationCondition[];
export const donationDonorTypes = [...new Set(donationResources.map((item) => item.donorType))] as DonationDonorType[];
export const findDonationResource = (resourceId: string) => donationResources.find((item) => item.id === resourceId);
export const findDonationNeed = (needId: string) => donationNeeds.find((item) => item.id === needId);

export type DonationQuery = { q?:string; category?:string; condition?:DonationCondition; availability?:DonationAvailability; locality?:string; donorType?:DonationDonorType; verification?:DonationVerification; urgency?:DonationUrgency; sort?:DonationSort };

export function browseDonationResources(query: DonationQuery): DonationResource[] {
  const search = query.q?.trim().toLocaleLowerCase();
  const filtered = donationResources.filter((item) => {
    const searchable = [item.title,item.description,donationCategoryLabel(item.category),item.locality,item.donorName].join(" ").toLocaleLowerCase();
    return (!search || searchable.includes(search)) && (!query.category || item.category===query.category) && (!query.condition || item.condition===query.condition) && (!query.availability || item.availability===query.availability) && (!query.locality || item.locality.toLocaleLowerCase()===query.locality.toLocaleLowerCase()) && (!query.donorType || item.donorType===query.donorType) && (!query.verification || item.verification===query.verification) && (!query.urgency || item.urgency===query.urgency);
  });
  return [...filtered].sort((a,b) => query.sort === "title" ? a.title.localeCompare(b.title) : query.sort === "quantity" ? b.availableQuantity-a.availableQuantity || a.title.localeCompare(b.title) : b.createdAt.localeCompare(a.createdAt) || a.title.localeCompare(b.title));
}
