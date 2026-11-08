import type { Metadata } from "next";
import { DonationClaimsManagement } from "@/components/donations/donation-claims-management";

export const metadata: Metadata = { title: "Manage Donation Claims" };

export default function Page() {
  return <DonationClaimsManagement />;
}
