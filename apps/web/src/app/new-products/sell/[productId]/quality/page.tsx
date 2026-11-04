import type { Metadata } from "next";
import { ProductQualityCheck } from "@/components/products/product-quality-check";
import { findProduct } from "@/services/products";

type PageProps = { params: Promise<{ productId: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { productId } = await params;
  const product = findProduct(productId);
  return { title: product ? `Quality Check: ${product.title}` : "Listing Quality Check" };
}

export default async function ProductQualityPage({ params }: PageProps) {
  const { productId } = await params;
  return <ProductQualityCheck identifier={productId} product={findProduct(productId)} />;
}
