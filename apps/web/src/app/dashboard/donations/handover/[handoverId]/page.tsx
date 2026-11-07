import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DonationHandoverPage } from "@/components/donations/donation-handover-page";
import { findDonationHandover } from "@/data/donation-handovers";

type PageProps = { params: Promise<{ handoverId: string }> };

export async function generateMetadata({params}:PageProps):Promise<Metadata>{
  const handover=findDonationHandover((await params).handoverId);
  return {title:handover?`Donation handover ${handover.id}`:"Donation handover not found"};
}

export default async function Page({params}:PageProps){
  const handover=findDonationHandover((await params).handoverId);
  if(!handover)notFound();
  return <DonationHandoverPage handover={handover}/>;
}
