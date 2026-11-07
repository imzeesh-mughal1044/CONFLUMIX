import { ReuseDetailPage } from "@/components/reuse/reuse-detail-page";

export default async function ReuseItemPage({ params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params;
  return <ReuseDetailPage itemId={itemId}/>;
}
