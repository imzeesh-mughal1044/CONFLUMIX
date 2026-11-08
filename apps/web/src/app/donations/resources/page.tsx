import { Suspense } from "react";
import { DonationBrowser } from "@/components/donations/donation-browser";
export default function DonationResourcesPage(){return <Suspense fallback={<div className="route-loading">Loading donation resources…</div>}><DonationBrowser/></Suspense>}
