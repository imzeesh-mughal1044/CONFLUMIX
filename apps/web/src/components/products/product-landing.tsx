"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { productCategories, products } from "@/data/products";
import { readPublicProducts } from "@/services/products";
import type { Product } from "@/types/products";
import { PublicShell } from "@/components/public/public-shell";
import { Icon } from "@/components/public/icons";
import { ProductCard } from "./product-card";

export function ProductLanding() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [catalogue,setCatalogue]=useState(products);
  useEffect(()=>{queueMicrotask(()=>setCatalogue(readPublicProducts()))},[]);
  const featured = catalogue.filter((item) => item.featured).slice(0, 5);
  const recent = [...catalogue].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).filter((item)=>!featured.some((featuredItem)=>featuredItem.id===item.id)).slice(0, 5);
  function submit(event: FormEvent) { event.preventDefault(); router.push(`/new-products/browse${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`); }
  function add(product: Product) { if (!product.stock) return; setCart((current) => [...current, product.id]); setNotice(`${product.title} added to your cart.`); window.setTimeout(() => setNotice(""), 2600); }
  return <PublicShell><div className="product-page"><section className="product-intro"><div className="page-container product-intro__grid"><div><p className="section-kicker">New products</p><h1>Find something worth bringing home.</h1><p>Explore new products from local stores and sellers, across the categories you use every day.</p><form className="product-search" onSubmit={submit}><label className="sr-only" htmlFor="landing-product-search">Search new products</label><Icon name="search"/><input id="landing-product-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search electronics, furniture, fashion…"/>{query && <button type="button" className="product-search__clear" aria-label="Clear search" onClick={() => setQuery("")}><Icon name="close" size={18}/></button>}<button type="submit">Search products</button></form><div className="product-intro__actions"><Link className="button button--primary" href="/new-products/browse">Browse all products</Link><span>{cart.length} {cart.length === 1 ? "item" : "items"} in cart</span></div></div><div className="product-intro__visual"><Image src="/marketplace/banners/local-retail.jpg" alt="A modern retail store with products on display" fill priority sizes="(max-width: 900px) 100vw, 42vw"/><span><strong>New finds, thoughtfully selected.</strong><Link href="/new-products/browse">Browse the catalogue <Icon name="arrow" size={17}/></Link></span></div></div></section><section className="product-section product-categories"><div className="page-container"><div className="product-section__heading"><div><p className="section-kicker">Shop by category</p><h2>Start with what you need</h2></div></div><div className="product-category-grid">{productCategories.map((category) => { const sample = catalogue.find((item) => item.category === category) ?? products.find((item) => item.category === category)!; const count = catalogue.filter((item) => item.category === category).length; return <Link key={category} href={`/new-products/browse?category=${encodeURIComponent(category)}`}><span><Image src={sample.image} alt="" fill sizes="20vw"/></span><strong>{category}</strong><small>{count} products</small><Icon name="chevron" size={18}/></Link>; })}</div></div></section><ProductCollection title="Featured Products" kicker="Selected for discovery" items={featured} onAdd={add}/><ProductCollection title="Recently Added" kicker="New to the catalogue" items={recent} onAdd={add}/><section className="product-cta"><div className="page-container"><div><p className="section-kicker">Browse every category</p><h2>Compare all available new products.</h2></div><Link className="button button--accent" href="/new-products/browse">Browse all products</Link></div></section></div>{notice && <div className="product-toast" role="status">{notice}</div>}</PublicShell>;
}

function ProductCollection({ title, kicker, items, onAdd }: { title: string; kicker: string; items: Product[]; onAdd: (product: Product) => void }) { return <section className="product-section"><div className="page-container"><div className="product-section__heading"><div><p className="section-kicker">{kicker}</p><h2>{title}</h2></div><Link href="/new-products/browse">View all <Icon name="arrow" size={17}/></Link></div><div className="product-grid">{items.map((item) => <ProductCard key={item.id} product={item} onAdd={onAdd}/>)}</div></div></section>; }
