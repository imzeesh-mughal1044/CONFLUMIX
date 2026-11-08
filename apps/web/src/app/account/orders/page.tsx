import type { Metadata } from "next";
import { Suspense } from "react";
import { OrdersTransactionsPage } from "@/components/account/orders-transactions-page";
export const metadata:Metadata={title:"Orders & Transactions"};
export default function Page(){return <Suspense fallback={null}><OrdersTransactionsPage/></Suspense>}
