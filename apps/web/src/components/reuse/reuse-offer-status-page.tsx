"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { PublicShell } from "@/components/public/public-shell";
import { readAuthSession, type AuthSession } from "@/lib/auth";
import { getEditableReuseListing } from "@/services/reuse";
import { getReuseOffer, isOfferParticipant, reuseOfferEvent } from "@/services/reuse-offers";
import type { ReuseListing, ReuseOffer } from "@/types/reuse";

const money = new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 2 });
const date = new Intl.DateTimeFormat("en-PK", { dateStyle: "medium", timeStyle: "short" });

type PageState = "loading" | "ready" | "unavailable" | "listing-missing" | "error";

export function ReuseOfferStatusPage({ offerId }: { offerId: string }) {
  const router = useRouter();
  const [offer, setOffer] = useState<ReuseOffer | null>(null);
  const [listing, setListing] = useState<ReuseListing | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [state, setState] = useState<PageState>("loading");
  const load = useCallback(async () => {
    if (!/^offer-[a-z0-9-]+$/i.test(offerId)) { setState("unavailable"); return; }
    setState("loading");
    try {
      const current = await readAuthSession();
      if (!current) { router.replace(`/auth/login?next=${encodeURIComponent(`/reuse/offers/${offerId}`)}`); return; }
      const record = getReuseOffer(offerId);
      if (!record || !isOfferParticipant(record, current.email)) { setState("unavailable"); return; }
      const item = getEditableReuseListing(record.listingId);
      setSession(current);
      setOffer(record);
      setListing(item);
      setState(item ? "ready" : "listing-missing");
    } catch { setState("error"); }
  }, [offerId, router]);
  useEffect(() => { queueMicrotask(() => void load()); const refresh = () => void load(); window.addEventListener(reuseOfferEvent, refresh); window.addEventListener("storage", refresh); return () => { window.removeEventListener(reuseOfferEvent, refresh); window.removeEventListener("storage", refresh); }; }, [load]);

  if (state === "loading") return <PublicShell><div className="route-loading" role="status">Loading private offer and reservation status…</div></PublicShell>;
  if (state === "unavailable") return <PublicShell><StatusBoundary title="Offer unavailable" text="This private offer cannot be found or you do not have permission to view it."/></PublicShell>;
  if (state === "error") return <PublicShell><StatusBoundary title="Status could not be loaded" text="The browser-local offer service did not respond. No offer state was changed." retry={() => void load()}/></PublicShell>;
  if (state === "listing-missing" || !listing || !offer) return <PublicShell><StatusBoundary title="Related listing unavailable" text="The authorized offer record exists, but its related listing cannot be resolved. Negotiation actions are disabled." offerId={offerId}/></PublicShell>;

  const last = offer.history.at(-1);
  const isTurn = offer.status === "pending" && last?.actorEmail.toLowerCase() !== session?.email.toLowerCase();
  const displayState = offer.status === "pending" && last?.kind === "counteroffer" ? "Counteroffer pending" : offer.status === "pending" ? "Awaiting response" : offer.status;
  const image = listing.media[0];
  const listingEligible = listing.status === "Active" && listing.availability === "Available";

  return <PublicShell><main className="reuse-offer-page"><div className="page-container"><nav className="reuse-detail-breadcrumb" aria-label="Breadcrumb"><Link href="/reuse">Reuse</Link><span>/</span><Link href={`/reuse/${listing.id}`}>{listing.title}</Link><span>/</span><span aria-current="page">Offer status</span></nav><header><p className="section-kicker">Browser-local private status</p><h1>Reservation / Offer Status</h1><p>Offer, reservation, transaction, and handover are independent states. Only recorded negotiation participants can view this page.</p></header><section className="reuse-status-listing"><div className="reuse-status-listing__image">{image?<Image src={image.src} alt={image.alt} fill sizes="160px" unoptimized={image.local}/>:<span>Image unavailable</span>}</div><div><p className="section-kicker">{listing.category}</p><h2>{listing.title}</h2><strong>{money.format(listing.askingPrice)}</strong><dl><div><dt>Condition</dt><dd>{listing.condition}</dd></div><div><dt>Listing status</dt><dd>{listing.status}</dd></div><div><dt>Availability</dt><dd>{listing.availability}</dd></div></dl></div></section><section className="reuse-lifecycle-grid" aria-label="Offer and exchange lifecycle"><LifecycleState title="Offer" state={displayState} detail={`Current proposal ${money.format(offer.currentAmount)}`} tone={offer.status === "pending" ? "attention" : "neutral"}/><LifecycleState title="Reservation" state="Not created" detail="No backend reservation record or authoritative expiry exists." tone="neutral"/><LifecycleState title="Transaction" state="Not completed" detail="Offer activity is not payment or a completed sale." tone="neutral"/><LifecycleState title="Handover" state="Not completed" detail="No inspection, schedule, or handover confirmation is recorded." tone="neutral"/></section><section className="reuse-offer-status-card" aria-label="Offer record summary"><div><span>Current amount</span><strong>{money.format(offer.currentAmount)}</strong></div><div><span>Offer created</span><strong>{date.format(new Date(offer.createdAt))}</strong></div><div><span>Last updated</span><strong>{date.format(new Date(offer.updatedAt))}</strong></div></section>{!listingEligible&&<div className="reuse-status-warning" role="status"><strong>Listing is no longer available for new offers</strong><p>The offer history remains visible, but the listing is {listing.status.toLowerCase()} and {listing.availability.toLowerCase()}. No new counteroffer action is shown.</p></div>}<div className="reuse-offer-status-layout"><section><div className="reuse-detail-section__heading"><div><p className="section-kicker">Negotiation history</p><h2>Offers and counteroffers</h2></div><p>Complete history stored in this browser-local record, ordered from earliest to latest.</p></div><ol className="reuse-offer-timeline">{offer.history.map((event,index)=><li key={event.id}><div><span>{event.kind === "offer" ? "Initial offer" : "Counteroffer"} · {event.actorRole}</span><time dateTime={event.createdAt}>{date.format(new Date(event.createdAt))}</time></div><strong>{money.format(event.amount)}</strong>{event.message&&<p>{event.message}</p>}{index===offer.history.length-1&&<small>Latest proposal</small>}</li>)}</ol></section><aside><h2>Valid next action</h2>{isTurn&&listingEligible?<><p>The latest proposal came from the other participant. You may submit a counteroffer.</p><Link className="button button--primary" href={`/reuse/${offer.listingId}/offer?offerId=${offer.id}`}>Make counteroffer</Link></>:<p>{offer.status === "pending" ? listingEligible ? "You sent the latest proposal. Wait for the other participant to respond." : "The listing state prevents another response." : `This offer is ${offer.status}; no prototype transition is available.`}</p>}<Link className="button button--secondary" href={`/reuse/${listing.id}`}>View listing</Link><div className="prototype-banner"><strong>No authoritative reservation</strong><span>Acceptance, reservation locking, expiry, payment, transaction completion, and handover require the unimplemented backend workflows.</span></div></aside></div></div></main></PublicShell>;
}

function LifecycleState({title,state,detail,tone}:{title:string;state:string;detail:string;tone:"attention"|"neutral"}){return <article className={`reuse-lifecycle-state is-${tone}`}><span>{title}</span><strong>{state}</strong><p>{detail}</p></article>}
function StatusBoundary({title,text,retry,offerId}:{title:string;text:string;retry?:()=>void;offerId?:string}){return <main className="reuse-offer-state page-container"><p className="section-kicker">Private negotiation status</p><h1>{title}</h1><p>{text}</p><div>{retry&&<button className="button button--primary" type="button" onClick={retry}>Retry</button>}{offerId&&<Link className="button button--secondary" href={`/reuse/offers/${offerId}`}>Retry offer record</Link>}<Link className="button button--secondary" href="/reuse">Return to Reuse</Link></div></main>}
