import type { Metadata } from "next";
import { SellerDashboardPage } from "@/components/seller/seller-dashboard-page";

export const metadata: Metadata = { title: "New Product Seller Dashboard" };
export default function Page() { return <SellerDashboardPage/>; }
