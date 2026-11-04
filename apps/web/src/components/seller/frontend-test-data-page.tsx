"use client";
import Link from "next/link";
import { useState } from "react";
import { PublicShell } from "@/components/public/public-shell";
import { resetFrontendTestData,seedFrontendTestData } from "@/services/frontend-test-data";
import { startSellerOnboarding } from "@/services/seller-onboarding";
import { emptySellerSetup,saveSellerSetup,sellerSetupKey } from "@/services/seller-setup";

export function FrontendTestDataPage(){
  const [message,setMessage]=useState("");
  function load(){
    seedFrontendTestData();
    const raw=localStorage.getItem(sellerSetupKey);
    if(raw){startSellerOnboarding("new-products");saveSellerSetup({...emptySellerSetup,...JSON.parse(raw)})}
    setMessage("Test data loaded. Open the seller dashboard to begin.");
  }
  if(process.env.NODE_ENV!=="development")return <PublicShell><main className="page-container test-data-page"><div className="management-empty"><h1>Development test data is unavailable</h1><p>This control is disabled outside the development build.</p><Link className="button button--secondary" href="/dashboard/new-products">Seller dashboard</Link></div></main></PublicShell>;
  return <PublicShell><main className="page-container test-data-page"><p className="section-kicker">Development only</p><h1>Frontend test data</h1><p>Load a controlled seller, category configuration, published product, draft product, and pending demo order. Your current frontend account and session are preserved.</p>{message&&<div className="management-result" role="status">{message}</div>}<div className="test-data-actions"><button className="button button--primary" onClick={load}>Load controlled dataset</button><button className="button button--danger" onClick={()=>{if(window.confirm("Reset all non-sensitive CONFLUMIX prototype data for this browser?")){resetFrontendTestData();setMessage("Prototype seller and marketplace data reset. Your login session was preserved.")}}}>Reset prototype data</button><Link className="button button--secondary" href="/dashboard/new-products">Open seller dashboard</Link></div><p className="test-data-note">Seeded records are explicitly development-only. They are not analytics evidence, backend records, payments, or verified identities.</p></main></PublicShell>
}
