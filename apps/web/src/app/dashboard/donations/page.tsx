import type { Metadata } from "next";
import { DonationDashboardPage } from "@/components/donations/donation-dashboard-page";

export const metadata:Metadata={title:"Donation Dashboard"};
export default function Page(){return <DonationDashboardPage/>}
