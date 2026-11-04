"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createShopSection, readShopSections, shopSectionLimit, shopSectionNameLimit } from "@/services/shop-sections";
import type { ShopSection } from "@/types/shop-section";

export function ShopSectionSelector({ storeId, value, onChange }: { storeId: string; value?: string; onChange: (sectionId?: string) => void }) {
  const [sections, setSections] = useState<ShopSection[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => { queueMicrotask(() => setSections(readShopSections(storeId))); }, [storeId]);

  function requestCreate() {
    if (sections.length >= shopSectionLimit) {
      setError("You've reached the maximum of 30 shop sections. Remove an existing section before creating another.");
      return;
    }
    setName("");
    setError("");
    setOpen(true);
    window.setTimeout(() => dialog.current?.showModal(), 0);
  }

  function close() {
    dialog.current?.close();
    setOpen(false);
  }

  function create() {
    const result = createShopSection(storeId, name);
    if (!result.ok) { setError(result.error); return; }
    const next = readShopSections(storeId);
    setSections(next);
    onChange(result.section.id);
    close();
  }

  return <div className="shop-section-selector">
    <label className="listing-field" htmlFor="sectionId">
      Shop Section (Optional)
      <select id="sectionId" value={value ?? ""} onChange={(event) => event.target.value === "__create" ? requestCreate() : onChange(event.target.value || undefined)}>
        <option value="">No Section</option>
        {sections.map((section) => <option value={section.id} key={section.id}>{section.name}</option>)}
        {sections.length < shopSectionLimit && <option value="__create">+ Create New Section</option>}
      </select>
      <small>Sections organize this product inside your storefront and do not change its marketplace category.</small>
    </label>
    {error && !open && <div className="section-inline-note" role="status"><span>{error}</span><Link href="/dashboard/new-products/sections">Manage sections</Link></div>}
    <dialog ref={dialog} className="section-form-dialog" onCancel={close}>
      {open && <><p className="section-kicker">Store organization</p><h2>Create shop section</h2><p>Create a flat storefront section without leaving this listing.</p><label><span>Section name</span><input autoFocus value={name} maxLength={shopSectionNameLimit} onChange={(event) => { setName(event.target.value); setError(""); }} /></label>{error && <p className="field-error" role="alert">{error}</p>}<div className="dialog-actions"><button type="button" className="button button--secondary" onClick={close}>Cancel</button><button type="button" className="button button--primary" onClick={create}>Create and select</button></div></>}
    </dialog>
  </div>;
}
