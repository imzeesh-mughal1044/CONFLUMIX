import { Suspense } from "react";
import { ReuseBrowser } from "@/components/reuse/reuse-browser";
import {PageLoadingState} from "@/components/system/async-state";

export default function ReuseBrowsePage() { return <Suspense fallback={<PageLoadingState label="Loading Reuse listings" kind="reuse"/>}><ReuseBrowser/></Suspense>; }
