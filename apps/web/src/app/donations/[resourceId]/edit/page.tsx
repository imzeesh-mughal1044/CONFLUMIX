import { notFound } from "next/navigation";
import { DonationResourceForm } from "@/components/donations/donation-resource-form";
import { findDonationResource } from "@/services/donations";
export default async function EditDonationResourcePage({params}:{params:Promise<{resourceId:string}>}){const resource=findDonationResource((await params).resourceId);if(!resource)notFound();return <DonationResourceForm resource={resource}/>}
