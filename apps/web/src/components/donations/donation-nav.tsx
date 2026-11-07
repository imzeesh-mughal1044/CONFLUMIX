"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  ["Explore Resources","/donations/resources"],["Find Needed Resources","/donations?section=needs"],["Donate a Resource","/auth/required?next=/donations/new"],["Post a Need","/auth/required?next=/donations/needs/new"],["My Donations","/auth/required?next=/dashboard/donations"],["My Requests","/auth/required?next=/dashboard/donations/requests"],["Handover Activities","/auth/required?next=/dashboard/donations/handovers"],["Organization Dashboard","/auth/required?next=/dashboard/donations/organization"],
] as const;

export function DonationNav(){const pathname=usePathname();return <nav className="donation-nav" aria-label="Donation Network"><div className="page-container">{items.map(([label,href],index)=><Link key={label} href={href} aria-current={index===0&&pathname==="/donations/resources"?"page":undefined} className={index===0&&pathname==="/donations/resources"?"is-active":""}>{label}{index>1&&<small>{index===7?"Eligibility required":"Sign in"}</small>}</Link>)}</div></nav>}
