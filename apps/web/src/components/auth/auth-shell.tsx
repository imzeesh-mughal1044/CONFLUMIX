import Image from "next/image";
import Link from "next/link";

type AuthShellProps = {
  eyebrow?: string;
  brandTitle: string;
  brandCopy: string;
  children: React.ReactNode;
  compact?: boolean;
  transition?: "signin" | "signup";
};

export function AuthShell({ eyebrow = "One account · Four marketplaces", brandTitle, brandCopy, children, compact, transition }: AuthShellProps) {
  const flow = transition ?? (brandTitle === "Welcome back." ? "signin" : brandTitle === "Your next exchange starts here." ? "signup" : undefined);
  return (
    <main className={`auth-shell${compact ? " auth-shell--compact" : ""}${flow ? ` auth-shell--${flow}` : ""}`}>
      <section className="brand-panel" aria-labelledby="brand-heading">
        <div className="brand-orbit brand-orbit--one" />
        <div className="brand-orbit brand-orbit--two" />
        <Link href="/" className="brand-link" aria-label="CONFLUMIX home">
          <Image src="/CONFLUMIX_nav.png" alt="CONFLUMIX" width={990} height={185} sizes="(max-width: 767px) 152px, 280px" priority />
        </Link>
        <div className="brand-message">
          <p className="eyebrow eyebrow--dark">{eyebrow}</p>
          <h1 id="brand-heading">{brandTitle}</h1>
          <p>{brandCopy}</p>
        </div>
        <div className="mode-list" aria-label="Marketplace modes">
          <span><i aria-hidden="true" />Buy</span><span><i aria-hidden="true" />Reuse</span><span><i aria-hidden="true" />Tasks</span><span><i aria-hidden="true" />Donate</span>
        </div>
      </section>
      <section className="mobile-brand-panel" aria-label="CONFLUMIX account access">
        <Link href="/" className="mobile-brand-link" aria-label="CONFLUMIX home">
          <Image src="/CONFLUMIX_nav.png" alt="CONFLUMIX" width={990} height={185} sizes="152px" priority />
        </Link>
        <div>
          <strong>{brandTitle}</strong>
          <span>{brandCopy}</span>
        </div>
      </section>
      <section className="auth-panel">
        <div className="auth-content">{children}</div>
        <p className="auth-footnote">A shared account for every way you exchange.</p>
      </section>
    </main>
  );
}

export function AuthHeader({ title, description }: { title: string; description: string }) {
  return <header className="auth-header"><p className="eyebrow">CONFLUMIX ACCOUNT</p><h2>{title}</h2><p>{description}</p></header>;
}
