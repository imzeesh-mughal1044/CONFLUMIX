export const donationCategories = [
  { id: "education-books", label: "Education and Books" },
  { id: "clothing-bedding", label: "Clothing and Bedding" },
  { id: "food-essentials", label: "Food and Essential Supplies" },
  { id: "furniture-home", label: "Furniture and Home Items" },
  { id: "electronics-laptops", label: "Electronics and Laptops" },
  { id: "medical-mobility", label: "Medical or Mobility Equipment" },
  { id: "other-resources", label: "Other Supported Resources" },
] as const;

export type DonationCategoryId = (typeof donationCategories)[number]["id"];
export type DonationCondition = "Brand New / Surplus" | "Like New" | "Good / Fully Functional" | "Minor Repair Needed";
export type DonationDonorType = "Individual" | "Business" | "Organization";
export type DonationVerification = "verified" | "unverified" | "unknown";
export type DonationAvailability = "available" | "limited" | "unavailable";
export type DonationUrgency = "priority" | "standard" | "none";
export type DonationSort = "newest" | "title" | "quantity";

export type DonationResource = {
  id: string;
  title: string;
  description: string;
  category: DonationCategoryId;
  condition: DonationCondition;
  totalQuantity: number;
  availableQuantity: number;
  locality: string;
  donorName: string;
  donorType: DonationDonorType;
  verification: DonationVerification;
  availability: DonationAvailability;
  urgency: DonationUrgency;
  surplus: boolean;
  createdAt: string;
  image: string;
  images?: { src: string; alt: string }[];
  unit: string;
  categoryAttributes: { label: string; value: string; safety?: boolean }[];
  donorDescription?: string;
  handoverMethod?: string;
  availabilityWindow?: string;
  handoverInstructions?: string;
};

export type DonationClaimDraft = {
  resourceId: string;
  requestedQuantity: number;
  intendedUse: string;
  supportingInformation: string;
  handoverPreference: string;
  handoverNotes: string;
};

export type DonationClaimStatus = "not-submitted" | "pending" | "approved" | "rejected" | "cancelled" | "completed";

export type DonationManagedClaimStatus = "pending" | "approved" | "rejected";
export type DonationReservationStatus = "not-reserved" | "reserved";
export type DonationHandoverStatus = "not-scheduled" | "scheduled" | "completed";
export type DonationRequesterType = "Individual" | "Organization";

export type DonationClaimDecision = {
  label: string;
  at: string;
  actor: string;
  detail: string;
};

export type DonationManagedClaim = {
  id: string;
  resourceId: string;
  requesterName: string;
  requesterType: DonationRequesterType;
  requesterVerification: DonationVerification;
  requestedQuantity: number;
  intendedUse: string;
  supportingInformation?: string;
  submittedAt: string;
  claimStatus: DonationManagedClaimStatus;
  reservationStatus: DonationReservationStatus;
  handoverStatus: DonationHandoverStatus;
  handoverPreference: string;
  rejectionReason?: string;
  decisionHistory: DonationClaimDecision[];
  reviewFlag?: string;
};

export type DonationHandoverStage = "pending-scheduling" | "time-proposed" | "time-confirmed" | "ready" | "awaiting-confirmation" | "completed" | "issue-reported";
export type DonationHandoverActivity = {
  label: string;
  at: string;
  actor: string;
  status: DonationHandoverStage;
  detail: string;
};
export type DonationHandover = {
  id: string;
  resourceId: string;
  claimId: string;
  reservationReference: string;
  donorName: string;
  donorType: DonationDonorType;
  receiverName: string;
  receiverType: DonationRequesterType;
  quantity: number;
  method: string;
  locality: string;
  locationGuidance: string;
  availabilityWindow: string;
  instructions: string;
  status: DonationHandoverStage;
  proposedSchedule?: string;
  confirmedSchedule?: string;
  timezone: string;
  confirmationMethod: "unsupported";
  issueSummary?: string;
  completedAt?: string;
  activity: DonationHandoverActivity[];
};

export type DonationNeed = {
  id: string;
  title: string;
  category: DonationCategoryId;
  quantity: number;
  unit: string;
  locality: string;
  requester: string;
  verification: DonationVerification;
  urgency: "urgent" | "standard";
  status: "open" | "partially-matched";
  description: string;
  intendedUse: string;
  requesterType: "Individual" | "Organization";
  neededBy?: string;
  urgencyContext?: string;
  categoryAttributes: { label: string; value: string }[];
  handoverRequirement: string;
  handlingConstraints?: string;
  createdAt: string;
};

export type DonationOrganization = {
  id: string;
  name: string;
  locality: string;
  categories: DonationCategoryId[];
  description: string;
  verified: boolean;
};

export type DonationCompatibility = "compatible" | "requires-review" | "incompatible" | "unknown";
export type DonationQuantityCoverage = "full" | "partial" | "insufficient";
export type DonationPotentialMatch = {
  id: string;
  resource: DonationResource;
  need: DonationNeed;
  categoryCompatibility: DonationCompatibility;
  quantityCoverage: DonationQuantityCoverage;
  localityCompatibility: DonationCompatibility;
  handoverCompatibility: DonationCompatibility;
  potentialQuantity: number;
  remainingQuantity: number;
  explanation: string;
  reviewNotes: string[];
};
