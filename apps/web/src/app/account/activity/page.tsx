import type { Metadata } from "next";
import { ActivityPage } from "@/components/account/activity-page";
export const metadata:Metadata={title:"My Activity"};
export default function Page(){return <ActivityPage/>}
