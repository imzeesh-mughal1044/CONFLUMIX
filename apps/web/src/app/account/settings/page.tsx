import type { Metadata } from "next";
import { AccountSettingsPage } from "@/components/account/account-settings-page";
export const metadata:Metadata={title:"Account Settings"};
export default function Page(){return <AccountSettingsPage/>}
