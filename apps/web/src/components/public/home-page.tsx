"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listingImages, localities, marketplaceListings, modeMeta } from "@/data/marketplace";
import type { Locality, MarketplaceListing, MarketplaceMode } from "@/types/marketplace";
import { PublicShell } from "./public-shell";
import { SearchBar } from "./search-bar";
import { ListingCard, ListingDetail } from "./listing-card";
import { Icon } from "./icons";

const modeOrder: MarketplaceMode[] = ["new-products", "reuse", "tasks", "donations"];
const modeImages: Record<MarketplaceMode, string> = { "new-products": listingImages["new-1"], reuse: listingImages["reuse-2"], tasks: listingImages["task-1"], donations: listingImages["donation-1"] };
const promotions = [
  { image: "/marketplace/banners/market-sale.jpg", eyebrow: "Marketplace offers", title: "Discover more for less.", action: "Browse all offers", href: "/marketplace" },
  { image: "/marketplace/banners/fashion-sale.jpg", eyebrow: "Seasonal finds", title: "Fresh styles, local prices.", action: "Shop new products", href: "/marketplace?mode=new-products" },
  { image: "/marketplace/banners/local-retail.jpg", eyebrow: "Local marketplace", title: "Useful products, close to home.", action: "Explore nearby", href: "/discover" },
  { image: "/marketplace/banners/skills-work.jpg", eyebrow: "Skills marketplace", title: "Find help for the work ahead.", action: "Browse tasks", href: "/marketplace?mode=tasks" },
];

function PromotionCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % promotions.length), 5000);
    return () => window.clearInterval(timer);
  }, [paused]);
  return <section className="promotion-carousel" aria-roledescription="carousel" aria-label="Marketplace promotions" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={() => setPaused(false)}>
    <div className="promotion-track" style={{ transform: `translateX(-${active * 100}%)` }}>{promotions.map((promotion, index) => <Link key={promotion.image} href={promotion.href} className="market-banner" aria-hidden={index !== active} tabIndex={index === active ? 0 : -1}><Image src={promotion.image} alt="" fill priority={index === 0} sizes="(max-width: 900px) 100vw, 42vw"/><span><small>{promotion.eyebrow}</small><strong>{promotion.title}</strong><b>{promotion.action} <Icon name="arrow" size={16}/></b></span></Link>)}</div>
    <div className="promotion-controls"><button type="button" aria-label="Previous promotion" onClick={() => setActive((active - 1 + promotions.length) % promotions.length)}><Icon name="chevron" size={18}/></button><div>{promotions.map((promotion, index) => <button key={promotion.image} type="button" aria-label={`Show promotion ${index + 1}`} aria-current={active === index ? "true" : undefined} onClick={() => setActive(index)}/>)}</div><button type="button" aria-label="Next promotion" onClick={() => setActive((active + 1) % promotions.length)}><Icon name="chevron" size={18}/></button></div>
  </section>;
}

export function HomePage() {
  const router = useRouter();
  const [locality, setLocality] = useState<Locality>("DHA Phase 6");
  const [localMode, setLocalMode] = useState<"all" | MarketplaceMode>("all");
  const [expandedMode, setExpandedMode] = useState<MarketplaceMode | null>(null);
  const [selected, setSelected] = useState<MarketplaceListing | null>(null);
  const localItems = marketplaceListings.filter((item) => item.locality === locality && (localMode === "all" || item.mode === localMode)).slice(0, 4);
  const featured = [...marketplaceListings.filter((item) => item.featured), marketplaceListings.find((item) => item.id === "new-2")].filter((item): item is MarketplaceListing => Boolean(item));
  const locationSlug = locality.toLowerCase().replaceAll(" ", "-");

  return <PublicShell>
    <section className="market-hero"><div className="page-container market-hero__grid">
      <div className="market-hero__copy"><p className="section-kicker">One local marketplace · Four ways to exchange</p><h1>Find useful things and opportunities near you.</h1><p>Shop new, buy pre-owned, find skilled help, or connect resources with community needs.</p><SearchBar locality={locality}/><div className="hero-locality"><Icon name="pin" size={18}/><label>Browsing near <select value={locality} onChange={(event) => setLocality(event.target.value as Locality)}>{localities.map((item) => <option key={item}>{item}</option>)}</select></label><button type="button" onClick={() => router.push(`/discover?location=${locationSlug}`)}>See nearby</button></div></div>
      <PromotionCarousel/>
    </div></section>
    <section className="category-strip" aria-labelledby="category-title"><div className="page-container"><div className="compact-heading"><div><p className="section-kicker">Category quick access</p><h2 id="category-title">Choose how you want to exchange</h2></div><Link href="/marketplace">View all <Icon name="arrow" size={16}/></Link></div>{expandedMode ? <div className="category-expanded"><button className="category-close" type="button" onClick={() => setExpandedMode(null)} aria-label="Close expanded category"><Icon name="close"/></button><Link href={`/marketplace?mode=${expandedMode}`} className="category-feature"><span><Image src={modeImages[expandedMode]} alt="" fill sizes="260px"/></span><strong>{modeMeta[expandedMode].short}</strong><small>{modeMeta[expandedMode].description}</small></Link><div className="category-listings">{marketplaceListings.filter((item) => item.mode === expandedMode).map((item) => <ListingCard key={item.id} item={item} onOpen={setSelected}/>)}</div><Link className="category-show-more" href={`/marketplace?mode=${expandedMode}`}>Show more <Icon name="arrow" size={18}/></Link></div> : <div className="category-quick-list">{modeOrder.map((mode) => <button key={mode} type="button" onClick={() => setExpandedMode(mode)}><span className="category-quick-list__image"><Image src={modeImages[mode]} alt="" fill sizes="72px"/></span><span><strong>{modeMeta[mode].short}</strong><small>{modeMeta[mode].description}</small></span><Icon name="chevron" size={20}/></button>)}</div>}</div></section>
    <section className="home-section featured-section"><div className="page-container"><div className="compact-heading"><div><p className="section-kicker">Featured nearby</p><h2>Worth a closer look</h2></div><Link href="/marketplace">Explore marketplace <Icon name="arrow" size={17}/></Link></div><div className="listing-grid listing-grid--featured">{featured.map((item) => <ListingCard key={item.id} item={item} onOpen={setSelected}/>)}</div></div></section>
    <section className="home-section local-section"><div className="page-container"><div className="local-toolbar"><div><p className="section-kicker">Local discovery</p><h2>Available around {locality}</h2></div><label><Icon name="pin" size={18}/><span className="sr-only">Locality</span><select value={locality} onChange={(event) => setLocality(event.target.value as Locality)}>{localities.map((item) => <option key={item}>{item}</option>)}</select></label></div><div className="mini-tabs">{[{ value: "all", label: "All" }, ...modeOrder.map((mode) => ({ value: mode, label: modeMeta[mode].short }))].map((item) => <button key={item.value} className={localMode === item.value ? "is-active" : ""} onClick={() => setLocalMode(item.value as typeof localMode)}>{item.label}</button>)}</div><div className="listing-grid">{localItems.length ? localItems.map((item) => <ListingCard key={item.id} item={item} onOpen={setSelected}/>) : <div className="empty-state"><h3>No matching results in {locality}</h3><p>Try another mode or locality.</p></div>}</div><Link className="button button--secondary local-more" href={`/discover?location=${locationSlug}${localMode !== "all" ? `&mode=${localMode}` : ""}`}>See everything near {locality}</Link></div></section>
    <section className="home-section how-section"><div className="page-container"><div className="compact-heading"><div><p className="section-kicker">Simple discovery</p><h2>One account, the right context.</h2></div></div><ol className="steps"><li><span>01</span><h3>Search or browse</h3><p>Start with an item, task, cause, or locality.</p></li><li><span>02</span><h3>Compare clearly</h3><p>See the details that matter for each exchange.</p></li><li><span>03</span><h3>Open the listing</h3><p>Review the selected record without losing your place.</p></li><li><span>04</span><h3>Continue securely</h3><p>Sign in only when an account action is needed.</p></li></ol></div></section>
    <section className="home-cta"><div className="page-container"><div><p className="section-kicker">Start exploring</p><h2>Your next useful exchange could be nearby.</h2></div><div><Link className="button button--accent" href="/auth/register">Create account</Link><Link className="button button--light" href="/marketplace">Explore marketplace</Link></div></div></section>
    <ListingDetail item={selected} onClose={() => setSelected(null)}/>
  </PublicShell>;
}
