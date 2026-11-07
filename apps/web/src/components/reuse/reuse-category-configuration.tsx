"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PublicShell } from "@/components/public/public-shell";
import { reuseCategories } from "@/data/reuse";
import { reuseAttributeDefinitions } from "@/data/reuse-attributes";
import { allReuseListings } from "@/services/reuse";
import {
  readReuseConfiguration,
  saveReuseConfiguration,
} from "@/services/reuse-seller";

export function ReuseCategoryConfiguration() {
  const [saved, setSaved] = useState<string[]>([]),
    [draft, setDraft] = useState<string[]>([]),
    [active, setActive] = useState<string>(reuseCategories[0]),
    [query, setQuery] = useState(""),
    [ready, setReady] = useState(false),
    [saving, setSaving] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  useEffect(() => {
    queueMicrotask(() => {
      const value = readReuseConfiguration().categories;
      setSaved(value);
      setDraft(value);
      setActive(value[0] ?? reuseCategories[0]);
      setReady(true);
    });
  }, []);
  const visible = useMemo(
    () =>
      reuseCategories.filter((item) =>
        item.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );
  const dirty =
    JSON.stringify([...saved].sort()) !== JSON.stringify([...draft].sort());
  function toggle(category: string) {
    setError("");
    setMessage("");
    if (draft.includes(category)) {
      const used = allReuseListings().some(
        (item) => item.category === category && item.ownerEmail,
      );
      if (used) {
        setError(
          `${category} is referenced by a seller listing. Removal is blocked because no migration rule exists.`,
        );
        return;
      }
      setDraft(draft.filter((item) => item !== category));
    } else setDraft([...draft, category]);
    setActive(category);
  }
  function save() {
    if (!draft.length) {
      setError("Select at least one main category before saving.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const next = saveReuseConfiguration(draft);
      setSaved(next);
      setMessage("Reuse category configuration saved in this browser.");
    } catch (value) {
      setError(
        value instanceof Error
          ? value.message
          : "Configuration could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  }
  if (!ready)
    return (
      <div className="route-loading" role="status">
        Loading Reuse configuration…
      </div>
    );
  return (
    <PublicShell>
      <main className="reuse-seller-page">
        <div className="page-container">
          <nav className="seller-back">
            <Link href="/dashboard/seller-center/setup">
              ← Seller Center setup
            </Link>
          </nav>
          <header className="reuse-seller-hero">
            <div>
              <p className="section-kicker">Shared Seller Center · Reuse</p>
              <h1>Reuse Categories &amp; Attributes</h1>
              <p>
                Choose the main categories available in your Reuse listing
                forms. This does not publish or recategorize existing listings.
              </p>
            </div>
            <div className="reuse-config-count">
              <strong>{draft.length}</strong>
              <span>of 35 configured</span>
            </div>
          </header>
          <div className="prototype-banner" role="note">
            <strong>Browser-local prototype</strong>
            <span>
              Configuration is tied to your shared frontend seller session, not
              Supabase or the ASP.NET API.
            </span>
          </div>
          {dirty && (
            <p className="reuse-unsaved" role="status">
              Unsaved changes
            </p>
          )}
          <div className="reuse-config-layout">
            <section
              className="reuse-config-picker"
              aria-labelledby="category-heading"
            >
              <h2 id="category-heading">Main categories</h2>
              <label>
                Search categories
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search 35 categories"
                />
              </label>
              <div>
                {visible.map((category) => (
                  <button
                    key={category}
                    type="button"
                    aria-pressed={draft.includes(category)}
                    className={`${active === category ? "is-active" : ""} ${draft.includes(category) ? "is-configured" : ""}`}
                    onClick={() => {
                      setActive(category);
                      toggle(category);
                    }}
                  >
                    <span>{category}</span>
                    <small>
                      {draft.includes(category)
                        ? "Configured"
                        : "Not configured"}
                    </small>
                  </button>
                ))}
              </div>
            </section>
            <section className="reuse-attribute-panel">
              <p className="section-kicker">Category template</p>
              <h2>{active}</h2>
              {active === "Property and Home Fixtures" && (
                <p className="configuration-hint">
                  For physical fixtures and fittings only—not property sales or
                  rentals.
                </p>
              )}
              <p>
                These repository-defined fields are read-only templates. Listing
                values are stored per item and never change this template.
              </p>
              <div className="reuse-attribute-list">
                {(reuseAttributeDefinitions[active] ?? []).map((field) => (
                  <article key={field.id}>
                    <div>
                      <strong>{field.label}</strong>
                      <span>{field.type}</span>
                    </div>
                    <small>
                      {field.required ? "Required to publish" : "Optional"}
                    </small>
                  </article>
                ))}
              </div>
              {!reuseAttributeDefinitions[active]?.length && (
                <p className="listing-empty">
                  No supported attribute definitions were found for this
                  category.
                </p>
              )}
            </section>
          </div>
          {error && (
            <p className="config-error" role="alert">
              {error}
            </p>
          )}
          {message && (
            <div className="product-toast" role="status">
              {message}
            </div>
          )}
          <div className="configuration-actions">
            <button
              className="button button--secondary"
              type="button"
              disabled={!dirty}
              onClick={() => {
                setDraft(saved);
                setError("");
                setMessage("Changes reset to the last browser-local save.");
              }}
            >
              Reset
            </button>
            <button
              className="button button--primary"
              type="button"
              disabled={saving || !dirty}
              onClick={save}
            >
              {saving ? "Saving…" : "Save configuration"}
            </button>
            <Link className="button button--secondary" href="/reuse/sell/new">
              Create Reuse listing
            </Link>
          </div>
        </div>
      </main>
    </PublicShell>
  );
}
