import { Suspense } from "react";
import { ProductBrowser } from "@/components/products/product-browser";

export default function BrowseProductsPage() { return <Suspense fallback={<div className="route-loading">Loading products…</div>}><ProductBrowser/></Suspense>; }
