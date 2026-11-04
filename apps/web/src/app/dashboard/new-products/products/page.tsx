import type { Metadata } from "next";
import { ListingManagementPage } from "@/components/seller/listing-management-page";
export const metadata: Metadata = { title: "Manage New Product Listings" };
export default function Page() { return <ListingManagementPage/>; }
