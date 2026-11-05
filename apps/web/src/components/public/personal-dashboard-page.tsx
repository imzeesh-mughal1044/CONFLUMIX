"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { readAuthSession, type AuthSession } from "@/lib/auth";
import {
  hasNewProductIntent,
  newProductOnboardingStage,
  nextNewProductOnboardingRoute,
  readSellerOnboarding,
} from "@/services/seller-onboarding";
import type { SellerOnboardingRecord } from "@/types/seller-onboarding";
import { PublicShell } from "./public-shell";
const unavailable =
  "This area will become available when its marketplace workflow is implemented.";
export function PersonalDashboardPage() {
  const router = useRouter(),
    [session, setSession] = useState<AuthSession | null>(null),
    [record, setRecord] = useState<SellerOnboardingRecord | null>(null),
    [ready, setReady] = useState(false);
  useEffect(() => {
    void readAuthSession().then((value) => {
      if (!value) {
        router.replace("/auth/login?next=%2Fdashboard");
        return;
      }
      setSession(value);
      setRecord(readSellerOnboarding(value.email));
      setReady(true);
    });
  }, [router]);
  if (!ready)
    return (
      <PublicShell>
        <div className="route-loading" role="status">
          Loading your account…
        </div>
      </PublicShell>
    );
  const hasNew = hasNewProductIntent(record),
    stage = hasNew ? newProductOnboardingStage() : "none",
    reuse = Boolean(record?.reuseInterestSavedAt);
  return (
    <PublicShell>
      <div className="account-dashboard">
        <div className="page-container">
          <section
            className="dashboard-welcome"
            aria-labelledby="dashboard-title"
          >
            <div>
              <p className="section-kicker">Personal dashboard</p>
              <h1 id="dashboard-title">
                Welcome back, {session?.fullName || "Member"}.
              </h1>
              <p>
                Your CONFLUMIX account begins as a buyer account. Selling is
                optional and marketplace-specific.
              </p>
            </div>
            <Link className="button button--primary" href="/marketplace">
              Explore marketplace
            </Link>
          </section>
          <section className="dashboard-status" aria-label="Account status">
            <div>
              <span>Account</span>
              <strong>Registered buyer</strong>
            </div>
            <div>
              <span>New Product selling</span>
              <strong>
                {stage === "complete"
                  ? "Ready"
                  : stage === "categories"
                    ? "Category setup needed"
                    : stage === "profile"
                      ? "Profile in progress"
                      : "Not started"}
              </strong>
            </div>
            <div>
              <span>Reuse selling</span>
              <strong>{reuse ? "Interest saved" : "Not started"}</strong>
            </div>
          </section>
          <div className="dashboard-layout">
            <main>
              <section className="dashboard-section">
                <div className="dashboard-heading">
                  <div>
                    <p className="section-kicker">Activity overview</p>
                    <h2>Your marketplace activity</h2>
                  </div>
                  <p>
                    Counts remain unavailable until account activity is
                    connected.
                  </p>
                </div>
                <div className="activity-grid">
                  <Activity label="Orders" />
                  <Activity label="Product listings" />
                  <div className="activity-card activity-card--linked">
                    <span>Task activity</span>
                    <strong>Available</strong>
                    <div><Link href="/dashboard/tasks/posted">Posted tasks</Link><Link href="/dashboard/tasks/proposals">My proposals</Link></div>
                  </div>
                  <Activity label="Donations" />
                </div>
              </section>
              <section className="dashboard-section">
                <div className="dashboard-heading">
                  <div>
                    <p className="section-kicker">Quick actions</p>
                    <h2>Continue across CONFLUMIX</h2>
                  </div>
                </div>
                <div className="quick-action-grid">
                  <Link href="/new-products">
                    <strong>Browse new products</strong>
                    <span>Explore products and local stores.</span>
                  </Link>
                  <Link href="/tasks/new">
                    <strong>Post a task</strong>
                    <span>Describe a focused problem and the outcome you need.</span>
                  </Link>
                  <UnavailableAction title="Donate a resource" />
                </div>
              </section>
            </main>
            <aside
              className="seller-center"
              aria-labelledby="seller-center-title"
            >
              <p className="section-kicker">Selling on CONFLUMIX</p>
              <h2 id="seller-center-title">
                {!record
                  ? "Become a seller when you are ready."
                  : stage === "complete"
                    ? "Your New Product store is ready."
                    : hasNew
                      ? "Continue your seller setup."
                      : "Your Reuse interest is saved."}
              </h2>
              <p>
                New Products and Reuse use independent seller journeys. Your
                buyer access is unchanged.
              </p>
              {hasNew && (
                <SellerState
                  title="New Product Marketplace"
                  status={
                    stage === "complete"
                      ? "Onboarding complete"
                      : stage === "categories"
                        ? "Profile complete"
                        : "Setup started"
                  }
                />
              )}{" "}
              {reuse && (
                <SellerState
                  title="Reuse Marketplace"
                  status="Registration coming soon"
                />
              )}
              <div className="seller-center__actions">
                {!record ? (
                  <Link href="/become-a-seller">Become a Seller</Link>
                ) : hasNew ? (
                  <Link
                    href={
                      stage === "complete"
                        ? "/dashboard/new-products"
                        : nextNewProductOnboardingRoute()
                    }
                  >
                    {stage === "complete"
                      ? "Open New Product Seller Center"
                      : "Continue New Product Setup"}
                  </Link>
                ) : (
                  <Link href="/become-a-seller">
                    View seller marketplace status
                  </Link>
                )}
                {record && (
                  <Link href="/become-a-seller">
                    Seller marketplace options
                  </Link>
                )}
              </div>
              {reuse && (
                <p className="seller-center__note">
                  Reuse seller onboarding is not open yet. No New Product
                  profile is created from this selection.
                </p>
              )}
            </aside>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
function Activity({ label }: { label: string }) {
  return (
    <article>
      <span>{label}</span>
      <strong>—</strong>
      <small>Not connected</small>
    </article>
  );
}
function SellerState({ title, status }: { title: string; status: string }) {
  return (
    <div className="seller-state">
      <span>{title}</span>
      <strong>{status}</strong>
    </div>
  );
}
function UnavailableAction({ title }: { title: string }) {
  return (
    <button
      className="quick-action--disabled"
      type="button"
      disabled
      title={unavailable}
    >
      <strong>{title}</strong>
      <span>{unavailable}</span>
    </button>
  );
}
