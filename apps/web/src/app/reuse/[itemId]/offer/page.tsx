import { Suspense } from "react";
import { ReuseOfferForm } from "@/components/reuse/reuse-offer-form";

export default async function Page({
  params,
}: {
  params: Promise<{ itemId: string }>;
}) {
  const { itemId } = await params;
  return (
    <Suspense
      fallback={
        <div className="route-loading" role="status">
          Loading offer context…
        </div>
      }
    >
      <ReuseOfferForm itemId={itemId} />
    </Suspense>
  );
}
