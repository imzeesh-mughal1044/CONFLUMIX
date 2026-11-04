"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { PublicShell } from "@/components/public/public-shell";
import { readStoredListings } from "@/services/product-listings";
import { createShopSection, deleteShopSection, readShopSections, renameShopSection, reorderShopSections, shopSectionLimit, shopSectionNameLimit } from "@/services/shop-sections";
import { readSellerSetup } from "@/services/seller-setup";
import { storeIdForName } from "@/services/storefront";
import type { ShopSection } from "@/types/shop-section";
import { readAuthSession } from "@/lib/auth";

type DialogState = { mode: "create"; section?: undefined } | { mode: "rename" | "delete"; section: ShopSection };

export function ShopSectionsPage() {
  const [storeId, setStoreId] = useState("");
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [storeName, setStoreName] = useState("");
  const [sections, setSections] = useState<ShopSection[]>([]);
  const [dialogState, setDialogState] = useState<DialogState | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    void readAuthSession().then((session) => {
      if (!session) { setAuthorized(false); return; }
      const setup = readSellerSetup();
      const id = storeIdForName(setup.storeName);
      setStoreId(id);
      setStoreName(setup.storeName || "Your store");
      setSections(readShopSections(id));
      setAuthorized(true);
    });
  }, []);

  const counts = useMemo(() => {
    const listings = readStoredListings().filter((item) => item.storeId === storeId);
    return Object.fromEntries(sections.map((section) => [section.id, { total: listings.filter((item) => item.sectionId === section.id).length, published: listings.filter((item) => item.sectionId === section.id && item.status === "published").length }]));
  }, [sections, storeId]);

  function open(state: DialogState) {
    setDialogState(state);
    setName(state.mode === "rename" ? state.section.name : "");
    setError("");
    window.setTimeout(() => dialog.current?.showModal(), 0);
  }

  function close() {
    dialog.current?.close();
    setDialogState(null);
  }

  function submit() {
    if (!dialogState) return;
    if (dialogState.mode === "delete") {
      if (!deleteShopSection(storeId, dialogState.section.id)) { setError("The section could not be deleted. Refresh and try again."); return; }
      setSections(readShopSections(storeId));
      setMessage("Section deleted. Assigned products remain intact and are now unassigned.");
      close();
      return;
    }
    const result = dialogState.mode === "create" ? createShopSection(storeId, name) : renameShopSection(storeId, dialogState.section.id, name);
    if (!result.ok) { setError(result.error); return; }
    setSections(readShopSections(storeId));
    setMessage(dialogState.mode === "create" ? "Section created successfully." : "Section renamed successfully.");
    close();
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];
    if (!reorderShopSections(storeId, next.map((item) => item.id))) { setMessage("The section order could not be saved."); return; }
    setSections(readShopSections(storeId));
    setMessage("Section order saved.");
  }

  const atLimit = sections.length >= shopSectionLimit;
  if (authorized === null) return <PublicShell><main className="page-container sections-page"><div className="management-loading">Loading shop sections…</div></main></PublicShell>;
  if (!authorized) return <PublicShell><main className="page-container sections-page"><section className="management-empty"><h1>Sign in to manage shop sections</h1><p>Shop sections belong to a seller’s New Product store.</p><Link className="button button--primary" href="/auth/login?next=/dashboard/new-products/sections">Sign in</Link></section></main></PublicShell>;
  return <PublicShell><main className="page-container sections-page">
    <header className="sections-header"><div><p className="section-kicker">{storeName}</p><h1>Shop Sections</h1><p>Organize your store into sections to help customers find the products they’re looking for.</p></div><button className="button button--primary" disabled={atLimit} onClick={() => open({ mode: "create" })}>Create Section</button></header>
    <div className={`sections-count ${atLimit ? "is-limit" : ""}`}><strong>{sections.length} of {shopSectionLimit} sections</strong><span>{atLimit ? "Remove an existing section before creating another." : `${shopSectionLimit - sections.length} sections available.`}</span></div>
    {message && <div className="management-result" role="status">{message}</div>}
    {!sections.length ? <section className="sections-empty"><h2>Create your first shop section</h2><p>Sections are optional, seller-defined groups such as New Arrivals or Best Sellers. They remain separate from marketplace categories.</p><button className="button button--primary" onClick={() => open({ mode: "create" })}>Create Section</button></section> : <section className="sections-list" aria-label="Shop sections">{sections.map((section, index) => <article key={section.id}><div className="section-order"><span>Order</span><strong>{index + 1}</strong></div><div className="section-details"><h2>{section.name}</h2><p>{counts[section.id]?.published ?? 0} published · {counts[section.id]?.total ?? 0} total assigned</p></div><div className="section-move"><button type="button" disabled={index === 0} aria-label={`Move ${section.name} up`} onClick={() => move(index, -1)}>Move up</button><button type="button" disabled={index === sections.length - 1} aria-label={`Move ${section.name} down`} onClick={() => move(index, 1)}>Move down</button></div><div className="section-actions"><button type="button" onClick={() => open({ mode: "rename", section })}>Rename</button><button type="button" className="danger-link" onClick={() => open({ mode: "delete", section })}>Delete</button></div></article>)}</section>}
    <dialog ref={dialog} className="section-form-dialog" onCancel={close}>{dialogState && <>{dialogState.mode === "delete" ? <><p className="section-kicker">Safe removal</p><h2>Delete “{dialogState.section.name}”?</h2><p>Products currently assigned to it will remain in your store but will no longer belong to a section.</p></> : <><p className="section-kicker">Store organization</p><h2>{dialogState.mode === "create" ? "Create shop section" : "Rename shop section"}</h2><label><span>Section name</span><input autoFocus value={name} maxLength={shopSectionNameLimit} onChange={(event) => { setName(event.target.value); setError(""); }} /></label></>}{error && <p className="field-error" role="alert">{error}</p>}<div className="dialog-actions"><button className="button button--secondary" type="button" onClick={close}>Cancel</button><button className={`button ${dialogState.mode === "delete" ? "button--danger" : "button--primary"}`} type="button" onClick={submit}>{dialogState.mode === "delete" ? "Delete section" : dialogState.mode === "create" ? "Create" : "Save name"}</button></div></>}</dialog>
    <p className="sections-prototype-note">Shop sections currently use browser-local prototype persistence for this New Product store.</p>
    <Link className="sections-back" href="/dashboard/new-products">Return to seller dashboard</Link>
  </main></PublicShell>;
}
