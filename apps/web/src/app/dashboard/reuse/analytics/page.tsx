import { Suspense } from "react";
import { ReuseSellerAnalytics } from "@/components/reuse/reuse-seller-analytics";

export default function Page() {
  return (
    <Suspense fallback={<div className="route-loading" role="status">Loading Reuse analytics…</div>}>
      <ReuseSellerAnalytics />
    </Suspense>
  );
}
