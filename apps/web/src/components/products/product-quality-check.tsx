"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PublicShell } from "@/components/public/public-shell";
import { Icon } from "@/components/public/icons";
import { parentAttributeTemplates } from "@/data/product-attribute-templates";
import { listingFromProduct, readStoredListings } from "@/services/product-listings";
import { readSellerSetup } from "@/services/seller-setup";
import type { ListingFormData } from "@/types/product-listing";
import type { Product } from "@/types/products";

const demoListing: ListingFormData = {
  id: "demo-quality",
  title: "Wireless Noise-Cancelling Headphones",
  category: "Electronics & Smart Devices",
  subcategory: "Headphones",
  description: "Over-ear wireless headphones with active noise cancellation.",
  price: "18500",
  quantity: "12",
  images: [],
  sku: "DEMO-NC-01",
  tags: ["wireless", "headphones"],
  attributes: { Brand: "SoundForm", Model: "", Warranty: "" },
  variants: [],
  delivery: "Local delivery in 2–3 days.",
  cancellation: "Before dispatch.",
  returns: "Seven-day return for manufacturing defects.",
  status: "draft",
};

type CheckState = "complete" | "missing" | "optional";

function StateMark({ state }: { state: CheckState }) {
  return <span className={`quality-mark quality-mark--${state}`} aria-hidden="true">{state === "complete" ? "✓" : state === "missing" ? "!" : "—"}</span>;
}

function Badge({ state }: { state: CheckState }) {
  return <span className={`quality-badge quality-badge--${state}`}>{state === "complete" ? "Complete" : state === "missing" ? "Required · Missing" : "Optional"}</span>;
}

export function ProductQualityCheck({ identifier, product }: { identifier: string; product?: Product }) {
  const [listing, setListing] = useState<ListingFormData | null>(null);
  const [sellerComplete, setSellerComplete] = useState(false);
  const [ready, setReady] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = readStoredListings().find((item) => item.id === identifier);
      setListing(stored ?? (product ? listingFromProduct(product) : identifier === "demo-quality" ? demoListing : null));
      const seller = readSellerSetup();
      setSellerComplete(Boolean(seller?.storeName.trim() && seller?.description.trim()));
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [identifier, product]);

  const requiredAttributes = useMemo(() => listing?.category ? parentAttributeTemplates[listing.category] ?? [] : [], [listing]);
  const optionalAttributes = useMemo(() => {
    if (!listing?.category) return [];
    return Object.keys(listing.attributes).filter((name) => !requiredAttributes.includes(name));
  }, [listing, requiredAttributes]);
  const checks = useMemo(() => listing ? [
    listing.title.trim().length > 0,
    listing.description.trim().length > 0,
    Number(listing.price) > 0,
    Number.isInteger(Number(listing.quantity)) && Number(listing.quantity) >= 1,
    listing.images.length >= 1 && listing.images.length <= 20,
    Boolean(listing.category),
    ...requiredAttributes.map((name) => Boolean(listing.attributes[name]?.trim())),
    sellerComplete,
  ] : [], [listing, requiredAttributes, sellerComplete]);
  const score = checks.length ? Math.round(checks.filter(Boolean).length / checks.length * 100) : 0;
  const canPublish = checks.length > 0 && checks.every(Boolean);
  const editHref = (field: string) => `/new-products/sell/${encodeURIComponent(identifier)}/edit#${field}`;

  function simulateFixes() {
    if (!listing) return;
    setListing({
      ...listing,
      images: listing.images.length ? listing.images : [{ id: "simulated-photo", src: "/CONFLUMIX_nav.png", name: "Simulated product photo", local: false }],
      attributes: Object.fromEntries(Object.entries(listing.attributes).concat(requiredAttributes.map((name) => [name, listing.attributes[name]?.trim() || `Demo ${name}`]))),
    });
    setSellerComplete(true);
    setNotice("Missing demo requirements completed locally.");
  }

  function publish() {
    if (!canPublish || publishing) return;
    setPublishing(true);
    window.setTimeout(() => {
      setPublishing(false);
      setNotice("Listing published successfully! (Simulated)");
    }, 700);
  }

  if (!ready) return <div className="route-loading">Loading quality check…</div>;
  if (!listing) return <PublicShell><div className="product-not-found"><p className="section-kicker">Quality check unavailable</p><h1>Listing not found</h1><p>This listing is not available in the fixture catalogue or browser-local drafts.</p><Link className="button button--primary" href="/new-products">Return to New Products</Link></div></PublicShell>;

  const titleComplete = Boolean(listing.title.trim() && listing.description.trim());
  const priceComplete = Number(listing.price) > 0;
  const stockComplete = Number.isInteger(Number(listing.quantity)) && Number(listing.quantity) >= 1;
  const imagesComplete = listing.images.length >= 1 && listing.images.length <= 20;
  const status = score < 50 ? "Needs significant work" : score < 100 ? "Almost ready to publish" : "Ready to publish";

  return <PublicShell>
    <main className="quality-page">
      <div className="page-container">
        <nav className="product-breadcrumb" aria-label="Breadcrumb"><Link href="/dashboard">Dashboard</Link><Icon name="chevron" size={14}/><Link href="/new-products">Manage Listings</Link><Icon name="chevron" size={14}/><span aria-current="page">Quality Check</span></nav>
        <header className="quality-heading"><div><p className="section-kicker">Pre-publication review</p><h1>Quality Check: {listing.title || "Untitled product"}</h1><p>Review the requirements below to ensure your listing is ready for the CONFLUMIX marketplace.</p></div><Link className="button button--secondary" href={`/new-products/sell/${encodeURIComponent(identifier)}/edit`}>Back to Editor</Link></header>
        <div className="quality-layout">
          <div className="quality-checklist">
            <QualitySection title="Core details" description="Mandatory information buyers need to understand and purchase this product.">
              <QualityRow label="Title & description" detail={titleComplete ? "Product name and description are present." : "Add both a product title and description."} state={titleComplete ? "complete" : "missing"} edit={!titleComplete ? editHref("title") : undefined}/>
              <QualityRow label="Pricing" detail={priceComplete ? `PKR ${Number(listing.price).toLocaleString("en-PK")}` : "Price must be greater than zero."} state={priceComplete ? "complete" : "missing"} edit={!priceComplete ? editHref("price") : undefined}/>
              <QualityRow label="Inventory / stock" detail={stockComplete ? `${listing.quantity} units available` : "Stock must be at least one."} state={stockComplete ? "complete" : "missing"} edit={!stockComplete ? editHref("quantity") : undefined}/>
            </QualitySection>
            <QualitySection title="Media requirements" description="Clear media helps buyers assess the item before ordering.">
              <QualityRow label="Product images" detail={imagesComplete ? `${listing.images.length} of 20 photos added.` : "At least one photo is required."} state={imagesComplete ? "complete" : "missing"} edit={!imagesComplete ? editHref("images") : undefined}>
                {listing.images.length > 0 && <div className="quality-thumbnails">{listing.images.slice(0, 4).map((image) => <Image key={image.id} src={image.src} alt="" width={40} height={40}/>)}</div>}
              </QualityRow>
              <QualityRow label="Product video" detail={listing.video ? listing.video.name : "No video added."} state={listing.video ? "complete" : "optional"}/>
            </QualitySection>
            <QualitySection title="Category-specific attributes" description={listing.category ? `Required and optional details for ${listing.category}.` : "Choose a category to see its required attributes."}>
              <div className="quality-attributes" role="table" aria-label="Category attributes">
                <div className="quality-attribute quality-attribute--head" role="row"><span role="columnheader">Attribute</span><span role="columnheader">Current value</span><span role="columnheader">Status</span><span aria-hidden="true"/></div>
                {requiredAttributes.map((name) => { const complete = Boolean(listing.attributes[name]?.trim()); return <div className="quality-attribute" role="row" key={name}><span role="cell">{name}</span><span role="cell">{listing.attributes[name]?.trim() || "Not set"}</span><span role="cell"><Badge state={complete ? "complete" : "missing"}/></span><span role="cell">{!complete && <Link href={editHref(`attribute-${name}`)}>Edit</Link>}</span></div>; })}
                {optionalAttributes.map((name) => <div className="quality-attribute" role="row" key={name}><span role="cell">{name}</span><span role="cell">{listing.attributes[name]?.trim() || "Not set"}</span><span role="cell"><Badge state={listing.attributes[name]?.trim() ? "complete" : "optional"}/></span><span role="cell"/></div>)}
              </div>
            </QualitySection>
            <QualitySection title="Seller & storefront" description="Store information gives buyers context about who fulfils their order.">
              <QualityRow label="Shop profile" detail={sellerComplete ? "Seller profile and public store details are complete." : "Complete your seller profile to build buyer trust."} state={sellerComplete ? "complete" : "missing"} edit={!sellerComplete ? "/dashboard/seller-center/setup" : undefined}/>
            </QualitySection>
          </div>
          <aside className="quality-summary" aria-label="Listing readiness summary">
            <p className="section-kicker">Listing readiness</p><div className="quality-score"><strong>{score}%</strong><span>Complete</span></div>
            <div className="quality-progress" role="progressbar" aria-label="Listing completeness" aria-valuemin={0} aria-valuemax={100} aria-valuenow={score}><span style={{ width: `${score}%` }}/></div>
            <h2>{status}</h2><p>{canPublish ? "All mandatory checks are complete." : `${checks.filter((item) => !item).length} mandatory check${checks.filter((item) => !item).length === 1 ? "" : "s"} still need attention.`}</p>
            <button className="button button--primary quality-publish" type="button" disabled={!canPublish || publishing} onClick={publish}>{publishing ? "Publishing…" : "Publish Listing"}</button>
            <button className="quality-simulate" type="button" onClick={simulateFixes}>Complete missing demo checks</button>
            <div className="quality-tip"><strong>Before you publish</strong><p>Use specific product details and clear photos. Accurate listings reduce buyer questions and returns.</p></div>
          </aside>
        </div>
      </div>
    </main>
    {notice && <div className="product-toast" role="status">{notice}</div>}
  </PublicShell>;
}

function QualitySection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section className="quality-section"><header><h2>{title}</h2><p>{description}</p></header>{children}</section>;
}

function QualityRow({ label, detail, state, edit, children }: { label: string; detail: string; state: CheckState; edit?: string; children?: React.ReactNode }) {
  return <div className="quality-row"><StateMark state={state}/><div><strong>{label}</strong><p>{detail}</p>{children}</div><Badge state={state}/>{edit && <Link className="quality-edit" href={edit}>Edit</Link>}</div>;
}
