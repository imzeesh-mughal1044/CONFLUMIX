import type { Metadata } from "next";
import { Suspense } from "react";
import { TransitionConfirmationPage } from "@/components/account/transition-confirmation-page";
export const metadata:Metadata={title:"Cross-Mode Transition Confirmation"};
export default async function Page({params}:{params:Promise<{itemId:string}>}){const {itemId}=await params;return <Suspense fallback={null}><TransitionConfirmationPage itemId={itemId}/></Suspense>}
