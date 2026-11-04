import type { Metadata } from "next";
import { BulkPreviewPage } from "@/components/seller/bulk-preview-page";
export const metadata: Metadata = { title: "Review Bulk Changes" };
export default function Page(){ return <BulkPreviewPage/>; }
