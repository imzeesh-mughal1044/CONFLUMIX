import { Suspense } from "react";
import { ManageReuseListings } from "@/components/reuse/manage-reuse-listings";

export default function Page() {
  return (
    <Suspense fallback={<div className="route-loading" role="status">Loading Reuse listings…</div>}>
      <ManageReuseListings />
    </Suspense>
  );
}
