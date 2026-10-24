import type { Metadata } from "next";
import { Suspense } from "react";
import { DiscoveryExplorer } from "@/components/public/discovery-explorer";

export const metadata: Metadata = { title: "Local discovery" };
export default function DiscoverPage() { return <Suspense fallback={<div className="route-loading">Preparing local discovery…</div>}><DiscoveryExplorer kind="discover"/></Suspense>; }
