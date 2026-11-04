import type { Metadata } from "next";
import { StorefrontPage } from "@/components/store/storefront-page";

export const metadata: Metadata = { title: "Seller Storefront" };
export default async function Page({ params }: { params: Promise<{ storeId: string }> }) {
  return <StorefrontPage storeId={(await params).storeId}/>;
}
