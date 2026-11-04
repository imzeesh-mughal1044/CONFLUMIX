"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/products";

const money = new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 });

export function ProductCard({ product, onAdd }: { product: Product; onView?: (product: Product) => void; onAdd?: (product: Product) => void }) {
  const href = `/new-products/${product.slug}`;
  return <article className="product-card"><Link className="product-card__image" href={href} aria-label={`View ${product.title}`}><Image src={product.image} alt={product.title} fill sizes="(max-width: 767px) 50vw, 20vw"/>{product.originalPrice && <span className="product-promo">{product.promotionLabel??"Offer"}</span>}</Link><div className="product-card__body"><div className="product-card__meta"><span>{product.category}</span><span>{product.stock ? `${product.stock} in stock` : "Out of stock"}</span></div><h3><Link href={href}>{product.title}</Link></h3><div className="product-price"><strong>{money.format(product.price)}</strong>{product.originalPrice && <del>{money.format(product.originalPrice)}</del>}</div>{product.promotionEndDate&&<p className="product-promotion-end">Ends {new Intl.DateTimeFormat("en-PK",{day:"numeric",month:"short"}).format(new Date(`${product.promotionEndDate}T12:00:00`))}</p>}<p className="product-seller">{product.seller}{product.verifiedSeller ? " · Verified seller" : ""}</p><div className="product-actions"><Link href={href}>View product</Link>{onAdd && <button className="product-add" type="button" disabled={!product.stock} onClick={() => onAdd(product)}>{product.stock ? "Add to cart" : "Unavailable"}</button>}</div></div></article>;
}

export function ProductDetail({ product }: { product: Product | null; onClose: () => void; onAdd: (product: Product) => void }) { return product ? null : null; }
