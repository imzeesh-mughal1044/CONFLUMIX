import type { Metadata } from "next";
import { ProductListingForm } from "@/components/products/product-listing-form";
import { findProduct } from "@/services/products";

type PageProps = { params: Promise<{ productId: string }> };
export async function generateMetadata({ params }: PageProps): Promise<Metadata> { const product = findProduct((await params).productId); return { title: product ? `Edit ${product.title}` : "Listing not found" }; }
export default async function EditProductListingPage({ params }: PageProps) { const { productId } = await params; const product = findProduct(productId); return <ProductListingForm mode="edit" product={product} identifier={productId}/>; }
