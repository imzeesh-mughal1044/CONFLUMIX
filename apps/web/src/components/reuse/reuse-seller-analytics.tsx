"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PublicShell } from "@/components/public/public-shell";
import { readAuthSession } from "@/lib/auth";
import { analyzeReuseSellerRecords } from "@/services/reuse-analytics";
import { allReuseListings, reuseListingEvent } from "@/services/reuse";
import { readSellerOnboarding } from "@/services/seller-onboarding";
import type { ReuseListing } from "@/types/reuse";

type PageState = "loading" | "permission" | "ready" | "error";
const money = new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 });
const date = new Intl.DateTimeFormat("en-PK", { day: "numeric", month: "short", year: "numeric" });

export function ReuseSellerAnalytics() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const [state, setState] = useState<PageState>("loading");
  const [records, setRecords] = useState<ReuseListing[]>([]);

  const load = useCallback(async () => {
    try {
      const session = await readAuthSession();
      if (!session) {
        router.replace(`/auth/login?next=${encodeURIComponent(`${pathname}${params.size ? `?${params}` : ""}`)}`);
        return;
      }
      if (!readSellerOnboarding(session.email)?.reuseInterestSavedAt) {
        setState("permission");
        return;
      }
      const email = session.email.toLowerCase();
      setRecords(allReuseListings().filter((item) => item.ownerEmail?.toLowerCase() === email));
      setState("ready");
    } catch {
      setState("error");
    }
  }, [params, pathname, router]);

  useEffect(() => {
    queueMicrotask(() => void load());
    const refresh = () => void load();
    window.addEventListener(reuseListingEvent, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(reuseListingEvent, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [load]);

  const categories = useMemo(() => [...new Set(records.map((item) => item.category))].sort(), [records]);
  const requestedCategory = params.get("category") ?? "all";
  const category = categories.includes(requestedCategory) ? requestedCategory : "all";
  const analytics = useMemo(() => analyzeReuseSellerRecords(records, category === "all" ? undefined : category), [category, records]);

  if (state === "loading") return <PublicShell><div className="route-loading" role="status">Loading seller-scoped Reuse evidence…</div></PublicShell>;
  if (state === "permission") return <PublicShell><Boundary title="Reuse seller access required" text="This account has not started Reuse seller setup." href="/become-a-seller" action="Start seller setup" /></PublicShell>;
  if (state === "error") return <PublicShell><Boundary title="Analytics could not be loaded" text="The independently stored listing records were not changed." onRetry={() => { setState("loading"); void load(); }} /></PublicShell>;

  const maxCategory = Math.max(...analytics.categoryListingVolume.map((item) => item.count), 1);
  return (
    <PublicShell>
      <main className="reuse-analytics page-container">
        <nav className="reuse-dashboard-nav" aria-label="Reuse Seller Center">
          <Link href="/dashboard/reuse">Overview</Link>
          <Link href="/dashboard/reuse/listings">Listings</Link>
          <Link className="is-active" href="/dashboard/reuse/analytics" aria-current="page">Analytics</Link>
          <Link href="/reuse/sell/new">Create listing</Link>
          <Link href="/dashboard/seller-center/reuse/categories">Categories</Link>
        </nav>
        <header className="reuse-analytics__header"><div><p className="section-kicker">Seller-scoped evidence</p><h1>Reuse Seller Analytics</h1><p>Traceable browser-local listing evidence is shown separately from metrics that require missing transaction data or unresolved definitions.</p></div><Link className="button button--secondary" href="/dashboard/reuse">Back to dashboard</Link></header>
        <div className="prototype-banner" role="note"><strong>Analytics service unavailable</strong><span>The ASP.NET API and Python analytics service are not implemented. Nothing on this page is a live backend metric or market forecast.</span></div>

        <section className="reuse-analytics-filter" aria-labelledby="analytics-filter-title"><div><p className="section-kicker">Evidence scope</p><h2 id="analytics-filter-title">Category filter</h2></div><label>Main category<select value={category} onChange={(event) => { const next = new URLSearchParams(params.toString()); if (event.target.value === "all") next.delete("category"); else next.set("category", event.target.value); router.replace(`${pathname}${next.size ? `?${next}` : ""}`); }}><option value="all">All seller categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label><p>Applies to listing inventory, category volume, and recorded asking-price reduction evidence below.</p></section>

        <section aria-labelledby="analytics-availability-title"><div className="dashboard-section-title"><div><p className="section-kicker">Documented metric set</p><h2 id="analytics-availability-title">Metric availability</h2></div><p>{category === "all" ? "All seller categories" : category}</p></div><div className="reuse-analytics-metrics"><UnavailableMetric title="Average days listed" reason="No approved start/end-state treatment exists for active, sold, expired, removed, or draft listings." /><UnavailableMetric title="Offer conversion" reason="The accepted/completed numerator and eligible-offer denominator are undefined; only pending offer creation is implemented." /><UnavailableMetric title="Completed transactions" reason="No authoritative Reuse transaction model or completed state exists." /><UnavailableMetric title="Category demand" reason="Listing volume is available below, but no approved buyer-demand signal or formula exists." /><UnavailableMetric title="Unsold inventory" reason="No approved inclusion rule exists for Active, Reserved, Expired, Removed, Sold, or Draft states." /><UnavailableMetric title="Aggregate price reduction" reason="Individual asking-price reductions are traceable below, but no approved aggregate formula or reporting period exists." /></div></section>

        <div className="reuse-analytics-grid">
          <section className="reuse-analytics-panel" aria-labelledby="inventory-evidence-title"><p className="section-kicker">Listing evidence</p><h2 id="inventory-evidence-title">Inventory records by lifecycle</h2><p>{analytics.listingCount} seller-owned listing record{analytics.listingCount === 1 ? "" : "s"} in this category scope. These counts are not sales, demand, or unsold-inventory metrics.</p><dl className="reuse-analytics-lifecycle"><div><dt>Active</dt><dd>{analytics.lifecycle.active}</dd></div><div><dt>Draft</dt><dd>{analytics.lifecycle.draft}</dd></div><div><dt>Reserved</dt><dd>{analytics.lifecycle.reserved}</dd></div><div><dt>Sold status</dt><dd>{analytics.lifecycle.sold}</dd></div><div><dt>Expired</dt><dd>{analytics.lifecycle.expired}</dd></div><div><dt>Removed</dt><dd>{analytics.lifecycle.removed}</dd></div></dl></section>
          <section className="reuse-analytics-panel" aria-labelledby="category-volume-title"><p className="section-kicker">Listing evidence</p><h2 id="category-volume-title">Listing volume by category</h2><p>This describes seller listing records, not verified buyer demand.</p>{analytics.categoryListingVolume.length ? <><div className="reuse-analytics-bars" role="img" aria-label={analytics.categoryListingVolume.map((item) => `${item.category}: ${item.count} listing records`).join("; ")}>{analytics.categoryListingVolume.map((item) => <div key={item.category}><span>{item.category}</span><i style={{ width: `${Math.max(8, item.count / maxCategory * 100)}%` }} /><strong>{item.count}</strong></div>)}</div><table className="sr-only"><caption>Seller listing volume by category</caption><thead><tr><th>Category</th><th>Listing records</th></tr></thead><tbody>{analytics.categoryListingVolume.map((item) => <tr key={item.category}><td>{item.category}</td><td>{item.count}</td></tr>)}</tbody></table></> : <Empty text="No seller listing records exist in this category scope." />}</section>
        </div>

        <section className="reuse-analytics-panel" aria-labelledby="price-evidence-title"><div className="dashboard-section-title"><div><p className="section-kicker">Asking-price history</p><h2 id="price-evidence-title">Recorded price reductions</h2></div><p>Asking prices only · not completed sale prices</p></div><p>A reduction is shown only when a later stored asking-price entry is lower than the immediately preceding entry for the same listing.</p>{analytics.priceReductions.length ? <div className="reuse-analytics-reductions">{analytics.priceReductions.map((item) => <article key={item.id}><div><Link href={`/reuse/${item.listingId}`}>{item.title}</Link><span>{item.category}</span></div><div><span>{money.format(item.previousAskingPrice)} → {money.format(item.askingPrice)}</span><strong>Reduced by {money.format(item.reduction)}</strong></div><time dateTime={item.changedAt}>{date.format(new Date(item.changedAt))}</time></article>)}</div> : <Empty text="No traceable asking-price reduction exists in the selected category scope." />}</section>

        <section className="reuse-analytics-boundary" aria-labelledby="analytics-boundary-title"><h2 id="analytics-boundary-title">Unavailable integrations and decisions</h2><ul><li>No completed Reuse transaction dataset or API contract.</li><li>No connected FastAPI analytics service or backend-to-analytics integration.</li><li>No approved average-days, offer-conversion, category-demand, or unsold-inventory formula.</li><li>No approved analytics sample thresholds or reporting periods.</li><li>No Reuse analytics export service; therefore no export control is presented.</li></ul></section>
      </main>
    </PublicShell>
  );
}

function UnavailableMetric({ title, reason }: { title: string; reason: string }) { return <article><span>{title}</span><strong>Unavailable</strong><p>{reason}</p></article>; }
function Empty({ text }: { text: string }) { return <p className="dashboard-empty">{text}</p>; }
function Boundary({ title, text, href, action, onRetry }: { title: string; text: string; href?: string; action?: string; onRetry?: () => void }) { return <main className="reuse-dashboard-state page-container"><p className="section-kicker">Reuse Seller Center</p><h1>{title}</h1><p>{text}</p>{href && action ? <Link className="button button--primary" href={href}>{action}</Link> : <button className="button button--primary" type="button" onClick={onRetry}>Try again</button>}</main>; }
