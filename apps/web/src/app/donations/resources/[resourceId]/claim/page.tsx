import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DonationResourceClaim } from "@/components/donations/donation-resource-claim";
import { findDonationResource } from "@/services/donations";

type PageProps = { params: Promise<{ resourceId: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resource = findDonationResource((await params).resourceId);
  return {
    title: resource ? `Claim ${resource.title}` : "Donation resource not found",
    description: resource ? `Request ${resource.title} through the CONFLUMIX Donation Network.` : undefined,
  };
}

export default async function DonationResourceClaimPage({ params }: PageProps) {
  const resource = findDonationResource((await params).resourceId);
  if (!resource) notFound();
  return <DonationResourceClaim resource={resource} />;
}
