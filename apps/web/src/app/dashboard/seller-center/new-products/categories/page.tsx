import type { Metadata } from "next";
import { CategoryConfigurationPage } from "@/components/seller/category-configuration-page";
export const metadata: Metadata = { title: "New Product Categories & Attributes" };
export default function Page(){ return <CategoryConfigurationPage/>; }
