import type { Metadata } from "next";
import { OrdersPage } from "@/components/seller/orders-page";
export const metadata:Metadata={title:"New Product Orders"};
export default function Page(){return <OrdersPage/>}
