"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/products/product-card";
import { Breadcrumb, PublicShell } from "@/components/public/public-shell";
import { readStoredListings } from "@/services/product-listings";
import { readManagedListings } from "@/services/listing-management";
import { promotionalPriceForListing, readPromotions } from "@/services/promotions";
import { readSellerSetup } from "@/services/seller-setup";
import { findStorefront, localListingToProduct, publicStoreFromSetup, storeIdForName } from "@/services/storefront";
import type { ProductCategory } from "@/types/products";
import type { StorefrontRecord } from "@/types/storefront";
import { readShopSections } from "@/services/shop-sections";
import type { ShopSection } from "@/types/shop-section";

export function StorefrontPage({ storeId }: { storeId: string }) {
  const fixtureStore = useMemo(() => findStorefront(storeId), [storeId]);
  const [localStore, setLocalStore] = useState<StorefrontRecord | null>(null);
  const [sections, setSections] = useState<ShopSection[]>([]);
  const [productSections, setProductSections] = useState<Record<string, string>>({});
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  useEffect(() => {
    const setup = readSellerSetup();
    if (setup.storeName && storeIdForName(setup.storeName) === storeId.toLowerCase()) {
      const publicStore = publicStoreFromSetup(setup);
      const managed = readManagedListings(setup.storeName).filter((item) => item.status === "active");
      const stored = readStoredListings();
      const promotions=readPromotions(setup.storeName); const visible = stored.map((listing) => localListingToProduct(listing, setup.storeName, setup.locality as never)).filter((item): item is NonNullable<typeof item> => Boolean(item)).filter((product) => managed.some((item) => item.id === product.id)).map((product) => { const item = managed.find((entry) => entry.id === product.id)!,offer=promotionalPriceForListing(item,promotions,managed); return { ...product, price: offer?.promotionalPrice??item.price, originalPrice:offer?.originalPrice, promotionLabel:offer?.promotion.name, promotionEndDate:offer?.promotion.endDate, stock: item.quantity }; });
      queueMicrotask(() => { setLocalStore({ ...publicStore, products: visible, categories: Array.from(new Set(visible.map((item) => item.category))) }); setSections(readShopSections(storeId)); setProductSections(Object.fromEntries(stored.filter((item) => item.storeId === storeId && item.id && item.sectionId).map((item) => [item.id!, item.sectionId!]))); setSelectedSection(new URLSearchParams(window.location.search).get("section")); });
      return;
    }
    if (fixtureStore) {
      const managed = readManagedListings(fixtureStore.storeName).filter((item) => item.status === "active");
      const promotions=readPromotions(fixtureStore.storeName); const visible = fixtureStore.products.filter((product) => managed.some((item) => item.id === product.id)).map((product) => { const item = managed.find((entry) => entry.id === product.id)!,offer=promotionalPriceForListing(item,promotions,managed); return { ...product, price: offer?.promotionalPrice??item.price, originalPrice:offer?.originalPrice, promotionLabel:offer?.promotion.name, promotionEndDate:offer?.promotion.endDate, stock: item.quantity }; });
      queueMicrotask(() => setLocalStore({ ...fixtureStore, products: visible, categories: Array.from(new Set(visible.map((item) => item.category))) }));
    }
  }, [fixtureStore, storeId]);
  const store = localStore ?? fixtureStore;
  const [category, setCategory] = useState<ProductCategory | null>(null);
  if (!store) return <PublicShell><div className="store-state page-container"><p className="section-kicker">Store unavailable</p><h1>We couldn’t find this store.</h1><p>The link may be incorrect, or the store is no longer public.</p><Link className="button button--primary" href="/new-products">Return to New Products</Link></div></PublicShell>;
  const publicSections = sections.filter((section) => store.products.some((product) => productSections[product.id] === section.id));
  const activeSection = publicSections.find((section) => section.id === selectedSection);
  const invalidSection = Boolean(selectedSection && !activeSection);
  const visible = activeSection ? store.products.filter((item) => productSections[item.id] === activeSection.id) : category ? store.products.filter((item) => item.category === category) : store.products;
  function chooseSection(sectionId: string | null) {
    setSelectedSection(sectionId);
    setCategory(null);
    const url = sectionId ? `${window.location.pathname}?section=${encodeURIComponent(sectionId)}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  }
  return <PublicShell><div className="storefront page-container">
    <Breadcrumb current={store.storeName}/>
    <header className="store-hero">
      <div className="store-banner">{store.banner ? <Image src={store.banner} alt={`${store.storeName} store banner`} fill priority sizes="(max-width: 768px) 100vw, 1200px"/> : <div className="store-banner__fallback" aria-hidden="true"/>}</div>
      <div className="store-identity"><div className="store-logo">{store.logo ? <Image src={store.logo} alt={`${store.storeName} logo`} fill sizes="96px"/> : <span aria-hidden="true">{store.storeName.slice(0, 1)}</span>}</div><div><div className="store-title-row"><h1>{store.storeName}</h1>{store.verified && <span className="verified-badge">Verified on CONFLUMIX</span>}</div><p>{store.sellerName} · {store.sellerType} · {store.locality}, {store.city}</p></div><Link className="button button--secondary" href="/new-products">Return to marketplace</Link></div>
    </header>
    {!store.active && <section className="store-notice"><h2>Temporarily unavailable</h2><p>This store is not currently accepting marketplace activity.</p></section>}
    <div className="store-layout"><main className="store-main"><section className="store-about"><p className="section-kicker">About the store</p><h2>Local products, clear support</h2><p>{store.description}</p></section>
      <section aria-labelledby="store-products"><div className="store-section-heading"><div><p className="section-kicker">Store catalogue</p><h2 id="store-products">Products</h2></div><span>{visible.length} {visible.length === 1 ? "product" : "products"}</span></div>
        {publicSections.length > 0 && <nav className="store-sections" aria-label="Shop sections"><button className={!activeSection ? "is-active" : ""} type="button" onClick={() => chooseSection(null)}>All Products</button>{publicSections.map((section) => <button className={activeSection?.id === section.id ? "is-active" : ""} aria-current={activeSection?.id === section.id ? "page" : undefined} type="button" key={section.id} onClick={() => chooseSection(section.id)}>{section.name}</button>)}</nav>}
        {invalidSection && <div className="store-section-notice" role="status">That shop section is no longer available. Showing all products.</div>}
        {store.categories.length > 0 && <div className="store-categories" aria-label="Filter store products by marketplace category"><button className={!category ? "is-active" : ""} onClick={() => { setCategory(null); chooseSection(null); }} type="button">All categories</button>{store.categories.map((item) => <button className={category === item && !activeSection ? "is-active" : ""} key={item} onClick={() => { setCategory(item); setSelectedSection(null); window.history.replaceState(null, "", window.location.pathname); }} type="button" aria-pressed={category === item && !activeSection}>{item}</button>)}</div>}
        {visible.length ? <div className="store-product-grid">{visible.map((product) => <ProductCard key={product.id} product={product}/>)}</div> : <div className="store-empty"><h3>{category ? "No products match this category." : "This store hasn't listed any products yet."}</h3><p>{category ? "Clear the category filter to browse the full store." : "Check back later for new products."}</p>{category && <button className="button button--secondary" type="button" onClick={() => setCategory(null)}>Clear category</button>}</div>}
      </section></main>
      <aside className="store-info" aria-label="Store information"><h2>Store information</h2><Info title="Location" value={`${store.locality}, ${store.city}`}/><Info title="Delivery" value={store.delivery.join(" · ") || "Not provided"}/><Info title="Returns & exchanges" value={store.returnPolicy}/>{store.paymentMethod && <Info title="Payment" value={store.paymentMethod}/>}<Info title="Reviews" value={store.rating === null ? "No reviews yet" : `${store.rating.toFixed(1)} from ${store.reviewCount} reviews`}/>{store.createdAt && <Info title="Member since" value={new Intl.DateTimeFormat("en-PK", { month: "long", year: "numeric" }).format(new Date(store.createdAt))}/>} {store.publicContact && <Info title="Public support" value={store.publicContact}/>}</aside>
    </div>
  </div></PublicShell>;
}
function Info({ title, value }: { title: string; value: string }) { return <div className="store-info__item"><h3>{title}</h3><p>{value}</p></div>; }
