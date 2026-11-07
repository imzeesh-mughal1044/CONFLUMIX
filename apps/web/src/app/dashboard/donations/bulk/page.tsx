import type { Metadata } from "next";
import { DonationBulkManagement } from "@/components/donations/donation-bulk-management";

export const metadata:Metadata={title:"Bulk Donation Management"};
export default function Page(){return <DonationBulkManagement/>}
