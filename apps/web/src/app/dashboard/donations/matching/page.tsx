import type { Metadata } from "next";
import { DonationMatchingPage } from "@/components/donations/donation-matching-page";

export const metadata:Metadata={title:"Donation urgency and cause matching"};
export default function Page(){return <DonationMatchingPage/>}
