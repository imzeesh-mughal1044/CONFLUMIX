import { Suspense } from "react";
import { DonationBrowser } from "@/components/donations/donation-browser";
import {PageLoadingState} from "@/components/system/async-state";
export default function DonationResourcesPage(){return <Suspense fallback={<PageLoadingState label="Loading donation resources" kind="donation"/>}><DonationBrowser/></Suspense>}
