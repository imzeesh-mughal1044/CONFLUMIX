import { ReuseOfferStatusPage } from "@/components/reuse/reuse-offer-status-page";
export default async function Page({
  params,
}: {
  params: Promise<{ offerId: string }>;
}) {
  const { offerId } = await params;
  return <ReuseOfferStatusPage offerId={offerId} />;
}
