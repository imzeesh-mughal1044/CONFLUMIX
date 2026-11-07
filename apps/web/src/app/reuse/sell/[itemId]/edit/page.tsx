import { ReuseListingForm } from "@/components/reuse/reuse-listing-form";
export default async function Page({
  params,
}: {
  params: Promise<{ itemId: string }>;
}) {
  const { itemId } = await params;
  return <ReuseListingForm mode="edit" itemId={itemId} />;
}
