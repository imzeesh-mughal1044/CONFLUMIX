import { Suspense } from "react";
import { ReuseBrowser } from "@/components/reuse/reuse-browser";

export default function ReuseBrowsePage() { return <Suspense fallback={<div className="route-loading">Loading Reuse listings…</div>}><ReuseBrowser/></Suspense>; }
