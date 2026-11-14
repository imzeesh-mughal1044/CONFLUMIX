"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Breadcrumb, PublicShell } from "@/components/public/public-shell";
import { Icon } from "@/components/public/icons";
import {EmptyState, ErrorState, SkeletonGrid} from "@/components/system/async-state";
import { localities } from "@/data/marketplace";
import { reuseCategories } from "@/data/reuse";
import { browseReuse } from "@/services/reuse";
import type { Locality } from "@/types/marketplace";
import {
  reuseClassifications,
  reuseConditions,
  reuseSellerTypes,
  type ReuseAvailability,
  type ReuseClassification,
  type ReuseCondition,
  type ReuseQuery,
  type ReuseSellerType,
  type ReuseSort,
} from "@/types/reuse";
import { ReuseCard } from "./reuse-card";

const validPrice = (value: string | null) =>
  value !== null &&
  value.trim() !== "" &&
  Number.isFinite(Number(value)) &&
  Number(value) >= 0
    ? Number(value)
    : undefined;

export function ReuseBrowser() {
  const router = useRouter();
  const params = useSearchParams();
  const closeButton = useRef<HTMLButtonElement>(null);
  const q = params.get("q")?.trim() ?? "";
  const category = reuseCategories.includes(
    params.get("category") as (typeof reuseCategories)[number],
  )
    ? (params.get("category") ?? undefined)
    : undefined;
  const condition = reuseConditions.includes(
    params.get("condition") as ReuseCondition,
  )
    ? (params.get("condition") as ReuseCondition)
    : undefined;
  const classification = reuseClassifications.includes(
    params.get("classification") as ReuseClassification,
  )
    ? (params.get("classification") as ReuseClassification)
    : undefined;
  const sellerType = reuseSellerTypes.includes(
    params.get("sellerType") as ReuseSellerType,
  )
    ? (params.get("sellerType") as ReuseSellerType)
    : undefined;
  const locality = localities.includes(params.get("locality") as Locality)
    ? (params.get("locality") as Locality)
    : undefined;
  const availability = (
    ["Available", "Temporarily unavailable"] as ReuseAvailability[]
  ).includes(params.get("availability") as ReuseAvailability)
    ? (params.get("availability") as ReuseAvailability)
    : undefined;
  const sort = (
    ["newest", "price-low", "price-high", "price-reduced"] as ReuseSort[]
  ).includes(params.get("sort") as ReuseSort)
    ? (params.get("sort") as ReuseSort)
    : "newest";
  const min = validPrice(params.get("min"));
  const max = validPrice(params.get("max"));
  const [search, setSearch] = useState(q);
  const [minDraft, setMinDraft] = useState(params.get("min") ?? "");
  const [maxDraft, setMaxDraft] = useState(params.get("max") ?? "");
  const [priceError, setPriceError] = useState("");
  const [items, setItems] = useState<Awaited<ReturnType<typeof browseReuse>>>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reload, setReload] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [visible, setVisible] = useState(12);
  const query = useMemo<ReuseQuery>(
    () => ({
      q,
      category,
      min,
      max,
      condition,
      classification,
      sellerType,
      locality,
      availability,
      sort,
    }),
    [
      q,
      category,
      min,
      max,
      condition,
      classification,
      sellerType,
      locality,
      availability,
      sort,
    ],
  );
  useEffect(() => {
    let active = true;
    queueMicrotask(() => { setLoading(true); setLoadError(false); });
    browseReuse(query).then((result) => {
      if (active) {
        setItems(result);
        setVisible(12);
      }
    }).catch(() => { if (active) setLoadError(true); }).finally(() => { if (active) setLoading(false); });
    return () => {
      active = false;
    };
  }, [query, reload]);
  useEffect(() => {
    if (filtersOpen) {
      closeButton.current?.focus();
      document.body.style.overflow = "hidden";
    } else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [filtersOpen]);
  const update = (changes: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params.toString());
    Object.entries(changes).forEach(([key, value]) =>
      value ? next.set(key, value) : next.delete(key),
    );
    router.push(`/reuse/browse${next.size ? `?${next}` : ""}`);
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    update({ q: search.trim() || undefined });
  };
  const applyPrice = () => {
    const low = validPrice(minDraft);
    const high = validPrice(maxDraft);
    if ((minDraft && low === undefined) || (maxDraft && high === undefined))
      return setPriceError("Enter non-negative numeric prices.");
    if (low !== undefined && high !== undefined && low > high)
      return setPriceError("Minimum price cannot exceed maximum price.");
    setPriceError("");
    update({ min: minDraft || undefined, max: maxDraft || undefined });
  };
  const clearAll = () => {
    setMinDraft("");
    setMaxDraft("");
    setPriceError("");
    update({
      category: undefined,
      min: undefined,
      max: undefined,
      condition: undefined,
      classification: undefined,
      sellerType: undefined,
      locality: undefined,
      availability: undefined,
      sort: undefined,
    });
  };
  const chips: [string, string, () => void][] = [
    category && ["Category", category, () => update({ category: undefined })],
    min !== undefined && [
      "Minimum",
      `PKR ${min.toLocaleString()}`,
      () => {
        setMinDraft("");
        update({ min: undefined });
      },
    ],
    max !== undefined && [
      "Maximum",
      `PKR ${max.toLocaleString()}`,
      () => {
        setMaxDraft("");
        update({ max: undefined });
      },
    ],
    condition && [
      "Condition",
      condition,
      () => update({ condition: undefined }),
    ],
    classification && [
      "Classification",
      classification,
      () => update({ classification: undefined }),
    ],
    sellerType && [
      "Seller",
      sellerType,
      () => update({ sellerType: undefined }),
    ],
    locality && ["Locality", locality, () => update({ locality: undefined })],
    availability && [
      "Availability",
      availability,
      () => update({ availability: undefined }),
    ],
  ].filter(Boolean) as [string, string, () => void][];
  return (
    <PublicShell>
      <div className="reuse-page reuse-browse">
        <div className="page-container">
          <Breadcrumb current="Browse Reuse Listings" />
          <header className="reuse-browse__heading">
            <div>
              <p className="section-kicker">Reuse marketplace</p>
              <h1>Browse Reuse Listings</h1>
              <p>
                Search and refine the available demo catalogue. Condition and
                listing status remain separate.
              </p>
            </div>
            <span>Prototype data</span>
          </header>
          <form className="reuse-search reuse-search--browse" onSubmit={submit}>
            <label className="sr-only" htmlFor="reuse-browse-search">
              Search Reuse listings
            </label>
            <Icon name="search" />
            <input
              id="reuse-browse-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products, categories, sellers…"
            />
            {search && (
              <button
                type="button"
                className="reuse-search__clear"
                aria-label="Clear search"
                onClick={() => {
                  setSearch("");
                  update({ q: undefined });
                }}
              >
                <Icon name="close" />
              </button>
            )}
            <button type="submit">Search</button>
          </form>
          <div className="reuse-toolbar">
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              aria-expanded={filtersOpen}
            >
              Filters{chips.length ? ` (${chips.length})` : ""}
            </button>
            <p aria-live="polite">
              <strong>{loading ? "…" : items.length}</strong>{" "}
              {items.length === 1 ? "listing" : "listings"}
            </p>
            <label>
              Sort
              <select
                value={sort}
                onChange={(event) =>
                  update({
                    sort:
                      event.target.value === "newest"
                        ? undefined
                        : event.target.value,
                  })
                }
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
                <option value="price-reduced">Recent price reductions</option>
              </select>
            </label>
          </div>
          {chips.length > 0 && (
            <div className="reuse-chips" aria-label="Active filters">
              {chips.map(([name, value, remove]) => (
                <button
                  key={name}
                  type="button"
                  onClick={remove}
                  aria-label={`Remove ${name}: ${value}`}
                >
                  {value}
                  <Icon name="close" size={15} />
                </button>
              ))}
              <button type="button" onClick={clearAll}>
                Clear all
              </button>
            </div>
          )}
          <div className="reuse-browse__layout">
            <aside
              className={`reuse-filters ${filtersOpen ? "is-open" : ""}`}
              aria-label="Reuse listing filters"
            >
              <div className="reuse-filters__title">
                <h2>Refine</h2>
                <button
                  ref={closeButton}
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  aria-label="Close filters"
                >
                  <Icon name="close" />
                </button>
              </div>
              <label>
                Category
                <select
                  value={category ?? ""}
                  onChange={(event) =>
                    update({ category: event.target.value || undefined })
                  }
                >
                  <option value="">All 35 categories</option>
                  {reuseCategories.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <fieldset>
                <legend>Asking price</legend>
                <div className="reuse-price">
                  <label>
                    Minimum
                    <input
                      inputMode="numeric"
                      value={minDraft}
                      onChange={(event) => setMinDraft(event.target.value)}
                      placeholder="0"
                      aria-describedby={
                        priceError ? "reuse-price-error" : undefined
                      }
                    />
                  </label>
                  <label>
                    Maximum
                    <input
                      inputMode="numeric"
                      value={maxDraft}
                      onChange={(event) => setMaxDraft(event.target.value)}
                      placeholder="Any"
                      aria-describedby={
                        priceError ? "reuse-price-error" : undefined
                      }
                    />
                  </label>
                </div>
                {priceError && (
                  <p id="reuse-price-error" role="alert">
                    {priceError}
                  </p>
                )}
                <button type="button" onClick={applyPrice}>
                  Apply price
                </button>
              </fieldset>
              <Select
                label="Condition"
                value={condition}
                values={reuseConditions}
                onChange={(value) => update({ condition: value })}
              />
              <Select
                label="Classification"
                value={classification}
                values={reuseClassifications}
                onChange={(value) => update({ classification: value })}
              />
              <Select
                label="Seller type"
                value={sellerType}
                values={reuseSellerTypes}
                onChange={(value) => update({ sellerType: value })}
              />
              <Select
                label="Locality"
                value={locality}
                values={localities}
                onChange={(value) => update({ locality: value })}
              />
              <Select
                label="Availability"
                value={availability}
          values={["Available", "Temporarily unavailable"]}
                onChange={(value) => update({ availability: value })}
              />
              <button
                className="button button--secondary"
                type="button"
                onClick={clearAll}
              >
                Clear filters
              </button>
            </aside>
            <section className="reuse-results" aria-busy={loading}>
              {loading ? (
                <SkeletonGrid kind="reuse" label="Loading Reuse listings" />
              ) : loadError ? (
                <ErrorState title="Reuse listings could not be loaded" description="We couldn't load these listings. Your search and filters have been preserved." onRetry={() => setReload((value) => value + 1)} />
              ) : items.length ? (
                <>
                  <div className="reuse-grid">
                    {items.slice(0, visible).map((item) => (
                      <ReuseCard key={item.id} listing={item} />
                    ))}
                  </div>
                  {visible < items.length && (
                    <button
                      className="button button--secondary reuse-load-more"
                      type="button"
                      onClick={() => setVisible((count) => count + 12)}
                    >
                      Load more listings
                    </button>
                  )}
                </>
              ) : (
                <EmptyState title="No Reuse Items Found" description="There are currently no items matching your search. Try adjusting your filters or exploring other categories." actions={[{label:"Clear Filters",onClick:clearAll,variant:"primary"},{label:"Explore Reuse Listings",href:"/reuse",variant:"secondary"}]} />
              )}
            </section>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}

function Select({
  label,
  value,
  values,
  onChange,
}: {
  label: string;
  value?: string;
  values: readonly string[];
  onChange: (value: string | undefined) => void;
}) {
  return (
    <label>
      {label}
      <select
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value || undefined)}
      >
        <option value="">Any {label.toLowerCase()}</option>
        {values.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
    </label>
  );
}
