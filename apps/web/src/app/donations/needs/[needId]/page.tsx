import { notFound } from "next/navigation";
import { DonationNeedDetail } from "@/components/donations/donation-need-detail";
import { findDonationNeed } from "@/services/donations";
export default async function DonationNeedPage({params}:{params:Promise<{needId:string}>}){const need=findDonationNeed((await params).needId);if(!need)notFound();return <DonationNeedDetail need={need}/>}
