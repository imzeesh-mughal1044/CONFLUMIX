import type { Metadata } from "next";
import { OrderDetailsPage } from "@/components/seller/order-details-page";
export const metadata:Metadata={title:"Order Details"};
export default async function Page({params}:{params:Promise<{orderId:string}>}){return <OrderDetailsPage orderId={(await params).orderId}/>}
