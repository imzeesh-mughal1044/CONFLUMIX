import type { AuthSession } from "@/lib/auth";
import { getEditableReuseListing } from "@/services/reuse";
import type { ReuseOffer, ReuseOfferEvent } from "@/types/reuse";

const storageKey = "conflumix:reuse:offers:v1";
export const reuseOfferEvent = "conflumix-reuse-offers";

export class ReuseOfferError extends Error {
  constructor(
    message: string,
    readonly code:
      | "validation"
      | "permission"
      | "conflict"
      | "unavailable"
      | "duplicate"
      | "missing",
  ) {
    super(message);
  }
}

export function readReuseOffers(): ReuseOffer[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(storageKey) ?? "[]") as ReuseOffer[];
  } catch {
    return [];
  }
}

function write(records: ReuseOffer[]) {
  localStorage.setItem(storageKey, JSON.stringify(records));
  window.dispatchEvent(new Event(reuseOfferEvent));
}

export function getReuseOffer(id: string) {
  return readReuseOffers().find((offer) => offer.id === id) ?? null;
}
export function isOfferParticipant(offer: ReuseOffer, email: string) {
  const normalized = email.toLowerCase();
  return (
    offer.buyerEmail.toLowerCase() === normalized ||
    offer.sellerEmail?.toLowerCase() === normalized
  );
}

function validateAmount(amount: number) {
  if (
    !Number.isFinite(amount) ||
    amount <= 0 ||
    Math.round(amount * 100) !== amount * 100
  )
    throw new ReuseOfferError(
      "Enter a positive offer amount with no more than two decimal places.",
      "validation",
    );
}

export function createReuseOffer(input: {
  listingId: string;
  amount: number;
  message?: string;
  session: AuthSession;
}) {
  validateAmount(input.amount);
  const listing = getEditableReuseListing(input.listingId);
  if (!listing || (listing.lifecycle ?? "published") !== "published")
    throw new ReuseOfferError(
      "This listing is no longer publicly available.",
      "missing",
    );
  if (listing.status !== "Active" || listing.availability !== "Available")
    throw new ReuseOfferError(
      "This listing is not currently eligible for offers.",
      "unavailable",
    );
  if (!listing.negotiable)
    throw new ReuseOfferError(
      "The seller marked this listing as fixed price.",
      "unavailable",
    );
  if (listing.ownerEmail?.toLowerCase() === input.session.email.toLowerCase())
    throw new ReuseOfferError(
      "You cannot make an offer on your own listing.",
      "permission",
    );
  const records = readReuseOffers();
  if (
    records.some(
      (offer) =>
        offer.listingId === listing.id &&
        offer.buyerEmail.toLowerCase() === input.session.email.toLowerCase() &&
        offer.status === "pending",
    )
  )
    throw new ReuseOfferError(
      "You already have a pending offer for this listing.",
      "duplicate",
    );
  const now = new Date().toISOString(),
    id = `offer-${crypto.randomUUID()}`;
  const event: ReuseOfferEvent = {
    id: crypto.randomUUID(),
    kind: "offer",
    actorRole: "buyer",
    actorEmail: input.session.email,
    actorName: input.session.fullName,
    amount: input.amount,
    message: input.message?.trim() || undefined,
    createdAt: now,
  };
  const offer: ReuseOffer = {
    id,
    listingId: listing.id,
    buyerEmail: input.session.email,
    buyerName: input.session.fullName,
    sellerEmail: listing.ownerEmail,
    sellerName: listing.sellerName,
    status: "pending",
    currentAmount: input.amount,
    history: [event],
    createdAt: now,
    updatedAt: now,
    version: 1,
    prototype: true,
  };
  write([offer, ...records]);
  return offer;
}

export function counterReuseOffer(input: {
  offerId: string;
  amount: number;
  message?: string;
  session: AuthSession;
  expectedVersion: number;
}) {
  validateAmount(input.amount);
  const records = readReuseOffers(),
    offer = records.find((item) => item.id === input.offerId);
  if (!offer)
    throw new ReuseOfferError(
      "The referenced offer no longer exists.",
      "missing",
    );
  if (offer.version !== input.expectedVersion)
    throw new ReuseOfferError(
      "This negotiation changed in another session. Reload before responding.",
      "conflict",
    );
  if (offer.status !== "pending")
    throw new ReuseOfferError(
      `A ${offer.status} offer cannot be countered.`,
      "unavailable",
    );
  if (!isOfferParticipant(offer, input.session.email))
    throw new ReuseOfferError(
      "Only negotiation participants can submit a counteroffer.",
      "permission",
    );
  const last = offer.history.at(-1);
  if (last?.actorEmail.toLowerCase() === input.session.email.toLowerCase())
    throw new ReuseOfferError(
      "Wait for the other participant to respond before countering again.",
      "unavailable",
    );
  const role =
      offer.sellerEmail?.toLowerCase() === input.session.email.toLowerCase()
        ? "seller"
        : "buyer",
    now = new Date().toISOString();
  const event: ReuseOfferEvent = {
    id: crypto.randomUUID(),
    kind: "counteroffer",
    actorRole: role,
    actorEmail: input.session.email,
    actorName: input.session.fullName,
    amount: input.amount,
    message: input.message?.trim() || undefined,
    createdAt: now,
  };
  const next: ReuseOffer = {
    ...offer,
    currentAmount: input.amount,
    history: [...offer.history, event],
    updatedAt: now,
    version: offer.version + 1,
  };
  write(records.map((item) => (item.id === offer.id ? next : item)));
  return next;
}
