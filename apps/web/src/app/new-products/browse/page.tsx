import { Suspense } from "react";
import { ProductBrowser } from "@/components/products/product-browser";
import {PageLoadingState} from "@/components/system/async-state";

export default function BrowseProductsPage() { return <Suspense fallback={<PageLoadingState label="Loading new products" kind="product"/>}><ProductBrowser/></Suspense>; }
