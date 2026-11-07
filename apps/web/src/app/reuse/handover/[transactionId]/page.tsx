import { ReuseHandoverPage } from "@/components/reuse/reuse-handover-page";

export default async function Page({
  params,
}: {
  params: Promise<{ transactionId: string }>;
}) {
  const { transactionId } = await params;
  return <ReuseHandoverPage transactionId={transactionId} />;
}
