import type { Metadata } from "next";
import { VerificationPage } from "@/components/account/verification-page";
export const metadata:Metadata={title:"Verification Status"};
export default function Page(){return <VerificationPage/>}
