import { Suspense } from "react";
import { DonationLanding } from "@/components/donations/donation-landing";
export default function DonationsPage(){return <Suspense fallback={<div className="route-loading">Loading Donation Network…</div>}><DonationLanding/></Suspense>}
