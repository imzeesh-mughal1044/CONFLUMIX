import Link from "next/link";
import { PublicShell } from "@/components/public/public-shell";

export default function NotFound(){return <PublicShell><div className="donation-handover-state page-container"><p className="section-kicker">Donation handover</p><h1>Handover record not found</h1><p>This identifier does not match an available demonstration handover. No protected details were disclosed.</p><Link className="button button--primary" href="/dashboard/donations/claims">Return to donation claims</Link></div></PublicShell>}
