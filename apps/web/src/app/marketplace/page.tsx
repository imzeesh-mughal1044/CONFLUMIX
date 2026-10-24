import type { Metadata } from "next";
import { Suspense } from "react";
import { DiscoveryExplorer } from "@/components/public/discovery-explorer";

export const metadata: Metadata = { title: "Marketplace" };
export default function MarketplacePage() { return <Suspense fallback={<div className="route-loading">Opening marketplace…</div>}><DiscoveryExplorer kind="marketplace"/></Suspense>; }
