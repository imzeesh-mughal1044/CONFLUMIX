import type { Metadata } from "next";
import { ShopSectionsPage } from "@/components/seller/shop-sections-page";

export const metadata: Metadata = { title: "Shop Sections", description: "Organize New Product store listings into seller-defined sections." };

export default function Page() { return <ShopSectionsPage/>; }
