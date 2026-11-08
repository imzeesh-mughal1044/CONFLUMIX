import type { Metadata } from "next";
import { PublicUserProfile } from "@/components/account/public-user-profile";
export const metadata:Metadata={title:"Public User Profile"};
export default async function Page({params}:{params:Promise<{userId:string}>}){const {userId}=await params;return <PublicUserProfile userId={decodeURIComponent(userId)}/>}
