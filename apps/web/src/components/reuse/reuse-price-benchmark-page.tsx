"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PublicShell } from "@/components/public/public-shell";
import {
  getReusePriceBenchmark,
  type ReuseBenchmarkResult,
} from "@/services/reuse-benchmark";
import { getReuseListing } from "@/services/reuse";
import type { ReuseListing } from "@/types/reuse";

type ViewState =
  | { kind: "loading" }
  | { kind: "missing" }
  | { kind: "failure"; listing: ReuseListing }
  | { kind: "ready"; listing: ReuseListing; result: ReuseBenchmarkResult };

const money = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 0,
});

export function ReusePriceBenchmarkPage({ itemId }: { itemId: string }) {
  const [state, setState] = useState<ViewState>({ kind: "loading" });
  const load = useCallback(async () => {
    const listing = await getReuseListing(itemId);
    if (!listing) {
      setState({ kind: "missing" });
      return;
    }
    try {
      const result = await getReusePriceBenchmark(listing);
      setState({ kind: "ready", listing, result });
    } catch {
      setState({ kind: "failure", listing });
    }
  }, [itemId]);

  useEffect(() => {
    let active = true;
    void getReuseListing(itemId).then(async (listing) => {
      if (!active) return;
      if (!listing) {
        setState({ kind: "missing" });
        return;
      }
      try {
        const result = await getReusePriceBenchmark(listing);
        if (active) setState({ kind: "ready", listing, result });
      } catch {
        if (active) setState({ kind: "failure", listing });
      }
    });
    return () => {
      active = false;
    };
  }, [itemId]);

  if (state.kind === "loading") {
    return (
      <PublicShell>
        <div className="route-loading" role="status">
          Loading listing and benchmark evidence…
        </div>
      </PublicShell>
    );
  }

  if (state.kind === "missing") {
    return (
      <PublicShell>
        <main className="reuse-benchmark-page">
          <div className="page-container reuse-benchmark-boundary">
            <p className="section-kicker">Fair market price benchmark</p>
            <h1>Listing not found</h1>
            <p>The requested Reuse listing is unavailable or not published.</p>
            <Link className="button button--primary" href="/reuse/browse">
              Browse Reuse listings
            </Link>
          </div>
        </main>
      </PublicShell>
    );
  }

  const { listing } = state;
  const image = listing.media[0];
  return (
    <PublicShell>
      <main className="reuse-benchmark-page">
        <div className="page-container">
          <nav className="reuse-detail-breadcrumb" aria-label="Breadcrumb">
            <Link href="/reuse">Reuse</Link>
            <span>/</span>
            <Link href={`/reuse/${listing.id}`}>{listing.title}</Link>
            <span>/</span>
            <span aria-current="page">Price benchmark</span>
          </nav>

          <header className="reuse-benchmark-header">
            <p className="section-kicker">Completed-transaction evidence</p>
            <h1>Fair Market Price Benchmark</h1>
            <p>
              Compare the seller&apos;s asking price with a statistical range only when enough valid, comparable completed transactions exist.
            </p>
          </header>

          <section className="reuse-benchmark-listing" aria-labelledby="benchmark-listing-title">
            <div className="reuse-benchmark-listing__image">
              {image ? (
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 600px) 96px, 180px"
                  unoptimized={image.local}
                />
              ) : (
                <span>Image unavailable</span>
              )}
            </div>
            <div>
              <p className="section-kicker">{listing.category}</p>
              <h2 id="benchmark-listing-title">{listing.title}</h2>
              <dl>
                <div><dt>Seller&apos;s asking price</dt><dd>{money.format(listing.askingPrice)}</dd></div>
                <div><dt>Condition</dt><dd>{listing.condition}</dd></div>
                {listing.brand && <div><dt>Brand</dt><dd>{listing.brand}</dd></div>}
                {listing.model && <div><dt>Model</dt><dd>{listing.model}</dd></div>}
              </dl>
              <p className="reuse-benchmark-asking-note">
                This is the seller&apos;s current requested amount, not a completed sale price or benchmark result.
              </p>
            </div>
          </section>

          {state.kind === "failure" ? (
            <BenchmarkFailure
              onRetry={() => {
                setState({ kind: "loading" });
                void load();
              }}
            />
          ) : state.result.status === "insufficient" ? (
            <InsufficientBenchmark result={state.result} />
          ) : (
            <AvailableBenchmark listing={listing} result={state.result} />
          )}

          <section className="reuse-benchmark-method" aria-labelledby="benchmark-method-title">
            <h2 id="benchmark-method-title">Methodology and limitations</h2>
            <div>
              <article><strong>Evidence source</strong><p>Only eligible completed transaction prices may support this benchmark. Asking prices, offers, and accepted offers are not completed sales.</p></article>
              <article><strong>Comparable selection</strong><p>Comparability should use category, condition, brand or model, and other supported attributes. The production exclusion and data-quality rules are not yet implemented.</p></article>
              <article><strong>Statistical method</strong><p>When sufficient evidence exists, the approved method is the 25th–75th percentile range. The minimum sufficient sample count remains unresolved under DEC-005.</p></article>
              <article><strong>Interpretation</strong><p>A benchmark is an estimate, not a formal appraisal, guaranteed sale price, binding offer, or automatic pricing recommendation.</p></article>
            </div>
          </section>

          <div className="reuse-benchmark-actions">
            <Link className="button button--primary" href={`/reuse/${listing.id}`}>
              Back to listing
            </Link>
            <Link className="button button--secondary" href="/reuse/browse">
              Browse similar listings
            </Link>
          </div>
        </div>
      </main>
    </PublicShell>
  );
}

function InsufficientBenchmark({
  result,
}: {
  result: Extract<ReuseBenchmarkResult, { status: "insufficient" }>;
}) {
  return (
    <section className="reuse-benchmark-result is-insufficient" role="status" aria-labelledby="benchmark-result-title">
      <p className="section-kicker">Benchmark result</p>
      <h2 id="benchmark-result-title">Reliable benchmark unavailable</h2>
      <p>{result.reason}</p>
      <dl>
        <div><dt>Valid comparable transactions</dt><dd>{result.comparableCount ?? "Not available"}</dd></div>
        <div><dt>Minimum evidence threshold</dt><dd>Not yet approved</dd></div>
        <div><dt>Benchmark chart</dt><dd>Not shown without valid values</dd></div>
      </dl>
    </section>
  );
}

function BenchmarkFailure({ onRetry }: { onRetry: () => void }) {
  return (
    <section className="reuse-benchmark-result is-failure" role="alert">
      <p className="section-kicker">Analytics service</p>
      <h2>Benchmark temporarily unavailable</h2>
      <p>The listing remains available, but its benchmark result could not be loaded.</p>
      <button className="button button--secondary" type="button" onClick={onRetry}>Try again</button>
    </section>
  );
}

function AvailableBenchmark({
  listing,
  result,
}: {
  listing: ReuseListing;
  result: Extract<ReuseBenchmarkResult, { status: "available" }>;
}) {
  const min = Math.min(result.lowerBound, listing.askingPrice);
  const max = Math.max(result.upperBound, listing.askingPrice);
  const span = Math.max(max - min, 1);
  const lower = ((result.lowerBound - min) / span) * 100;
  const upper = ((result.upperBound - min) / span) * 100;
  const asking = ((listing.askingPrice - min) / span) * 100;
  return (
    <section className="reuse-benchmark-result is-available" aria-labelledby="benchmark-result-title">
      <p className="section-kicker">Benchmark result</p>
      <h2 id="benchmark-result-title">{money.format(result.lowerBound)}–{money.format(result.upperBound)}</h2>
      <p>Estimated 25th–75th percentile range from {result.comparableCount} valid comparable completed transactions.</p>
      <div className="reuse-benchmark-chart" role="img" aria-label={`Benchmark range ${money.format(result.lowerBound)} to ${money.format(result.upperBound)}. Seller asking price ${money.format(listing.askingPrice)}.`}>
        <span className="reuse-benchmark-chart__range" style={{ left: `${lower}%`, width: `${Math.max(upper - lower, 2)}%` }} />
        <span className="reuse-benchmark-chart__asking" style={{ left: `${asking}%` }} />
      </div>
      <div className="reuse-benchmark-legend"><span><i />Benchmark range</span><span><i />Seller asking price</span></div>
      <dl>
        <div><dt>Valid comparables</dt><dd>{result.comparableCount}</dd></div>
        <div><dt>Dimensions</dt><dd>{result.dimensions.join(", ")}</dd></div>
        <div><dt>Evidence coverage</dt><dd>{result.coverageStart && result.coverageEnd ? `${result.coverageStart} to ${result.coverageEnd}` : "Not provided"}</dd></div>
      </dl>
    </section>
  );
}
