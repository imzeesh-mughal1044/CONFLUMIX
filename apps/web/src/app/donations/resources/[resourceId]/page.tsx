import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DonationResourceDetail } from "@/components/donations/donation-resource-detail";
import { findDonationResource } from "@/services/donations";

type PageProps={params:Promise<{resourceId:string}>;searchParams:Promise<{returnTo?:string|string[]}>};

export async function generateMetadata({params}:PageProps):Promise<Metadata>{const resource=findDonationResource((await params).resourceId);return{title:resource?.title??"Donation resource not found",description:resource?.description}}

export default async function DonationResourcePage({params,searchParams}:PageProps){const resource=findDonationResource((await params).resourceId);if(!resource)notFound();const requested=(await searchParams).returnTo;const candidate=Array.isArray(requested)?requested[0]:requested;const returnTo=candidate?.startsWith("/donations/resources")&&!candidate.startsWith("//")?candidate:"/donations/resources";return <DonationResourceDetail resource={resource} returnTo={returnTo}/>}
