"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PublicShell } from "@/components/public/public-shell";
import { readAuthSession } from "@/lib/auth";

type PageState = "loading" | "unavailable" | "error";

export function ReuseHandoverPage({
  transactionId,
}: {
  transactionId: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [state, setState] = useState<PageState>("loading");

  useEffect(() => {
    let active = true;
    void readAuthSession()
      .then((session) => {
        if (!active) return;
        if (!session) {
          router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);
          return;
        }
        setState("unavailable");
      })
      .catch(() => {
        if (active) setState("error");
      });
    return () => {
      active = false;
    };
  }, [pathname, router, transactionId]);

  if (state === "loading") {
    return (
      <PublicShell>
        <div className="route-loading" role="status">
          Checking handover access…
        </div>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <main className="reuse-handover-page">
        <div className="page-container">
          <nav className="reuse-detail-breadcrumb" aria-label="Breadcrumb">
            <Link href="/reuse">Reuse</Link>
            <span>/</span>
            <span aria-current="page">Inspection and handover</span>
          </nav>

          <section className="reuse-handover-unavailable" aria-labelledby="handover-title">
            <p className="section-kicker">Private transaction workflow</p>
            <h1 id="handover-title">
              {state === "error"
                ? "Handover status could not be checked"
                : "Inspection and handover unavailable"}
            </h1>
            <p>
              {state === "error"
                ? "The access check did not complete. Return to your offer and try again."
                : "This transaction cannot be found, is not available to this account, or is not yet eligible for inspection and handover."}
            </p>

            <div className="reuse-handover-state-grid" aria-label="Workflow availability">
              <article>
                <span>Transaction</span>
                <strong>Not resolved</strong>
                <p>No authoritative Reuse transaction record is available.</p>
              </article>
              <article>
                <span>Checklist</span>
                <strong>Not created</strong>
                <p>No category checklist instance is available for this transaction.</p>
              </article>
              <article>
                <span>Handover</span>
                <strong>Not confirmed</strong>
                <p>Opening this page does not record an inspection or item transfer.</p>
              </article>
            </div>

            <div className="reuse-handover-boundary" role="note">
              <h2>Why no checklist is shown</h2>
              <p>
                The current prototype supports pending offers and counteroffers only. It does not support offer acceptance, reservations, Reuse transactions, category checklist instances, evidence uploads, scheduling, or participant handover confirmation.
              </p>
              <p>
                A checklist records observable condition only. It is not a professional inspection, safety certificate, warranty, or guarantee that every defect has been found.
              </p>
            </div>

            <div className="reuse-handover-actions">
              <Link className="button button--primary" href="/reuse">
                Browse Reuse listings
              </Link>
              <Link className="button button--secondary" href="/marketplace">
                Return to marketplace
              </Link>
            </div>
          </section>
        </div>
      </main>
    </PublicShell>
  );
}
