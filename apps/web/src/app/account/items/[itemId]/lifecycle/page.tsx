import type { Metadata } from "next";
import { ItemLifecyclePage } from "@/components/account/item-lifecycle-page";
export const metadata:Metadata={title:"Product Ownership & Lifecycle"};
export default async function Page({params}:{params:Promise<{itemId:string}>}){const {itemId}=await params;return <ItemLifecyclePage itemId={itemId}/>}
