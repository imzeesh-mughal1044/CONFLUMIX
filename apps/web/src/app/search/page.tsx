import type { Metadata } from "next";
import { Suspense } from "react";
import { DiscoveryExplorer } from "@/components/public/discovery-explorer";

export const metadata: Metadata = { title: "Search" };
export default function SearchPage() { return <Suspense fallback={<div className="route-loading">Preparing search…</div>}><DiscoveryExplorer kind="search"/></Suspense>; }
