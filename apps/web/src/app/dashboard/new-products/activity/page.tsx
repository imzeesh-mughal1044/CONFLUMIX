import type { Metadata } from "next";
import { OperationHistoryPage } from "@/components/seller/operation-history-page";
export const metadata:Metadata={title:"Operation History"};
export default function Page(){return <OperationHistoryPage/>}
