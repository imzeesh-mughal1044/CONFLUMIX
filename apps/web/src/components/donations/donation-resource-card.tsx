"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { DonationResource } from "@/types/donations";
import { donationCategoryLabel } from "@/services/donations";

export function DonationResourceCard({resource,returnTo,onView}:{resource:DonationResource;returnTo?:string;onView?:(resource:DonationResource,trigger:HTMLButtonElement)=>void}){
  void onView;
  const pathname=usePathname(),params=useSearchParams();
  const preservedReturn=returnTo??(pathname==="/donations/resources"?`${pathname}${params.size?`?${params.toString()}`:""}`:"/donations/resources");
  const href=`/donations/resources/${resource.id}?returnTo=${encodeURIComponent(preservedReturn)}`;
  return <article className="donation-resource-card"><div className="donation-resource-card__image"><Image src={resource.image} alt="" fill sizes="(max-width: 767px) 50vw, (max-width: 1200px) 33vw, 22vw"/><span className={`donation-availability donation-availability--${resource.availability}`}>{resource.availability}</span></div><div className="donation-resource-card__body"><p className="donation-card-category">{donationCategoryLabel(resource.category)}</p><h3>{resource.title}</h3><dl><div><dt>Condition</dt><dd>{resource.condition}</dd></div><div><dt>Available</dt><dd>{resource.availableQuantity} of {resource.totalQuantity}</dd></div><div><dt>Locality</dt><dd>{resource.locality}</dd></div></dl><div className="donation-donor"><span>{resource.donorType}</span><strong>{resource.donorName}</strong>{resource.verification==="verified"?<small>Verified record</small>:<small>Verification not confirmed</small>}</div><Link className="button button--secondary" href={href}>View Details</Link></div></article>
}
