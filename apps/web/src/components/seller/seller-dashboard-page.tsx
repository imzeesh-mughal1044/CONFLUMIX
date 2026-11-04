"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PublicShell } from "@/components/public/public-shell";
import { readAuthSession } from "@/lib/auth";
import { readManagedListings } from "@/services/listing-management";
import { readSellerOrders, statusLabel } from "@/services/orders";
import { readReturnRecords } from "@/services/return-analytics";
import { promotionConflicts, promotionStatus, readPromotions } from "@/services/promotions";
import { calculateSellerCompletion, configuredSubcategoryCount, newProductListingEligibility, readSellerSetup } from "@/services/seller-setup";
import { demoActivity, storeIdForName } from "@/services/storefront";
import type { ManagedListing } from "@/types/listing-management";
import type { Promotion } from "@/types/promotions";
import type { OrderRecord } from "@/types/orders";
import type { SellerSetup } from "@/types/seller-setup";

const money = new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 });
export function SellerDashboardPage() {
  const [setup, setSetup] = useState<SellerSetup | null>(null);
  const [managed, setManaged] = useState<ManagedListing[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [returnCount, setReturnCount] = useState(0);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  useEffect(() => { queueMicrotask(() => { const current=readSellerSetup(),seller=current.storeName||"Sound & Form"; setSetup(current); setManaged(readManagedListings(seller));setPromotions(readPromotions(seller));setOrders(readSellerOrders(seller));setReturnCount(readReturnRecords(seller).length); }); void readAuthSession().then((session) => setAuthenticated(Boolean(session))); }, []);
  const dashboard = useMemo(() => {
    if (!setup) return null;
    const seller = setup.storeName || "Sound & Form";
    const published = managed.filter((item)=>item.status==="active").map((item)=>({id:item.id,title:item.title,stock:item.quantity}));
    const drafts = managed.filter((item)=>item.status==="draft");
    return { seller, published, drafts, eligibility: newProductListingEligibility(setup), completion: calculateSellerCompletion(setup), orders, activity: seller === "Sound & Form" ? demoActivity : [] };
  }, [setup, managed,orders]);
  if (setup === null || authenticated === null || !dashboard) return <PublicShell><div className="seller-dashboard page-container"><div className="dashboard-loading" role="status">Loading your seller workspace…</div></div></PublicShell>;
  if (!authenticated) return <PublicShell><div className="store-state page-container"><p className="section-kicker">Seller workspace</p><h1>Sign in to open your dashboard.</h1><p>This private area shows seller setup, products, orders, and store activity.</p><Link className="button button--primary" href="/auth/login?next=/dashboard/new-products">Sign in</Link></div></PublicShell>;
  const outOfStock = dashboard.published.filter((item) => item.stock === 0);
  const lowStock = dashboard.published.filter((item) => item.stock > 0 && item.stock <= 5);
  const pending = dashboard.orders.filter((item) => ["pending","confirmed","processing","return-requested"].includes(item.status)).length;
  const completed = dashboard.orders.filter((item) => item.status === "completed").length;
  const storeHref = `/stores/${storeIdForName(setup.storeName || "Sound & Form")}`;
  const promotionCounts={active:promotions.filter((item)=>promotionStatus(item)==="active").length,scheduled:promotions.filter((item)=>promotionStatus(item)==="scheduled").length,conflicts:promotions.filter((item)=>promotionConflicts(item,promotions,managed).length>0).length};
  return <PublicShell><div className="seller-dashboard page-container">
    <header className="seller-dashboard__header"><div><p className="section-kicker">New Product Seller Dashboard</p><h1>{setup.storeName || "Your seller workspace"}</h1><p>Monitor your New Product store and move directly to the work that needs attention.</p></div><div className="dashboard-primary-actions"><Link className="button button--primary" href="/new-products/sell/new">Add product</Link><Link className="button button--secondary" href={storeHref}>View storefront</Link></div></header>
    {!dashboard.eligibility.profileComplete ? <SetupNotice title="Complete your seller profile" detail={`${dashboard.completion.percentage}% complete · ${dashboard.completion.missing.length} items remaining`} href="/dashboard/seller-center/setup" action="Continue profile setup"/> : !dashboard.eligibility.categoriesComplete ? <SetupNotice title="Configure your New Product categories" detail="Choose at least one parent category and its supported subcategories before publishing." href="/dashboard/seller-center/new-products/categories" action="Manage categories"/> : <section className="setup-success" aria-label="Seller setup complete"><div><strong>Seller setup complete</strong><span>{setup.productCategories.length} parent categories · {configuredSubcategoryCount(setup)} subcategories</span></div><Link href="/dashboard/seller-center/new-products/categories">Manage categories</Link></section>}
    <section aria-labelledby="summary-title"><div className="dashboard-section-title"><div><p className="section-kicker">Store overview</p><h2 id="summary-title">At a glance</h2></div><p>Counts are calculated from your current catalogue and orders.</p></div><div className="metric-grid"><Metric label="Active products" value={dashboard.published.length}/><Metric label="Draft listings" value={dashboard.drafts.length}/><Metric label="Out of stock" value={outOfStock.length}/><Metric label="Total orders" value={dashboard.orders.length}/><Metric label="Needs attention" value={pending}/><Metric label="Completed orders" value={completed}/></div></section>
    <div className="dashboard-columns"><div className="dashboard-stack">
      <Panel kicker="Inventory" title="Stock alerts" action={<Link href="/new-products/sell/new">Add product</Link>}>{lowStock.length || outOfStock.length ? <ul className="dashboard-list">{[...outOfStock, ...lowStock].map((item) => <li key={item.id}><div><strong>{item.title}</strong><span>{item.stock === 0 ? "Out of stock" : `${item.stock} remaining`}</span></div><Link href={`/new-products/sell/${item.id}/edit`}>Update stock</Link></li>)}</ul> : <Empty text="No low-stock or unavailable products need attention."/>}</Panel>
      <Panel kicker="Orders" title="Recent orders" action={<Link href="/dashboard/new-products/orders">View all</Link>}>{dashboard.orders.length ? <div className="orders-list">{dashboard.orders.slice(0,4).map((order) => <article key={order.id}><div><strong>{order.reference}</strong><span>{order.items[0]?.title??"Product snapshot unavailable"}</span></div><div><span className={`order-status order-status--${order.status}`}>{statusLabel(order.status)}</span><strong>{money.format(order.total)}</strong></div></article>)}</div> : <Empty text="No demo-checkout orders are recorded for this store yet."/>}</Panel>
      <Panel kicker="Listing quality" title="Issues to resolve">{dashboard.drafts.length ? <ul className="dashboard-list">{dashboard.drafts.slice(0, 4).map((item) => <li key={item.id ?? item.title}><div><strong>{item.title || "Untitled draft"}</strong><span>Draft listings are not visible to buyers.</span></div>{item.id && <Link href={`/new-products/sell/${item.id}/quality`}>Review quality</Link>}</li>)}</ul> : <Empty text="No draft listing warnings are available."/>}</Panel>
    </div><aside className="dashboard-stack">
      <Panel kicker="Activity" title="Recent store activity">{dashboard.activity.length ? <ol className="activity-list">{dashboard.activity.map((item) => <li key={item.id}><strong>{item.title}</strong><span>{item.detail}</span><time dateTime={item.at}>{new Intl.DateTimeFormat("en-PK", { day: "numeric", month: "short" }).format(new Date(item.at))}</time></li>)}</ol> : <Empty text="No recent product or order activity is available."/>}</Panel>
      <Panel kicker="Performance" title="Product performance"><Empty text="Views, favourites, and conversion metrics will appear when recorded analytics data is available."/></Panel>
      <Panel kicker="Returns" title="Return patterns" action={<Link href="/dashboard/new-products/returns">View insights</Link>}>{returnCount?<p className="dashboard-empty"><strong>{returnCount}</strong> recorded return request{returnCount===1?"":"s"}. Review structured reasons and supported patterns.</p>:<Empty text="There is not enough return data to identify a meaningful pattern."/>}</Panel>
      <Panel kicker="Promotions" title="Promotion health" action={<Link href="/dashboard/new-products/promotions">Manage</Link>}>{promotions.length?<div className="promotion-health"><span><strong>{promotionCounts.active}</strong> active</span><span><strong>{promotionCounts.scheduled}</strong> scheduled</span><span><strong>{promotionCounts.conflicts}</strong> with conflicts</span></div>:<Empty text="No promotion records are available for this store."/>}</Panel>
    </aside></div>
  </div></PublicShell>;
}
function Metric({ label, value }: { label: string; value: number }) { return <article className="metric-card"><span>{label}</span><strong>{value}</strong></article>; }
function SetupNotice({ title, detail, href, action }: { title: string; detail: string; href: string; action: string }) { return <section className="setup-notice"><div><strong>{title}</strong><span>{detail}</span></div><Link className="button button--primary" href={href}>{action}</Link></section>; }
function Panel({ kicker, title, action, children }: { kicker: string; title: string; action?: React.ReactNode; children: React.ReactNode }) { return <section className="dashboard-panel"><div className="panel-heading"><div><p className="section-kicker">{kicker}</p><h2>{title}</h2></div>{action}</div>{children}</section>; }
function Empty({ text }: { text: string }) { return <p className="dashboard-empty">{text}</p>; }
