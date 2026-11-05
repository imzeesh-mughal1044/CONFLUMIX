import type { Metadata } from "next";
import { Suspense } from "react";
import { MyProposalsPage } from "@/components/tasks/my-proposals-page";

export const metadata: Metadata = { title: "My Proposals" };
export default function Page() {
  return (
    <Suspense
      fallback={<div className="route-loading">Loading proposals…</div>}
    >
      <MyProposalsPage />
    </Suspense>
  );
}
