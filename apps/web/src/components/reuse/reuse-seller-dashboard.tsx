"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PublicShell } from "@/components/public/public-shell";
import { readAuthSession, type AuthSession } from "@/lib/auth";
import { readReuseOffers, reuseOfferEvent } from "@/services/reuse-offers";
import { allReuseListings, reuseListingEvent } from "@/services/reuse";
import { readSellerOnboarding } from "@/services/seller-onboarding";
import { readSellerSetup } from "@/services/seller-setup";
import type { ReuseListing, ReuseOffer } from "@/types/reuse";

type DashboardState =
  | { kind: "loading" }
  | { kind: "permission" }
  | {
      kind: "ready";
      session: AuthSession;
      configured: boolean;
      categories: string[];
      listings: ReuseListing[];
      offers: ReuseOffer[];
    }
  | { kind: "error" };

const date = new Intl.DateTimeFormat("en-PK", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function ReuseSellerDashboard() {
  const pathname = usePathname();
  const router = useRouter();
  const [state, setState] = useState<DashboardState>({ kind: "loading" });

  const load = useCallback(async () => {
    try {
      const session = await readAuthSession();
      if (!session) {
        router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);
        return;
      }
      const onboarding = readSellerOnboarding(session.email);
      if (!onboarding?.reuseInterestSavedAt) {
        setState({ kind: "permission" });
        return;
      }
      const normalized = session.email.toLowerCase();
      const setup = readSellerSetup();
      setState({
        kind: "ready",
        session,
        configured: setup.reuseEnabled && setup.reuseCategories.length > 0,
        categories: setup.reuseCategories,
        listings: allReuseListings().filter(
          (item) => item.ownerEmail?.toLowerCase() === normalized,
        ),
        offers: readReuseOffers().filter(
          (offer) => offer.sellerEmail?.toLowerCase() === normalized,
        ),
      });
    } catch {
      setState({ kind: "error" });
    }
  }, [pathname, router]);

  useEffect(() => {
    queueMicrotask(() => void load());
    const refresh = () => void load();
    window.addEventListener(reuseListingEvent, refresh);
    window.addEventListener(reuseOfferEvent, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(reuseListingEvent, refresh);
      window.removeEventListener(reuseOfferEvent, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [load]);

  if (state.kind === "loading") {
    return <PublicShell><div className="route-loading" role="status">Loading your Reuse seller workspace…</div></PublicShell>;
  }
  if (state.kind === "permission") {
    return (
      <PublicShell>
        <main className="reuse-dashboard-state page-container">
          <p className="section-kicker">Reuse Seller Center</p>
          <h1>Reuse seller setup required</h1>
          <p>This account has not started the shared Seller Center setup for Reuse.</p>
          <Link className="button button--primary" href="/become-a-seller">Start Reuse seller setup</Link>
        </main>
      </PublicShell>
    );
  }
  if (state.kind === "error") {
    return (
      <PublicShell>
        <main className="reuse-dashboard-state page-container" role="alert">
          <p className="section-kicker">Reuse Seller Center</p>
          <h1>Dashboard could not be loaded</h1>
          <p>Your browser-local seller records were not changed.</p>
          <button className="button button--primary" type="button" onClick={() => { setState({ kind: "loading" }); void load(); }}>Try again</button>
        </main>
      </PublicShell>
    );
  }

  return <DashboardContent state={state} />;
}

function DashboardContent({ state }: { state: Extract<DashboardState, { kind: "ready" }> }) {
  const summary = useMemo(() => ({
    active: state.listings.filter((item) => (item.lifecycle ?? "published") === "published" && item.status === "Active").length,
    drafts: state.listings.filter((item) => item.lifecycle === "draft").length,
    reserved: state.listings.filter((item) => (item.lifecycle ?? "published") === "published" && item.status === "Reserved").length,
    pendingOffers: state.offers.filter((offer) => offer.status === "pending").length,
  }), [state.listings, state.offers]);
  const recent = useMemo(
    () => [...state.listings].sort((a, b) => (b.updatedAt ?? b.createdAt).localeCompare(a.updatedAt ?? a.createdAt)).slice(0, 5),
    [state.listings],
  );

  return (
    <PublicShell>
      <main className="seller-dashboard reuse-dashboard page-container">
        <nav className="reuse-dashboard-nav" aria-label="Reuse Seller Center">
          <Link className="is-active" href="/dashboard/reuse" aria-current="page">Overview</Link>
          <Link href="/dashboard/reuse/listings">Listings</Link>
          <Link href="/reuse/sell/new">Create listing</Link>
          <Link href="/dashboard/seller-center/reuse/categories">Categories</Link>
        </nav>
        <header className="seller-dashboard__header">
          <div>
            <p className="section-kicker">Shared Seller Center · Reuse</p>
            <h1>Reuse Seller Dashboard</h1>
            <p>Review seller-scoped prototype listings and offers without mixing New Product orders or performance data.</p>
          </div>
          <div className="dashboard-primary-actions">
            {state.configured ? <Link className="button button--primary" href="/reuse/sell/new">Create Reuse listing</Link> : <Link className="button button--primary" href="/dashboard/seller-center/reuse/categories">Configure Reuse</Link>}
            <Link className="button button--secondary" href="/reuse">View Reuse marketplace</Link>
          </div>
        </header>

        {!state.configured ? (
          <section className="setup-notice" aria-label="Reuse setup incomplete">
            <div><strong>Configure Reuse categories</strong><span>Select at least one supported category before creating a listing.</span></div>
            <Link className="button button--primary" href="/dashboard/seller-center/reuse/categories">Continue setup</Link>
          </section>
        ) : (
          <section className="setup-success" aria-label="Reuse setup configured">
            <div><strong>Reuse category setup configured</strong><span>{state.categories.length} categor{state.categories.length === 1 ? "y" : "ies"} available to this shared seller account.</span></div>
            <Link href="/dashboard/seller-center/reuse/categories">Manage categories</Link>
          </section>
        )}

        <div className="prototype-banner" role="note"><strong>Browser-local prototype</strong><span>Counts are derived from this account&apos;s local Reuse listing and offer records, not live backend metrics.</span></div>

        <section aria-labelledby="reuse-summary-title">
          <div className="dashboard-section-title"><div><p className="section-kicker">Seller scope</p><h2 id="reuse-summary-title">At a glance</h2></div><p>Current records for {state.session.email}</p></div>
          <div className="metric-grid reuse-metric-grid">
            <Metric label="Active listings" value={summary.active} detail="Published records in Active state" href="/dashboard/reuse/listings?status=Active" />
            <Metric label="Draft listings" value={summary.drafts} detail="Private browser-local drafts" href="/dashboard/reuse/listings?status=draft" />
            <Metric label="Reserved listings" value={summary.reserved} detail="Reserved is not sold" href="/dashboard/reuse/listings?status=Reserved" />
            <Metric label="Pending offers" value={summary.pendingOffers} detail="Pending is not completed" />
            <Metric label="Completed transactions" value="Unavailable" detail="No Reuse transaction service" />
            <Metric label="Average days listed" value="Unavailable" detail="No approved completed-period definition" />
          </div>
        </section>

        <div className="dashboard-columns">
          <div className="dashboard-stack">
            <Panel kicker="Listings" title="Recent seller records" action={state.configured ? <Link href="/reuse/sell/new">Create listing</Link> : undefined}>
              {recent.length ? <ul className="dashboard-list">{recent.map((item) => <li key={item.id}><div><strong>{item.title || "Untitled listing"}</strong><span>{item.lifecycle === "draft" ? "Draft" : item.status} · {item.category}</span><time dateTime={item.updatedAt ?? item.createdAt}>{date.format(new Date(item.updatedAt ?? item.createdAt))}</time></div><Link href={item.lifecycle === "draft" ? `/reuse/sell/${item.id}/edit` : `/reuse/${item.id}`}>{item.lifecycle === "draft" ? "Continue editing" : "View listing"}</Link></li>)}</ul> : <Empty text="No seller-owned Reuse listings are stored for this account." />}
            </Panel>
            <Panel kicker="Attention" title="Listing issues and expiry alerts">
              <Empty text="No validation, moderation, or expiry service exists for Reuse listings. No issue or expiry alert is inferred from listing age or draft state." />
            </Panel>
          </div>
          <aside className="dashboard-stack">
            <Panel kicker="Offers" title="Offer activity">
              {summary.pendingOffers ? <p className="dashboard-empty"><strong>{summary.pendingOffers}</strong> pending offer{summary.pendingOffers === 1 ? "" : "s"} recorded for this seller. A seller-wide offer-management route is not implemented; open an offer from its existing private status link.</p> : <Empty text="No pending seller offers are recorded in this browser." />}
            </Panel>
            <Panel kicker="Transactions" title="Reservations and handovers"><Empty text="No authoritative Reuse reservation, completed transaction, schedule, or handover activity is available." /></Panel>
            <Panel kicker="Analytics" title="Reuse performance"><Empty text="RUS-12 and its metric definitions are not implemented. Turnover, demand, conversion, and revenue are not estimated here." /></Panel>
            <Panel kicker="Activity" title="Event history"><Empty text="There is no Reuse activity-event service. Listing records above use their stored timestamps; no sale or handover events are fabricated." /></Panel>
          </aside>
        </div>
      </main>
    </PublicShell>
  );
}

function Metric({ label, value, detail, href }: { label: string; value: number | string; detail: string; href?: string }) {
  const content = <><span>{label}</span><strong className={typeof value === "string" ? "is-unavailable" : ""}>{value}</strong><small>{detail}</small></>;
  return <article className="metric-card">{href ? <Link href={href}>{content}</Link> : content}</article>;
}
function Panel({ kicker, title, action, children }: { kicker: string; title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return <section className="dashboard-panel"><div className="panel-heading"><div><p className="section-kicker">{kicker}</p><h2>{title}</h2></div>{action}</div>{children}</section>;
}
function Empty({ text }: { text: string }) {
  return <p className="dashboard-empty">{text}</p>;
}
