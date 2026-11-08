import Link from "next/link";
import { PublicShell } from "@/components/public/public-shell";
import { DonationNav } from "@/components/donations/donation-nav";

export default function ResourceNotFound(){return <PublicShell><DonationNav/><main className="donation-detail-state page-container"><p className="section-kicker">Resource unavailable</p><h1>We couldn’t find this donation resource.</h1><p>The link may be incorrect, or the demonstration resource is no longer in the current catalogue.</p><Link className="button button--primary" href="/donations/resources">Return to Resources</Link></main></PublicShell>}
