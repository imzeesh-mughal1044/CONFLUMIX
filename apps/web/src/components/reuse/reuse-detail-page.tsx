"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/public/icons";
import { PublicShell } from "@/components/public/public-shell";
import { getRelatedReuseListings, getReuseListing } from "@/services/reuse";
import type { ReuseListing } from "@/types/reuse";
import { ReuseCard } from "./reuse-card";

const money = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 0,
});
const date = new Intl.DateTimeFormat("en-PK", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function ReuseDetailPage({ itemId }: { itemId: string }) {
  const [item, setItem] = useState<ReuseListing | null>(null);
  const [related, setRelated] = useState<ReuseListing[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "missing" | "error">(
    "loading",
  );
  const [mediaIndex, setMediaIndex] = useState(0);
  const [failedMedia, setFailedMedia] = useState<string[]>([]);
  const load = useCallback(async () => {
    if (!/^[a-z0-9-]+$/.test(itemId)) {
      setState("missing");
      return;
    }
    setState("loading");
    try {
      const result = await getReuseListing(itemId);
      if (!result || result.status === "Removed") {
        setState("missing");
        return;
      }
      setItem(result);
      setRelated(await getRelatedReuseListings(result));
      setMediaIndex(0);
      setFailedMedia([]);
      setState("ready");
    } catch {
      setState("error");
    }
  }, [itemId]);
  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);
  if (state === "loading")
    return (
      <PublicShell>
        <DetailState
          title="Loading Reuse listing…"
          text="Retrieving the selected demo record."
          loading
        />
      </PublicShell>
    );
  if (state === "missing")
    return (
      <PublicShell>
        <DetailState
          title="Reuse listing unavailable"
          text="The identifier is invalid, the listing does not exist, or it is not publicly available."
        />
      </PublicShell>
    );
  if (state === "error")
    return (
      <PublicShell>
        <DetailState
          title="We could not load this listing"
          text="The listing service did not respond. Your selected identifier has been preserved."
          retry={() => void load()}
        />
      </PublicShell>
    );
  if (!item) return null;
  const media = item.media.filter((entry) => !failedMedia.includes(entry.id));
  const activeMedia =
    media[Math.min(mediaIndex, Math.max(media.length - 1, 0))];
  const canOffer =
    item.status === "Active" &&
    item.availability === "Available" &&
    item.negotiable;
  return (
    <PublicShell>
      <div className="reuse-page reuse-detail-page">
        <div className="page-container">
          <nav className="reuse-detail-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <Icon name="chevron" size={14} />
            <Link href="/reuse">Reuse</Link>
            <Icon name="chevron" size={14} />
            <Link
              href={`/reuse/browse?category=${encodeURIComponent(item.category)}`}
            >
              {item.category}
            </Link>
            <Icon name="chevron" size={14} />
            <span aria-current="page">{item.title}</span>
          </nav>
          <section className="reuse-detail-overview">
            <div className="reuse-gallery">
              <div className="reuse-gallery__main">
                {activeMedia ? (
                  <Image
                    key={activeMedia.id}
                    src={activeMedia.src}
                    alt={activeMedia.alt}
                    fill
                    priority
                    sizes="(max-width: 820px) calc(100vw - 36px), 52vw"
                    onError={() =>
                      setFailedMedia((current) => [...current, activeMedia.id])
                    }
                  />
                ) : (
                  <div className="reuse-gallery__missing">
                    <Icon name="package" size={44} />
                    <strong>Image unavailable</strong>
                    <span>The listing remains readable without media.</span>
                  </div>
                )}
                <b>Demo listing</b>
              </div>
              {media.length > 1 && (
                <div className="reuse-gallery__controls">
                  <button
                    type="button"
                    aria-label="Show previous image"
                    onClick={() =>
                      setMediaIndex(
                        (index) => (index - 1 + media.length) % media.length,
                      )
                    }
                  >
                    Previous
                  </button>
                  <span aria-live="polite">
                    Image {mediaIndex + 1} of {media.length}
                  </span>
                  <button
                    type="button"
                    aria-label="Show next image"
                    onClick={() =>
                      setMediaIndex((index) => (index + 1) % media.length)
                    }
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
            <article className="reuse-detail-summary">
              <p className="section-kicker">{item.category}</p>
              <h1>{item.title}</h1>
              <div className="reuse-detail__price">
                <strong>{money.format(item.askingPrice)}</strong>
                {item.previousAskingPrice && (
                  <del>{money.format(item.previousAskingPrice)}</del>
                )}
              </div>
              <p className="reuse-negotiability">
                {item.negotiable
                  ? "Seller has marked the asking price as negotiable."
                  : "Seller has marked the asking price as fixed."}
              </p>
              <div className="reuse-state-grid">
                <StateFact label="Product condition" value={item.condition} />
                <StateFact label="Listing status" value={item.status} />
                <StateFact label="Availability" value={item.availability} />
                <StateFact label="Classification" value={item.classification} />
              </div>
              <p className="reuse-detail-description">{item.description}</p>
              <div className="reuse-detail-actions">
                {canOffer ? (
                  <Link
                    className="button button--primary"
                    href={`/reuse/${item.id}/offer`}
                  >
                    Make an offer
                  </Link>
                ) : (
                  <button
                    className="button button--primary"
                    type="button"
                    disabled
                    title={
                      !item.negotiable
                        ? "The seller marked this listing as fixed price"
                        : `Offers are unavailable while this listing is ${item.status.toLowerCase()}`
                    }
                  >
                    Offers unavailable
                  </button>
                )}
                <Link
                  className="button button--secondary"
                  href={`/reuse/${item.id}/price-benchmark`}
                >
                  View price benchmark
                </Link>
              </div>
              <p className="reuse-action-note">
                Offers use browser-local prototype records. Submitting an offer
                does not reserve the item, accept payment, or confirm handover.
              </p>
            </article>
          </section>
          <section className="reuse-detail-section reuse-detail-columns">
            <div>
              <p className="section-kicker">Item details</p>
              <h2>Description and disclosure</h2>
              <DetailList item={item} />
            </div>
            <div>
              <h2>Category attributes</h2>
              {item.attributes.length ? (
                <dl className="reuse-specs">
                  {item.attributes.map((attribute) => (
                    <div key={attribute.label}>
                      <dt>{attribute.label}</dt>
                      <dd>{attribute.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="reuse-detail-empty">
                  No structured attributes were supplied.
                </p>
              )}
              <h2 className="reuse-subheading">Known defects or damage</h2>
              {item.defects?.length ? (
                <ul className="reuse-disclosure-list">
                  {item.defects.map((defect) => (
                    <li key={defect}>{defect}</li>
                  ))}
                </ul>
              ) : (
                <p className="reuse-detail-empty">
                  The seller disclosed no known defects in this demo record.
                  This is not an independent inspection.
                </p>
              )}
            </div>
          </section>
          <section className="reuse-detail-section">
            <div className="reuse-detail-section__heading">
              <div>
                <p className="section-kicker">Seller disclosures</p>
                <h2>Repair and refurbishment history</h2>
              </div>
              <p>
                Entries are supplied by the demo seller and are not
                independently verified.
              </p>
            </div>
            {item.repairHistory.length ? (
              <ol className="reuse-timeline">
                {item.repairHistory.map((entry) => (
                  <li key={entry.id}>
                    <time dateTime={entry.date}>{formatDate(entry.date)}</time>
                    <div>
                      <span>{entry.type}</span>
                      <h3>{entry.component}</h3>
                      <p>{entry.notes}</p>
                      <small>
                        Parts warranty: {entry.partsWarranty ?? "Not provided"}
                      </small>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="reuse-detail-empty">
                No repair or refurbishment history was supplied for this
                listing.
              </p>
            )}
          </section>
          <section className="reuse-detail-section">
            <div className="reuse-detail-section__heading">
              <div>
                <p className="section-kicker">Asking-price record</p>
                <h2>Price history</h2>
              </div>
              <p>
                These are asking prices, not completed sale prices or market
                benchmarks.
              </p>
            </div>
            {item.priceHistory.length ? (
              <ol className="reuse-price-history">
                {item.priceHistory.map((entry, index) => (
                  <li key={entry.id}>
                    <span>
                      {index === item.priceHistory.length - 1
                        ? "Current asking price"
                        : "Previous asking price"}
                    </span>
                    <strong>{money.format(entry.askingPrice)}</strong>
                    <time dateTime={entry.changedAt}>
                      {formatDate(entry.changedAt)}
                    </time>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="reuse-detail-empty">
                No asking-price changes were recorded.
              </p>
            )}
          </section>
          <section className="reuse-detail-section reuse-seller-location">
            <div>
              <p className="section-kicker">Public seller information</p>
              <h2>{item.sellerName}</h2>
              <dl className="reuse-specs">
                <div>
                  <dt>Seller type</dt>
                  <dd>{item.sellerType}</dd>
                </div>
                <div>
                  <dt>Verification state</dt>
                  <dd>{item.sellerVerification}</dd>
                </div>
                <div>
                  <dt>Public locality</dt>
                  <dd>{item.locality}</dd>
                </div>
              </dl>
              <p className="reuse-verification-note">
                Verification is a manual or simulated prototype state. It is not
                government verification, product certification, or a transaction
                guarantee.
              </p>
            </div>
            <div>
              <p className="section-kicker">Handover context</p>
              <h2>Location and method</h2>
              {item.handoverMethods.length ? (
                <ul className="reuse-disclosure-list">
                  {item.handoverMethods.map((method) => (
                    <li key={method}>{method}</li>
                  ))}
                </ul>
              ) : (
                <p className="reuse-detail-empty">
                  No handover or delivery method was provided.
                </p>
              )}
              {item.sellerNotes && (
                <div className="reuse-seller-note">
                  <strong>Seller note</strong>
                  <p>{item.sellerNotes}</p>
                </div>
              )}
            </div>
          </section>
          {related.length > 0 && (
            <section className="reuse-detail-section">
              <div className="reuse-detail-section__heading">
                <div>
                  <p className="section-kicker">Same category</p>
                  <h2>Related demo listings</h2>
                </div>
                <Link
                  href={`/reuse/browse?category=${encodeURIComponent(item.category)}`}
                >
                  Browse {item.category}
                </Link>
              </div>
              <div className="reuse-grid">
                {related.map((listing) => (
                  <ReuseCard key={listing.id} listing={listing} />
                ))}
              </div>
            </section>
          )}
          <div className="reuse-detail__notice">
            <strong>Prototype boundary</strong>
            <p>
              This record comes from the same frontend fixture service used by
              Reuse landing and browse. It is not persisted to Supabase, and
              availability is not protected by a server-side reservation lock.
            </p>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}

function formatDate(value: string) {
  const parsed = new Date(
    value.length === 7 ? `${value}-01T00:00:00Z` : `${value}T00:00:00Z`,
  );
  return Number.isNaN(parsed.valueOf()) ? value : date.format(parsed);
}
function StateFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
function DetailList({ item }: { item: ReuseListing }) {
  const rows = [
    { label: "Brand", value: item.brand },
    { label: "Model", value: item.model },
    {
      label: "Purchase date",
      value: item.purchaseDate ? formatDate(item.purchaseDate) : undefined,
    },
    { label: "Usage duration", value: item.usageDuration },
    { label: "Reason for selling", value: item.reasonForSelling },
    { label: "Warranty", value: item.warrantyStatus },
    {
      label: "Accessories",
      value: item.accessories?.length ? item.accessories.join(", ") : undefined,
    },
  ];
  return (
    <dl className="reuse-specs">
      {rows.map((row) => (
        <div key={row.label}>
          <dt>{row.label}</dt>
          <dd>{row.value ?? "Not provided"}</dd>
        </div>
      ))}
    </dl>
  );
}
function DetailState({
  title,
  text,
  loading,
  retry,
}: {
  title: string;
  text: string;
  loading?: boolean;
  retry?: () => void;
}) {
  return (
    <div
      className="page-container reuse-detail-route-state"
      role={loading ? "status" : undefined}
    >
      <span>
        <Icon name={loading ? "spark" : "package"} size={34} />
      </span>
      <h1>{title}</h1>
      <p>{text}</p>
      <div>
        {retry && (
          <button
            className="button button--primary"
            type="button"
            onClick={retry}
          >
            Retry
          </button>
        )}
        <Link className="button button--secondary" href="/reuse/browse">
          Browse Reuse listings
        </Link>
      </div>
    </div>
  );
}
