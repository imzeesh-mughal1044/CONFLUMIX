"use client";

import { useEffect } from "react";
import Image from "next/image";
import { listingImages, modeMeta } from "@/data/marketplace";
import type { MarketplaceListing } from "@/types/marketplace";
import { Icon } from "./icons";

const money = new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 });

function primaryMeta(item: MarketplaceListing) {
  if (item.mode === "new-products") return money.format(item.price);
  if (item.mode === "reuse") return `${money.format(item.price)} · ${item.condition}`;
  if (item.mode === "tasks") return `${money.format(item.budget)} budget`;
  return `${item.kind === "offer" ? "Resource offered" : "Community need"} · ${item.quantity}`;
}

export function ListingCard({ item, onOpen }: { item: MarketplaceListing; onOpen: (item: MarketplaceListing) => void }) {
  return <article className={`listing-card listing-card--${item.mode}`}>
    <button className={`listing-visual visual--${item.visual}`} type="button" onClick={() => onOpen(item)} aria-label={`View details for ${item.title}`}>
      {listingImages[item.id] ? <Image src={listingImages[item.id]} alt={item.title} fill sizes="(max-width: 767px) 50vw, 25vw"/> : <><span>{item.category.slice(0, 1)}</span><small>{modeMeta[item.mode].short}</small></>}
    </button>
    <div className="listing-card__body">
      <div className="listing-card__top"><span className="mode-badge">{modeMeta[item.mode].short}</span><span className="listing-status">{item.status}</span></div>
      <h3><button type="button" onClick={() => onOpen(item)}>{item.title}</button></h3>
      <p className="listing-primary">{primaryMeta(item)}</p>
      <p className="listing-description">{item.description}</p>
      <div className="listing-footer"><span><Icon name="pin" size={15}/>{item.locality}</span><button type="button" onClick={() => onOpen(item)}>View details <Icon name="arrow" size={16}/></button></div>
    </div>
  </article>;
}

export function ListingDetail({ item, onClose }: { item: MarketplaceListing | null; onClose: () => void }) {
  useEffect(() => {
    if (!item) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [item, onClose]);
  if (!item) return null;
  return <div className="detail-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="detail-panel" role="dialog" aria-modal="true" aria-labelledby="detail-title">
      <button className="detail-close" type="button" aria-label="Close details" onClick={onClose}><Icon name="close"/></button>
      <div className={`detail-visual visual--${item.visual}`}>{listingImages[item.id] ? <Image src={listingImages[item.id]} alt={item.title} fill sizes="520px"/> : <span>{item.category.slice(0, 1)}</span>}</div>
      <span className="mode-badge">{modeMeta[item.mode].label}</span>
      <h2 id="detail-title">{item.title}</h2>
      <p className="detail-lead">{item.description}</p>
      <dl><div><dt>Locality</dt><dd>{item.locality}</dd></div><div><dt>Category</dt><dd>{item.category}</dd></div><div><dt>Status</dt><dd>{item.status}</dd></div><div><dt>Published</dt><dd>{new Date(`${item.createdAt}T00:00:00`).toLocaleDateString("en-PK", { dateStyle: "medium" })}</dd></div></dl>
      <div className="detail-note"><Icon name="spark"/><p>This is frontend demonstration content. Mode-specific transactions and backend actions are not connected yet.</p></div>
      <a className="button button--primary" href={`/auth/required?next=${encodeURIComponent(window.location.pathname + window.location.search)}`}>Sign in to continue</a>
    </section>
  </div>;
}

