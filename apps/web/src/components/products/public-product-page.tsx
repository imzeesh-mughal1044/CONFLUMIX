"use client";
import { useEffect,useState } from "react";
import { findPublicProduct } from "@/services/products";
import type { Product } from "@/types/products";
import { ProductDetailsPage,ProductNotFound } from "./product-details-page";
export function PublicProductPage({identifier,initial}:{identifier:string;initial?:Product}){const [product,setProduct]=useState<Product|undefined>(initial),[ready,setReady]=useState(Boolean(initial));useEffect(()=>{queueMicrotask(()=>{setProduct(findPublicProduct(identifier));setReady(true)})},[identifier]);if(!ready)return <div className="route-loading">Loading product…</div>;return product?<ProductDetailsPage product={product}/>:<ProductNotFound/>}
