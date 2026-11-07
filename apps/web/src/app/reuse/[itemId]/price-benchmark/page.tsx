import { ReusePriceBenchmarkPage } from "@/components/reuse/reuse-price-benchmark-page";

export default async function Page({
  params,
}: {
  params: Promise<{ itemId: string }>;
}) {
  const { itemId } = await params;
  return <ReusePriceBenchmarkPage itemId={itemId} />;
}
