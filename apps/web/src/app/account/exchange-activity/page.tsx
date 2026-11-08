import type { Metadata } from "next";
import { ExchangeActivityPage } from "@/components/account/exchange-activity-page";
export const metadata:Metadata={title:"My Exchange Activity"};
export default function Page(){return <ExchangeActivityPage/>}
