import type { Metadata } from "next";
import { SellerSetupPage } from "@/components/seller/seller-setup-page";
export const metadata: Metadata = { title: "Set Up Your Seller Profile" };
export default function Page() { return <SellerSetupPage/>; }
