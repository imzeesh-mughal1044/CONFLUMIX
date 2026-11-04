import type { Metadata } from "next";
import { ProductListingForm } from "@/components/products/product-listing-form";

export const metadata: Metadata = { title: "Create New Product Listing", description: "Create a New Product Marketplace listing." };
export default function CreateProductListingPage() { return <ProductListingForm mode="create"/>; }
