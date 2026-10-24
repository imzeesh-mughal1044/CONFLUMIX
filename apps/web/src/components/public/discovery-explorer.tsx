"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { localities, modeMeta } from "@/data/marketplace";
import { discoverMarketplace } from "@/services/marketplace";
import type { MarketplaceListing, MarketplaceMode, SortOption } from "@/types/marketplace";
import { Breadcrumb, PublicShell } from "./public-shell";
import { SearchBar } from "./search-bar";
import { ListingCard, ListingDetail } from "./listing-card";
import { Icon } from "./icons";

const modes: { value: "all" | MarketplaceMode; label: string }[] = [{ value: "all", label: "All modes" }, ...Object.entries(modeMeta).map(([value, meta]) => ({ value: value as MarketplaceMode, label: meta.short }))];
const slugs = new Map(localities.map((item) => [item.toLowerCase().replaceAll(" ", "-"), item]));

export function DiscoveryExplorer({ kind }: { kind: "marketplace" | "search" | "discover" }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode");
  const locationParam = searchParams.get("location");
  const mode = modes.some((item) => item.value === modeParam) ? modeParam as MarketplaceMode | "all" : "all";
  const locality = slugs.get(locationParam ?? "") ?? (kind === "discover" ? "DHA Phase 6" : undefined);
  const query = kind === "search" ? searchParams.get("q")?.trim() ?? "" : "";
  const category = searchParams.get("category") ?? "";
  const status = searchParams.get("status") ?? "";
  const condition = searchParams.get("condition") ?? "";
  const donationKind = searchParams.get("kind") === "offer" || searchParams.get("kind") === "need" ? searchParams.get("kind") as "offer" | "need" : undefined;
  const sort = (searchParams.get("sort") ?? "recommended") as SortOption;
  const [items, setItems] = useState<MarketplaceListing[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [visible, setVisible] = useState(6);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<MarketplaceListing | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const update = useCallback((changes: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(changes).forEach(([key, value]) => value ? params.set(key, value) : params.delete(key));
    router.push(`${pathname}${params.size ? `?${params}` : ""}`);
  }, [pathname, router, searchParams]);

  useEffect(() => {
    let active = true;
    discoverMarketplace({ query, mode, locality, category: category || undefined, status: status || undefined, condition: condition || undefined, donationKind, sort }).then((result) => {
      if (!active) return;
      setItems(result.items); setTotal(result.total); setCategories(result.categories); setLoading(false); setVisible(6);
    });
    return () => { active = false; };
  }, [query, mode, locality, category, status, condition, donationKind, sort]);

  const heading = kind === "marketplace" ? "Explore the marketplace" : kind === "search" ? "Search results" : "Discover around you";
  const copy = kind === "marketplace" ? "Move between four distinct forms of exchange through one connected discovery experience." : kind === "search" ? query ? `Showing matches for “${query}”.` : "Search across products, pre-owned items, tasks, and community resources." : `Explore what is available in ${locality}, without losing the distinct context of each marketplace mode.`;
  const hasFilters = Boolean(category || status || condition || donationKind || (kind !== "discover" && locality));
  const availableSorts = useMemo(() => [{ value: "recommended", label: "Recommended" }, { value: "newest", label: "Newest" }, { value: "alphabetical", label: "Alphabetical" }, ...(mode === "new-products" || mode === "reuse" ? [{ value: "price-low", label: "Price: low to high" }, { value: "price-high", label: "Price: high to low" }] : []), ...(mode === "donations" ? [{ value: "urgency", label: "Urgency" }] : [])], [mode]);
  const clearFilters = () => update({ category: undefined, status: undefined, condition: undefined, kind: undefined, sort: undefined, ...(kind !== "discover" ? { location: undefined } : {}) });

  return <PublicShell><div className="discovery-page">
    <div className="page-container"><Breadcrumb current={heading}/>
      <section className="discovery-heading"><div><p className="section-kicker">Unified local discovery</p><h1>{heading}</h1><p>{copy}</p></div>{kind === "discover" && <div className="location-spotlight"><Icon name="pin"/><span>Exploring</span><strong>{locality}</strong></div>}</section>
      <SearchBar initialValue={query} locality={locality}/>
      <div className="mode-tabs" role="tablist" aria-label="Marketplace mode">{modes.map((item) => <button key={item.value} role="tab" aria-selected={mode === item.value} className={mode === item.value ? "is-active" : ""} onClick={() => update({ mode: item.value === "all" ? undefined : item.value, category: undefined, condition: undefined, kind: undefined })}>{item.label}</button>)}</div>
      <section className="discovery-layout">
        <aside className={`filter-panel ${filtersOpen ? "is-open" : ""}`} aria-label="Filters"><div className="filter-title"><h2>Refine</h2><div>{hasFilters && <button type="button" onClick={clearFilters}>Clear</button>}<button className="filter-close" type="button" onClick={() => setFiltersOpen(false)} aria-label="Close filters"><Icon name="close"/></button></div></div>
          <label>Locality<select value={locality ?? ""} onChange={(event) => update({ location: event.target.value ? event.target.value.toLowerCase().replaceAll(" ", "-") : undefined })}><option value="">All localities</option>{localities.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Category<select value={category} onChange={(event) => update({ category: event.target.value || undefined })}><option value="">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Status<select value={status} onChange={(event) => update({ status: event.target.value || undefined })}><option value="">Any status</option><option value="available">Available</option><option value="limited">Limited</option><option value="open">Open</option></select></label>
          {mode === "reuse" && <label>Condition<select value={condition} onChange={(event) => update({ condition: event.target.value || undefined })}><option value="">Any condition</option><option>Like new</option><option>Good</option><option>Fair</option></select></label>}
          {mode === "donations" && <label>Donation type<select value={donationKind ?? ""} onChange={(event) => update({ kind: event.target.value || undefined })}><option value="">Offers and needs</option><option value="offer">Resource offers</option><option value="need">Community needs</option></select></label>}
        </aside>
        <div className="result-region"><div className="result-toolbar"><button className="filter-trigger" type="button" aria-expanded={filtersOpen} onClick={() => setFiltersOpen(true)}>Filters</button><p aria-live="polite"><strong>{total}</strong> {total === 1 ? "result" : "results"}</p><label>Sort by<select value={sort} onChange={(event) => update({ sort: event.target.value === "recommended" ? undefined : event.target.value })}>{availableSorts.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label></div>
          {loading ? <div className="listing-grid" aria-label="Loading results">{Array.from({ length: 6 }).map((_, index) => <div className="listing-skeleton" key={index}/>)}</div> : items.length ? <><div className="listing-grid">{items.slice(0, visible).map((item) => <ListingCard key={item.id} item={item} onOpen={setSelected}/>)}</div>{visible < items.length && <button className="button button--secondary load-more" type="button" onClick={() => setVisible((count) => count + 6)}>Load more results</button>}</> : <div className="empty-state"><span><Icon name="search" size={28}/></span><h2>{query ? `No matches for “${query}”` : "No matching opportunities here yet"}</h2><p>Try another locality or mode, or clear the active filters to broaden your view.</p><div><button className="button button--primary" type="button" onClick={clearFilters}>Clear filters</button><a className="button button--secondary" href="/marketplace">Explore all modes</a></div></div>}
        </div>
      </section>
    </div></div><ListingDetail item={selected} onClose={() => setSelected(null)}/></PublicShell>;
}
