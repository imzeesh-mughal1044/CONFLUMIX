"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { localities } from "@/data/marketplace";
import { authSessionEvent, readAuthSession, signOut, type AuthSession } from "@/lib/auth";
import { hasNewProductIntent, newProductOnboardingStage, nextNewProductOnboardingRoute, readSellerOnboarding, sellerOnboardingEvent } from "@/services/seller-onboarding";
import type { Locality } from "@/types/marketplace";
import { Icon } from "./icons";
import { SearchBar } from "./search-bar";
import { SellerSidebar } from "@/components/seller/seller-sidebar";

const nav = [
  ["Marketplace", "/marketplace"], ["New Products", "/new-products"], ["Reuse", "/marketplace?mode=reuse"], ["Tasks", "/marketplace?mode=tasks"], ["Donations", "/marketplace?mode=donations"],
] as const;

export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [locality, setLocality] = useState<Locality>("DHA Phase 6");
  const [session, setSession] = useState<AuthSession | null>(null);
  const [sellerAction,setSellerAction]=useState<{href:string;label:string}|null>(null);
  const sellerWorkspace=pathname.startsWith("/dashboard/new-products")||pathname.startsWith("/dashboard/seller-center")||pathname.startsWith("/new-products/sell");
  const accountHref=sellerAction?.label==="Seller Center"?"/dashboard/new-products":sellerAction?.label==="Continue Seller Setup"?sellerAction.href:"/dashboard";
  useEffect(() => { document.body.style.overflow = menuOpen ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [menuOpen]);
  useEffect(() => {
    let active = true;
    const refresh = () => { void readAuthSession().then((value) => { if (!active)return;setSession(value);if(!value){setSellerAction(null);return}const record=readSellerOnboarding(value.email);if(!hasNewProductIntent(record)){setSellerAction({href:"/become-a-seller",label:"Become a Seller"});return}const stage=newProductOnboardingStage();setSellerAction(stage==="complete"?{href:"/dashboard/new-products",label:"Seller Center"}:{href:nextNewProductOnboardingRoute(),label:"Continue Seller Setup"}) }); };
    refresh();
    window.addEventListener(authSessionEvent, refresh);
    window.addEventListener(sellerOnboardingEvent,refresh);
    return () => { active = false; window.removeEventListener(authSessionEvent, refresh);window.removeEventListener(sellerOnboardingEvent,refresh); };
  }, []);

  function chooseLocality(value: Locality) {
    setLocality(value);
    if (pathname === "/discover") router.push(`/discover?location=${value.toLowerCase().replaceAll(" ", "-")}`);
  }

  async function logOut() {
    await signOut();
    setSession(null);
    setMenuOpen(false);
    router.replace("/");
  }

  return <div className="public-app">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header className="public-header">
      <div className="public-header__inner">
        <Link href="/" className="public-logo" aria-label="CONFLUMIX home"><Image src="/CONFLUMIX_nav.png" alt="CONFLUMIX" width={990} height={185} priority sizes="(max-width: 767px) 154px, 190px"/></Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {nav.map(([label, href]) => <Link key={label} href={href} className={(label === "Marketplace" && pathname === "/marketplace") || (label === "New Products" && pathname.startsWith("/new-products")) ? "is-active" : ""}>{label}</Link>)}
        </nav>
        <div className="header-actions">
          <button className="icon-action search-toggle" type="button" aria-label="Open search" aria-expanded={searchOpen} onClick={() => setSearchOpen((open) => !open)}><Icon name="search"/></button>
          <label className="locality-control"><Icon name="pin" size={17}/><span className="sr-only">Current locality</span><select value={locality} onChange={(event) => chooseLocality(event.target.value as Locality)}>{localities.map((item) => <option key={item}>{item}</option>)}</select></label>
          <Link className="account-link" href={session ? accountHref : "/auth/login"} title={session ? `Account for ${session.fullName}` : undefined}><Icon name="user" size={18}/><span>{session ? "My account" : "Sign in"}</span></Link>
          {session && <button className="header-signout" type="button" onClick={() => void logOut()}><Icon name="logout" size={18}/><span>Log out</span></button>}
          <button className="icon-action menu-toggle" type="button" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><Icon name={menuOpen ? "close" : "menu"}/></button>
        </div>
      </div>
      {searchOpen && <div className="header-search"><SearchBar compact locality={locality}/></div>}
    </header>
    {menuOpen && <div className="mobile-drawer" role="dialog" aria-modal="true" aria-label="Navigation menu"><nav>{nav.map(([label, href]) => <Link key={label} href={href} onClick={() => setMenuOpen(false)}>{label}<Icon name="chevron" size={17}/></Link>)}</nav>{session ? <div className="mobile-account-actions"><Link className="button button--secondary" href={accountHref} onClick={() => setMenuOpen(false)}><Icon name="user" size={18}/>My account</Link>{sellerAction&&<Link className="button button--primary" href={sellerAction.href} onClick={() => setMenuOpen(false)}><Icon name="shop" size={18}/>{sellerAction.label}</Link>}<button className="button button--secondary" type="button" onClick={() => void logOut()}><Icon name="logout" size={18}/>Log out</button></div> : <Link className="button button--primary" href="/auth/register" onClick={() => setMenuOpen(false)}>Create an account</Link>}</div>}
    <main id="main-content" tabIndex={-1}>{sellerWorkspace?<div className="seller-workspace"><SellerSidebar/><div className="seller-workspace__content">{children}</div></div>:children}</main>
    <footer className="public-footer">
      <div className="public-footer__main">
        <div className="footer-brand"><Image src="/CONFLUMIX_nav.png" alt="CONFLUMIX" width={990} height={185} sizes="180px"/><p>One shared platform for products, reuse, practical work, and community support.</p></div>
        <div><h2>Explore</h2><Link href="/marketplace">Marketplace</Link><Link href="/discover">Local discovery</Link><Link href="/search">Search</Link></div>
        <div><h2>Account</h2><Link href="/dashboard">Personal dashboard</Link><Link href="/auth/login">Sign in</Link><Link href="/auth/register">Create account</Link><Link href="/auth/forgot-password">Account recovery</Link></div>
        <div><h2>Trust & support</h2><Link href="/privacy">Privacy notice</Link><Link href="/terms">Terms</Link><Link href="/auth/required?next=/marketplace">Safety and support</Link></div>
      </div>
      <div className="public-footer__bottom"><span>© 2026 CONFLUMIX</span><span>Designed for responsible local exchange.</span></div>
    </footer>
  </div>;
}

export function Breadcrumb({ current }: { current: string }) {
  return <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><Icon name="chevron" size={15}/><span aria-current="page">{current}</span></nav>;
}
