"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { getProductDetailData } from "@/data/product-details";
import { checkRequirements, relatedProducts, requirementAlternatives, requirementFields, requirementOptions } from "@/services/products";
import type { Product, ProductVariant, RequirementResult } from "@/types/products";
import { PublicShell } from "@/components/public/public-shell";
import { Icon } from "@/components/public/icons";
import { ProductCard } from "./product-card";

const money = new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 });

export function ProductDetailsPage({ product }: { product: Product }) {
  const detail = getProductDetailData(product.id, product.image, product.title);
  const [imageIndex, setImageIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [variant, setVariant] = useState<ProductVariant | undefined>(detail.variants?.find((item) => item.stock > 0));
  const [quantity, setQuantity] = useState(1);
  const [cartCount, setCartCount] = useState(0);
  const [notice, setNotice] = useState("");
  const [requirements, setRequirements] = useState<Record<string, string>>({});
  const [results, setResults] = useState<RequirementResult[] | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const stock = variant ? variant.stock : product.stock;
  const price = variant ? variant.price : product.price;
  const alternatives = useMemo(() => results ? requirementAlternatives(product, requirements) : [], [product, requirements, results]);
  const related = relatedProducts(product, alternatives.map((item) => item.product.id));

  useEffect(() => {
    if (!viewerOpen) return;
    closeRef.current?.focus();
    const close = (event: KeyboardEvent) => event.key === "Escape" && setViewerOpen(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [viewerOpen]);

  function selectVariant(next: ProductVariant) { setVariant(next); setQuantity(1); }
  function addToCart() {
    if (!stock || quantity < 1 || quantity > stock) return;
    setCartCount((count) => count + quantity);
    setNotice(`${quantity} × ${product.title}${variant ? ` (${variant.label.replace(" · unavailable", "")})` : ""} added to this cart.`);
    window.setTimeout(() => setNotice(""), 2800);
  }
  function submitRequirements(event: FormEvent) {
    event.preventDefault();
    setResults(checkRequirements(product, requirements));
  }
  function resetRequirements() { setRequirements({}); setResults(null); }

  return <PublicShell><div className="product-detail-page"><div className="page-container"><nav className="product-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><Icon name="chevron" size={14}/><Link href="/new-products">New Products</Link><Icon name="chevron" size={14}/><Link href={`/new-products/browse?category=${encodeURIComponent(product.category)}`}>{product.category}</Link><Icon name="chevron" size={14}/><span aria-current="page">{product.title}</span></nav><div className="detail-cart" aria-label={`${cartCount} items in cart`}><strong>{cartCount}</strong><span>Cart</span></div><section className="product-overview"><div className="product-gallery"><button className="product-gallery__main" type="button" onClick={() => setViewerOpen(true)} aria-label={`Enlarge image: ${detail.gallery[imageIndex].alt}`}><Image src={detail.gallery[imageIndex].src} alt={detail.gallery[imageIndex].alt} fill priority sizes="(max-width: 800px) 100vw, 48vw"/><span>View larger</span></button>{detail.gallery.length > 1 && <div className="product-thumbnails" aria-label="Product images">{detail.gallery.map((image, index) => <button key={image.src} type="button" className={index === imageIndex ? "is-active" : ""} aria-label={`Show image ${index + 1}: ${image.alt}`} aria-current={index === imageIndex} onClick={() => setImageIndex(index)}><Image src={image.src} alt="" fill sizes="76px"/></button>)}</div>}</div><div className="product-purchase"><p className="section-kicker">{product.category}</p><h1>{product.title}</h1><div className="product-price product-price--large"><strong>{money.format(price)}</strong>{product.originalPrice && !variant && <del>{money.format(product.originalPrice)}</del>}</div><p className={`stock-line ${stock ? "is-available" : "is-unavailable"}`}>{stock > 5 ? "In stock" : stock > 0 ? `Low stock · ${stock} available` : "Out of stock"}</p><p className="product-purchase__description">{product.description || "The seller has not supplied a description for this product."}</p>{detail.variants && <fieldset className="variant-selector"><legend>Choose an option</legend><div>{detail.variants.map((item) => <button key={item.id} type="button" className={variant?.id === item.id ? "is-active" : ""} disabled={!item.stock} aria-pressed={variant?.id === item.id} onClick={() => selectVariant(item)}>{item.label}<small>{money.format(item.price)}</small></button>)}</div></fieldset>}<div className="quantity-row"><div><span id="quantity-label">Quantity</span><div className="quantity-control" aria-labelledby="quantity-label"><button type="button" aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</button><output aria-live="polite">{quantity}</output><button type="button" aria-label="Increase quantity" disabled={!stock || quantity >= stock} onClick={() => setQuantity((value) => Math.min(stock, value + 1))}>+</button></div></div><span>{stock ? `Maximum ${stock}` : "Not available"}</span></div><button className="button button--primary product-add-main" type="button" disabled={!stock || (detail.variants && !variant)} onClick={addToCart}>{stock ? "Add to cart" : "Currently unavailable"}</button><p className="purchase-note">Items are not reserved until checkout is completed.</p><SellerBlock product={product} policies={detail.policies}/></div></section><section className="product-detail-section product-information"><div><p className="section-kicker">Product information</p><h2>Description</h2><p>{product.description || "No seller description is available."}</p></div><div><h2>Specifications</h2>{product.attributes.length ? <dl className="specification-list">{product.attributes.map((attribute) => <div key={attribute.label}><dt>{attribute.label}</dt><dd>{attribute.value}</dd></div>)}</dl> : <p className="missing-state">No structured specifications were supplied.</p>}</div></section><ConfidenceSummary product={product} hasPolicies={Boolean(detail.policies)} stockUpdatedAt={detail.stockUpdatedAt}/><section className="product-detail-section requirement-section"><div className="detail-section-heading"><p className="section-kicker">Requirement check</p><h2>Does this product fit what you need?</h2><p>Select only the requirements that matter. Results use the seller-supplied specifications shown above.</p></div><form onSubmit={submitRequirements}><div className="requirement-fields">{requirementFields[product.category].map((label) => <label key={label}>{label}<select value={requirements[label] ?? ""} onChange={(event) => { setRequirements((current) => ({ ...current, [label]: event.target.value })); setResults(null); }}><option value="">No preference</option>{requirementOptions(product.category, label).map((option) => <option key={option}>{option}</option>)}</select></label>)}</div><div className="requirement-actions"><button className="button button--primary" type="submit">Check compatibility</button><button className="button button--secondary" type="button" onClick={resetRequirements}>Reset</button></div></form>{results && <RequirementResults results={results}/>}</section>{results && <section className="product-detail-section"><div className="detail-section-heading"><p className="section-kicker">Requirement-aware alternatives</p><h2>Compare nearby catalogue matches</h2><p>Ranked deterministically by your selected requirements. Unknown data is never counted as a match.</p></div>{alternatives.length ? <div className="alternative-grid">{alternatives.map(({ product: alternative, results: comparison }) => <div key={alternative.id}><ComparisonSummary results={comparison}/><ProductCard product={alternative}/></div>)}</div> : <p className="missing-state">No in-stock alternatives are available in this category.</p>}</section>}<section className="product-detail-section review-policy-section"><div><p className="section-kicker">Reviews</p><h2>Buyer feedback</h2><p className="missing-state">This product has no verified buyer reviews yet.</p></div><div><p className="section-kicker">Purchase terms</p><h2>Returns and cancellation</h2>{detail.policies?.returns || detail.policies?.cancellation ? <ul>{detail.policies.returns && <li>{detail.policies.returns}</li>}{detail.policies.cancellation && <li>{detail.policies.cancellation}</li>}</ul> : <p className="missing-state">The seller has not supplied return or cancellation terms. Confirm them before purchasing.</p>}</div></section>{related.length > 0 && <section className="product-detail-section related-section"><div className="detail-section-heading"><p className="section-kicker">More in {product.category}</p><h2>Related products</h2></div><div className="product-grid">{related.map((item) => <ProductCard key={item.id} product={item}/>)}</div></section>}</div></div>{viewerOpen && <div className="image-viewer" role="dialog" aria-modal="true" aria-label="Expanded product image" onMouseDown={(event) => event.target === event.currentTarget && setViewerOpen(false)}><button ref={closeRef} type="button" onClick={() => setViewerOpen(false)} aria-label="Close expanded image"><Icon name="close"/></button><div><Image src={detail.gallery[imageIndex].src} alt={detail.gallery[imageIndex].alt} fill sizes="92vw"/></div></div>}{notice && <div className="product-toast" role="status">{notice}</div>}</PublicShell>;
}

function SellerBlock({ product, policies }: { product: Product; policies?: { delivery?: string } }) {
  return <section className="seller-block" aria-labelledby="seller-heading"><div><p className="section-kicker">Sold by</p><h2 id="seller-heading">{product.seller}</h2></div><span>{product.verifiedSeller ? "Verified seller profile" : "Verification not confirmed"}</span><p>{product.locality}</p>{policies?.delivery && <p>{policies.delivery}</p>}<small>Verification describes fixture data only and is not a purchase guarantee.</small></section>;
}

function ConfidenceSummary({ product, hasPolicies, stockUpdatedAt }: { product: Product; hasPolicies: boolean; stockUpdatedAt?: string }) {
  const required = [product.title, product.description, product.image, product.category, product.price > 0 ? String(product.price) : "", product.attributes.length ? "attributes" : ""];
  const complete = required.every(Boolean);
  const evidence = [
    { title: "Listing information", state: complete ? "Complete" : "Needs review", text: complete ? "Core product, price, image, category, description, and specification data are present." : "One or more core listing fields are missing." },
    { title: "Seller verification", state: product.verifiedSeller ? "Confirmed in fixture" : "Not confirmed", text: product.verifiedSeller ? "The local product fixture marks this seller as verified. This is not a transaction guarantee." : "The local fixture does not confirm seller verification." },
    { title: "Stock freshness", state: stockUpdatedAt ? "Timestamp available" : "Unknown", text: stockUpdatedAt ? `Local stock data is dated ${stockUpdatedAt}. Confirm availability before purchase.` : "No stock update timestamp is available." },
    { title: "Purchase terms", state: hasPolicies ? "Terms supplied" : "Incomplete", text: hasPolicies ? "At least one seller policy is available for review below." : "No seller policy is available in the local fixture." },
  ];
  return <section className="product-detail-section confidence-section"><div className="detail-section-heading"><p className="section-kicker">Purchase confidence summary</p><h2>Evidence to review before you decide</h2><p>This summary reports available evidence. It does not score safety or guarantee a purchase outcome.</p></div><div className="confidence-grid">{evidence.map((item) => <article key={item.title}><span>{item.state}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div></section>;
}

function RequirementResults({ results }: { results: RequirementResult[] }) {
  if (!results.length) return <div className="requirement-results" role="status"><h3>No requirements selected</h3><p>Select one or more preferences to receive an evidence-based comparison.</p></div>;
  return <div className="requirement-results" aria-live="polite"><h3>Compatibility result</h3>{results.map((result) => <div key={result.label} className={`requirement-result is-${result.status}`}><strong>{result.status === "match" ? "Match" : result.status === "mismatch" ? "Mismatch" : "Unknown"} · {result.label}</strong><p>{result.explanation}</p></div>)}</div>;
}

function ComparisonSummary({ results }: { results: RequirementResult[] }) {
  const matches = results.filter((item) => item.status === "match").length;
  return <p className="comparison-summary">{results.length ? `${matches} of ${results.length} selected requirements match` : "No preference-based claim"}</p>;
}

export function ProductNotFound() {
  return <PublicShell><div className="product-not-found"><p className="section-kicker">Product unavailable</p><h1>We could not find that product.</h1><p>The link may be incomplete, or the product is not part of the current catalogue.</p><Link className="button button--primary" href="/new-products/browse">Browse New Products</Link></div></PublicShell>;
}
