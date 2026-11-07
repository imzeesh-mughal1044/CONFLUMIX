"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PublicShell } from "@/components/public/public-shell";
import { readAuthSession, type AuthSession } from "@/lib/auth";
import { getReuseListing } from "@/services/reuse";
import {
  counterReuseOffer,
  createReuseOffer,
  getReuseOffer,
  isOfferParticipant,
} from "@/services/reuse-offers";
import type { ReuseListing, ReuseOffer } from "@/types/reuse";

const money = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 2,
});

export function ReuseOfferForm({ itemId }: { itemId: string }) {
  const submissionLock = useRef(false);
  const router = useRouter(),
    params = useSearchParams(),
    offerId = params.get("offerId"),
    [listing, setListing] = useState<ReuseListing | null>(null),
    [offer, setOffer] = useState<ReuseOffer | null>(null),
    [session, setSession] = useState<AuthSession | null>(null),
    [state, setState] = useState<"loading" | "ready" | "blocked">("loading"),
    [reason, setReason] = useState(""),
    [amount, setAmount] = useState(""),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    let active = true;
    void Promise.all([getReuseListing(itemId), readAuthSession()]).then(
      ([item, current]) => {
        if (!active) return;
        if (!current) {
          router.replace(
            `/auth/login?next=${encodeURIComponent(`/reuse/${itemId}/offer${offerId ? `?offerId=${offerId}` : ""}`)}`,
          );
          return;
        }
        if (!item) {
          setReason(
            "The selected listing is invalid or no longer publicly available.",
          );
          setState("blocked");
          return;
        }
        setListing(item);
        setSession(current);
        if (item.status !== "Active" || item.availability !== "Available") {
          setReason("This listing is not currently available for negotiation.");
          setState("blocked");
          return;
        }
        if (!item.negotiable) {
          setReason(
            "The seller marked this listing as fixed price, so direct offers are unavailable.",
          );
          setState("blocked");
          return;
        }
        if (offerId) {
          const context = getReuseOffer(offerId);
          if (!context || context.listingId !== item.id) {
            setReason(
              "The referenced counteroffer context is missing or does not belong to this listing.",
            );
            setState("blocked");
            return;
          }
          if (!isOfferParticipant(context, current.email)) {
            setReason(
              "Only the buyer and seller in this negotiation can view or respond to it.",
            );
            setState("blocked");
            return;
          }
          if (context.status !== "pending") {
            setReason(
              `This offer is ${context.status} and cannot be countered.`,
            );
            setState("blocked");
            return;
          }
          if (
            context.history.at(-1)?.actorEmail.toLowerCase() ===
            current.email.toLowerCase()
          ) {
            setReason(
              "You already sent the latest amount. Wait for the other participant to respond.",
            );
            setState("blocked");
            return;
          }
          setOffer(context);
          setAmount(String(context.currentAmount));
        } else if (
          item.ownerEmail?.toLowerCase() === current.email.toLowerCase()
        ) {
          setReason("You cannot make an offer on your own listing.");
          setState("blocked");
          return;
        }
        setState("ready");
      },
    );
    return () => {
      active = false;
    };
  }, [itemId, offerId, router]);
  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const value = Number(amount);
    if (
      !amount.trim() ||
      !Number.isFinite(value) ||
      value <= 0 ||
      Math.round(value * 100) !== value * 100
    ) {
      setError(
        "Enter a positive offer amount with no more than two decimal places.",
      );
      return;
    }
    if (message.length > 500) {
      setError("Keep the optional message within 500 characters.");
      return;
    }
    if (!session || !listing || submitting || submissionLock.current) return;
    submissionLock.current = true;
    setSubmitting(true);
    try {
      const result = offer
        ? counterReuseOffer({
            offerId: offer.id,
            amount: value,
            message,
            session,
            expectedVersion: offer.version,
          })
        : createReuseOffer({
            listingId: listing.id,
            amount: value,
            message,
            session,
          });
      router.push(`/reuse/offers/${result.id}`);
    } catch (value) {
      setError(
        value instanceof Error
          ? value.message
          : "The offer could not be submitted.",
      );
      submissionLock.current = false;
      setSubmitting(false);
    }
  }
  if (state === "loading")
    return (
      <PublicShell>
        <div className="route-loading" role="status">
          Loading listing and negotiation context…
        </div>
      </PublicShell>
    );
  if (state === "blocked" || !listing)
    return (
      <PublicShell>
        <main className="reuse-offer-state page-container">
          <p className="section-kicker">Offer unavailable</p>
          <h1>This negotiation cannot continue</h1>
          <p>{reason}</p>
          <div>
            <Link className="button button--primary" href={`/reuse/${itemId}`}>
              Return to listing
            </Link>
            <Link className="button button--secondary" href="/reuse/browse">
              Browse Reuse
            </Link>
          </div>
        </main>
      </PublicShell>
    );
  const active = listing.media[0];
  return (
    <PublicShell>
      <main className="reuse-offer-page">
        <div className="page-container">
          <nav className="reuse-detail-breadcrumb" aria-label="Breadcrumb">
            <Link href="/reuse">Reuse</Link>
            <span>/</span>
            <Link href={`/reuse/${listing.id}`}>{listing.title}</Link>
            <span>/</span>
            <span aria-current="page">
              {offer ? "Counteroffer" : "Make an offer"}
            </span>
          </nav>
          <header>
            <p className="section-kicker">Browser-local negotiation</p>
            <h1>{offer ? "Make a counteroffer" : "Make an offer"}</h1>
            <p>
              Your submission creates a pending prototype offer. It does not
              reserve the item, accept payment, or confirm a handover.
            </p>
          </header>
          <div className="reuse-offer-layout">
            <aside className="reuse-offer-summary">
              {active ? (
                <div className="reuse-offer-summary__image">
                  <Image
                    src={active.src}
                    alt={active.alt}
                    fill
                    sizes="280px"
                    unoptimized={active.local}
                  />
                </div>
              ) : (
                <div className="reuse-offer-summary__missing">
                  Image unavailable
                </div>
              )}
              <p className="section-kicker">{listing.category}</p>
              <h2>{listing.title}</h2>
              <strong>{money.format(listing.askingPrice)}</strong>
              <dl>
                <div>
                  <dt>Condition</dt>
                  <dd>{listing.condition}</dd>
                </div>
                <div>
                  <dt>Availability</dt>
                  <dd>{listing.availability}</dd>
                </div>
                <div>
                  <dt>Seller</dt>
                  <dd>{listing.sellerName}</dd>
                </div>
              </dl>
            </aside>
            <section className="reuse-offer-form-panel">
              {offer && (
                <div className="reuse-counter-context">
                  <span>Current pending amount</span>
                  <strong>{money.format(offer.currentAmount)}</strong>
                  <p>
                    Latest response from {offer.history.at(-1)?.actorRole}. This
                    counteroffer remains linked to offer {offer.id}.
                  </p>
                </div>
              )}
              <form onSubmit={submit} noValidate>
                <label htmlFor="offer-amount">
                  {offer ? "Counteroffer amount" : "Offer amount"} (PKR)
                  <input
                    id="offer-amount"
                    inputMode="decimal"
                    autoComplete="off"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    aria-invalid={Boolean(error)}
                    aria-describedby="offer-amount-help"
                  />
                  <small id="offer-amount-help">
                    No discount percentage or increment rule is imposed. Enter a
                    positive monetary amount.
                  </small>
                </label>
                <label htmlFor="offer-message">
                  Message <em>Optional</em>
                  <textarea
                    id="offer-message"
                    rows={5}
                    maxLength={500}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                  />
                  <small>{message.length}/500 characters</small>
                </label>
                {error && (
                  <p className="field-error" role="alert">
                    {error}
                  </p>
                )}
                <div className="reuse-offer-actions">
                  <Link
                    className="button button--secondary"
                    href={
                      offer
                        ? `/reuse/offers/${offer.id}`
                        : `/reuse/${listing.id}`
                    }
                  >
                    Cancel
                  </Link>
                  <button
                    className="button button--primary"
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting
                      ? "Submitting…"
                      : offer
                        ? "Submit counteroffer"
                        : "Submit offer"}
                  </button>
                </div>
              </form>
              <div className="prototype-banner" role="note">
                <strong>No expiry or reservation</strong>
                <span>
                  The repository has no approved deadline configuration or
                  connected transaction service, so none is invented here.
                </span>
              </div>
            </section>
          </div>
        </div>
      </main>
    </PublicShell>
  );
}
