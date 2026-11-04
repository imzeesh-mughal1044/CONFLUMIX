import type { Metadata } from "next";
import { PublicProductPage } from "@/components/products/public-product-page";
import { findProduct } from "@/services/products";

type PageProps = { params: Promise<{ productId: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { productId } = await params;
  const product = findProduct(productId);
  return { title: product ? `${product.title} | CONFLUMIX` : "Product not found | CONFLUMIX", description: product?.description };
}

export default async function ProductPage({ params }: PageProps) {
  const { productId } = await params;
  const product = findProduct(productId);
  return <PublicProductPage identifier={productId} initial={product}/>;
}
