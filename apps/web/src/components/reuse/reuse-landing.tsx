"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PublicShell } from "@/components/public/public-shell";
import { Icon } from "@/components/public/icons";
import { reuseCategories, reuseListings } from "@/data/reuse";
import { allReuseListings, reuseListingEvent } from "@/services/reuse";
import { ReuseCard } from "./reuse-card";

export function ReuseLanding() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [listings, setListings] = useState(reuseListings);
  useEffect(() => {
    const refresh = () => setListings(allReuseListings().filter((item) => (item.lifecycle ?? "published") === "published"));
    queueMicrotask(refresh);
    window.addEventListener(reuseListingEvent, refresh);
    return () => window.removeEventListener(reuseListingEvent, refresh);
  }, []);
  function submit(event: FormEvent) {
    event.preventDefault();
    const value = query.trim();
    router.push(
      `/reuse/browse${value ? `?q=${encodeURIComponent(value)}` : ""}`,
    );
  }
  const recent = [...listings]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4);
  const refurbished = listings.filter(
    (item) => item.classification === "Refurbished",
  );
  const surplus = listings.filter(
    (item) => item.classification === "Surplus",
  );
  const reduced = listings.filter(
    (item) =>
      item.previousAskingPrice && item.previousAskingPrice > item.askingPrice,
  );
  return (
    <PublicShell>
      <div className="reuse-page">
        <section className="reuse-hero">
          <div className="page-container reuse-hero__grid">
            <div>
              <p className="section-kicker">Reuse marketplace</p>
              <h1>Discover Pre-Owned, Refurbished and Surplus Items.</h1>
              <p>
                Search second-hand and refurbished products offered through
                CONFLUMIX&apos;s local marketplace.
              </p>
              <form className="reuse-search" onSubmit={submit}>
                <label className="sr-only" htmlFor="reuse-landing-search">
                  Search Reuse products
                </label>
                <Icon name="search" />
                <input
                  id="reuse-landing-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search laptops, furniture, books…"
                />
                {query && (
                  <button
                    type="button"
                    className="reuse-search__clear"
                    aria-label="Clear search"
                    onClick={() => setQuery("")}
                  >
                    <Icon name="close" />
                  </button>
                )}
                <button type="submit">Search Reuse</button>
              </form>
              <div className="reuse-hero__actions">
                <Link className="button button--primary" href="/reuse/browse">
                  Browse all listings
                </Link>
                <Link
                  className="button button--secondary"
                  href="/reuse/sell/new"
                >
                  Start a Reuse listing
                </Link>
              </div>
            </div>
            <aside>
              <span>Prototype catalogue</span>
              <strong>
                {listings.length} clearly labelled prototype listings
              </strong>
              <p>
                Data is stored in frontend fixtures and browser-local records,
                not Supabase or the ASP.NET API.
              </p>
            </aside>
          </div>
        </section>
        <section className="reuse-section">
          <div className="page-container">
            <div className="reuse-section__heading">
              <div>
                <p className="section-kicker">35 main categories</p>
                <h2>Browse by category</h2>
              </div>
            </div>
            <div className="reuse-category-grid">
              {reuseCategories.map((category) => (
                <Link
                  key={category}
                  href={`/reuse/browse?category=${encodeURIComponent(category)}`}
                >
                  <span>{category}</span>
                  <Icon name="chevron" size={17} />
                </Link>
              ))}
            </div>
          </div>
        </section>
        <Collection title="Recently listed" items={recent} />
        {refurbished.length > 0 && (
          <Collection title="Refurbished items" items={refurbished} />
        )}{" "}
        {surplus.length > 0 && (
          <Collection title="Surplus items" items={surplus} />
        )}{" "}
        {reduced.length > 0 && (
          <Collection title="Recent asking-price reductions" items={reduced} />
        )}
        <section className="reuse-cta">
          <div className="page-container">
            <div>
              <p className="section-kicker">Keep exploring</p>
              <h2>Filter the complete Reuse catalogue.</h2>
            </div>
            <Link className="button button--accent" href="/reuse/browse">
              Browse Reuse listings
            </Link>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}

function Collection({
  title,
  items,
}: {
  title: string;
  items: typeof reuseListings;
}) {
  return (
    <section className="reuse-section reuse-section--listings">
      <div className="page-container">
        <div className="reuse-section__heading">
          <h2>{title}</h2>
          <Link href="/reuse/browse">
            View all <Icon name="arrow" size={17} />
          </Link>
        </div>
        <div className="reuse-grid">
          {items.map((item) => (
            <ReuseCard key={item.id} listing={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
