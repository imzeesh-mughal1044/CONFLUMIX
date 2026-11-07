"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PublicShell } from "@/components/public/public-shell";
import { readAuthSession } from "@/lib/auth";
import { allReuseListings, reuseListingEvent } from "@/services/reuse";
import { readSellerOnboarding } from "@/services/seller-onboarding";
import type { ReuseListing } from "@/types/reuse";
import { reuseConditions, reuseStatuses } from "@/types/reuse";

const pageSize = 6;
const money = new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 });
const date = new Intl.DateTimeFormat("en-PK", { day: "numeric", month: "short", year: "numeric" });
type PageState = "loading" | "permission" | "ready" | "error";

export function ManageReuseListings() {
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

  const query = params.get("q")?.trim() ?? "";
  const rawStatus = params.get("status") ?? "all";
  const status = rawStatus === "draft" || reuseStatuses.includes(rawStatus as (typeof reuseStatuses)[number]) ? rawStatus : "all";
  const rawCondition = params.get("condition") ?? "all";
  const condition = reuseConditions.includes(rawCondition as (typeof reuseConditions)[number]) ? rawCondition : "all";
  const category = params.get("category") ?? "all";
  const min = parseMoney(params.get("min"));
  const max = parseMoney(params.get("max"));
  const categories = useMemo(() => [...new Set(records.map((item) => item.category))].sort(), [records]);
  const filtered = useMemo(() => records.filter((item) => {
    if (query && !`${item.title} ${item.category} ${item.brand ?? ""} ${item.model ?? ""}`.toLowerCase().includes(query.toLowerCase())) return false;
    if (status === "draft" ? item.lifecycle !== "draft" : status !== "all" && (item.lifecycle === "draft" || item.status !== status)) return false;
    if (condition !== "all" && item.condition !== condition) return false;
    if (category !== "all" && item.category !== category) return false;
    if (min !== undefined && item.askingPrice < min) return false;
    if (max !== undefined && item.askingPrice > max) return false;
    return true;
  }), [category, condition, max, min, query, records, status]);
  const requestedPage = Math.max(1, Number.parseInt(params.get("page") ?? "1", 10) || 1);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(requestedPage, pageCount);
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  function update(values: Record<string, string | undefined>) {
    const next = new URLSearchParams(params.toString());
    Object.entries(values).forEach(([key, value]) => value && value !== "all" ? next.set(key, value) : next.delete(key));
    if (!("page" in values)) next.delete("page");
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`);
  }

  if (state === "loading") return <PublicShell><div className="route-loading" role="status">Loading your Reuse listings…</div></PublicShell>;
  if (state === "permission") return <PublicShell><Boundary title="Reuse seller access required" text="This account has not started Reuse seller setup." href="/become-a-seller" action="Start seller setup" /></PublicShell>;
  if (state === "error") return <PublicShell><Boundary title="Listings could not be loaded" text="Your browser-local listing records were not changed." onRetry={() => { setState("loading"); void load(); }} /></PublicShell>;

  return (
    <PublicShell>
      <main className="reuse-management page-container">
        <nav className="reuse-dashboard-nav" aria-label="Reuse Seller Center">
          <Link href="/dashboard/reuse">Overview</Link>
          <Link className="is-active" href="/dashboard/reuse/listings" aria-current="page">Listings</Link>
          <Link href="/reuse/sell/new">Create listing</Link>
          <Link href="/dashboard/seller-center/reuse/categories">Categories</Link>
        </nav>
        <header className="reuse-management__header">
          <div><p className="section-kicker">Reuse Seller Center</p><h1>Manage Reuse Listings</h1><p>Search and review only the Reuse listings owned by the current shared seller account.</p></div>
          <Link className="button button--primary" href="/reuse/sell/new">Create Reuse listing</Link>
        </header>
        <div className="prototype-banner" role="note"><strong>Browser-local management</strong><span>Filters and pages use this seller&apos;s local listing source. No backend authorization, bulk operations, history, or rollback service is connected.</span></div>

        <section className="reuse-management-filters" aria-labelledby="listing-filters-title">
          <div className="reuse-management-filters__heading"><div><p className="section-kicker">Find listings</p><h2 id="listing-filters-title">Search and filters</h2></div>{params.size > 0 && <button type="button" onClick={() => router.replace(pathname)}>Clear all</button>}</div>
          <form onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); update({ q: String(form.get("q") ?? "").trim() || undefined, min: String(form.get("min") ?? "").trim() || undefined, max: String(form.get("max") ?? "").trim() || undefined }); }}>
            <label className="is-wide">Search title, category, brand, or model<input name="q" type="search" defaultValue={query} placeholder="Search your Reuse listings" /></label>
            <label>Status<select value={status} onChange={(event) => update({ status: event.target.value })}><option value="all">All statuses</option><option value="draft">Draft</option>{reuseStatuses.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
            <label>Category<select value={categories.includes(category) ? category : "all"} onChange={(event) => update({ category: event.target.value })}><option value="all">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>Condition<select value={condition} onChange={(event) => update({ condition: event.target.value })}><option value="all">All conditions</option>{reuseConditions.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>Minimum asking price<input name="min" type="number" min="0" step="1" defaultValue={min ?? ""} /></label>
            <label>Maximum asking price<input name="max" type="number" min="0" step="1" defaultValue={max ?? ""} /></label>
            <button className="button button--secondary" type="submit">Apply search and price</button>
          </form>
          <p className="reuse-management-count" role="status">Showing {visible.length} of {filtered.length} matching seller listing{filtered.length === 1 ? "" : "s"}</p>
        </section>

        <section className="reuse-management-results" aria-labelledby="listing-results-title">
          <div className="dashboard-section-title"><div><p className="section-kicker">Current records</p><h2 id="listing-results-title">Your Reuse listings</h2></div><p>Condition, listing status, and availability are separate fields.</p></div>
          {visible.length ? <div className="reuse-management-list">{visible.map((item) => <ListingRow key={item.id} item={item} />)}</div> : <div className="reuse-management-empty"><h3>{records.length ? "No listings match these filters" : "No Reuse listings yet"}</h3><p>{records.length ? "Clear or change the active filters to see other seller records." : "Create a draft or published listing to begin managing it here."}</p>{!records.length && <Link className="button button--primary" href="/reuse/sell/new">Create listing</Link>}</div>}
          {filtered.length > pageSize && <nav className="reuse-pagination" aria-label="Listing pages"><button type="button" disabled={page === 1} onClick={() => update({ page: String(page - 1) })}>Previous</button><span>Page {page} of {pageCount}</span><button type="button" disabled={page === pageCount} onClick={() => update({ page: String(page + 1) })}>Next</button></nav>}
        </section>

        <section className="reuse-bulk-boundary" aria-labelledby="bulk-boundary-title"><p className="section-kicker">Bulk operations</p><h2 id="bulk-boundary-title">No supported bulk action</h2><p>The repository has no Reuse bulk-operation preview, confirmation, per-record result, operation history, or state-checked rollback service. Selection controls are withheld so the interface does not imply an unsafe operation is available.</p></section>
      </main>
    </PublicShell>
  );
}

function ListingRow({ item }: { item: ReuseListing }) {
  const image = item.media[0];
  const editable = item.lifecycle === "draft" || item.status === "Active";
  return <article className="reuse-management-row"><div className="reuse-management-row__image">{image ? <Image src={image.src} alt={image.alt} fill sizes="80px" unoptimized={image.local} /> : <span>No image</span>}</div><div className="reuse-management-row__main"><div><span className="reuse-management-status">{item.lifecycle === "draft" ? "Draft" : item.status}</span><span>{item.availability}</span></div><h3>{item.title || "Untitled listing"}</h3><p>{item.category} · {item.condition}</p></div><dl><div><dt>Asking price</dt><dd>{money.format(item.askingPrice)}</dd></div><div><dt>Listed</dt><dd><time dateTime={item.createdAt}>{date.format(new Date(item.createdAt))}</time></dd></div></dl><div className="reuse-management-row__actions">{item.lifecycle !== "draft" && item.status !== "Removed" && <Link href={`/reuse/${item.id}`}>View listing</Link>}{editable ? <Link href={`/reuse/sell/${item.id}/edit`}>Edit listing</Link> : <span title="No supported edit contract exists for this lifecycle state">Editing unavailable</span>}</div></article>;
}

function Boundary({ title, text, href, action, onRetry }: { title: string; text: string; href?: string; action?: string; onRetry?: () => void }) {
  return <main className="reuse-dashboard-state page-container"><p className="section-kicker">Reuse Seller Center</p><h1>{title}</h1><p>{text}</p>{href && action ? <Link className="button button--primary" href={href}>{action}</Link> : <button className="button button--primary" type="button" onClick={onRetry}>Try again</button>}</main>;
}

function parseMoney(value: string | null) {
  if (!value?.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}
