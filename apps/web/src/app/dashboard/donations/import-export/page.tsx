import type { Metadata } from "next";
import { DonationImportExport } from "@/components/donations/donation-import-export";

export const metadata:Metadata={title:"Donation Import and Export"};
export default function Page(){return <DonationImportExport/>}
