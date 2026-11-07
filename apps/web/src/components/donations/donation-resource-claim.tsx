"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { PublicShell } from "@/components/public/public-shell";
import { readAuthSession, type AuthSession } from "@/lib/auth";
import { donationCategoryLabel } from "@/services/donations";
import type { DonationClaimDraft, DonationResource } from "@/types/donations";
import { DonationNav } from "./donation-nav";

type Errors = Partial<Record<"quantity" | "intendedUse" | "handoverPreference", string>>;

export function DonationResourceClaim({ resource }: { resource: DonationResource }) {
  const router = useRouter();
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const [session, setSession] = useState<AuthSession | null | undefined>(undefined);
  const [quantity, setQuantity] = useState("1");
  const [intendedUse, setIntendedUse] = useState("");
  const [supportingInformation, setSupportingInformation] = useState("");
  const [handoverPreference, setHandoverPreference] = useState(resource.handoverMethod ?? "");
  const [handoverNotes, setHandoverNotes] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submissionNotice, setSubmissionNotice] = useState("");
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const detailHref = `/donations/resources/${resource.id}`;
  const claimable = resource.availableQuantity > 0 && (resource.availability === "available" || resource.availability === "limited");
  const dirty = quantity !== "1" || intendedUse !== "" || supportingInformation !== "" || handoverNotes !== "";
  const safetyInformation = resource.categoryAttributes.filter((attribute) => attribute.safety);
  const requestedQuantity = Number(quantity);

  useEffect(() => {
    let current = true;
    readAuthSession().then((value) => {
      if (current) setSession(value);
    });
    return () => {
      current = false;
    };
  }, []);

  useEffect(() => {
    if (!showCancelDialog) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowCancelDialog(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showCancelDialog]);

  const validate = () => {
    const next: Errors = {};
    if (!Number.isInteger(requestedQuantity) || requestedQuantity < 1) next.quantity = "Enter a whole number of at least 1.";
    else if (requestedQuantity > resource.availableQuantity) next.quantity = `Only ${resource.availableQuantity} ${resource.unit} are recorded as available.`;
    if (intendedUse.trim().length < 20) next.intendedUse = "Describe the intended use in at least 20 characters.";
    if (!handoverPreference) next.handoverPreference = "Confirm the recorded handover arrangement.";
    setErrors(next);
    if (Object.keys(next).length) requestAnimationFrame(() => errorSummaryRef.current?.focus());
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmissionNotice("");
    if (!session || !claimable || !validate()) return;
    const draft: DonationClaimDraft = {
      resourceId: resource.id,
      requestedQuantity,
      intendedUse: intendedUse.trim(),
      supportingInformation: supportingInformation.trim(),
      handoverPreference,
      handoverNotes: handoverNotes.trim(),
    };
    void draft;
    setSubmissionNotice("Your entries are valid, but claim submission is unavailable because no claim API is connected. No claim, reservation, allocation, or inventory change was created.");
  };

  const cancel = () => {
    if (dirty) setShowCancelDialog(true);
    else router.push(detailHref);
  };

  return (
    <PublicShell>
      <DonationNav />
      <main className="donation-claim">
        <div className="page-container">
          <nav className="donation-claim__breadcrumb" aria-label="Breadcrumb">
            <Link href="/donations">Donation Network</Link><span aria-hidden="true">/</span><Link href={detailHref}>{resource.title}</Link><span aria-hidden="true">/</span><span aria-current="page">Claim resource</span>
          </nav>
          <header className="donation-claim__header">
            <p className="section-kicker">DON-08 · Protected request</p>
            <h1>Request this resource</h1>
            <p>Review the recorded details, explain the intended use, and confirm a supported handover arrangement.</p>
          </header>
          <div className="donation-claim__layout">
            <aside className="donation-claim__resource" aria-labelledby="resource-summary-title">
              <div className="donation-claim__image"><Image src={resource.image} alt={`${resource.title} resource`} fill priority sizes="(max-width: 760px) 100vw, 390px" /></div>
              <div className="donation-claim__resource-body">
                <span className={`donation-availability donation-availability--${resource.availability}`}>{resource.availability}</span>
                <h2 id="resource-summary-title">{resource.title}</h2>
                <p>{resource.description}</p>
                <dl>
                  <div><dt>Category</dt><dd>{donationCategoryLabel(resource.category)}</dd></div>
                  <div><dt>Condition</dt><dd>{resource.condition}</dd></div>
                  <div><dt>Available</dt><dd><strong>{resource.availableQuantity} {resource.unit}</strong> of {resource.totalQuantity}</dd></div>
                  <div><dt>Donor</dt><dd>{resource.donorName} · {resource.donorType}</dd></div>
                  <div><dt>Locality</dt><dd>{resource.locality}</dd></div>
                  <div><dt>Handover</dt><dd>{resource.handoverMethod ?? "Not provided"}</dd></div>
                  <div><dt>Window</dt><dd>{resource.availabilityWindow ?? "Not provided"}</dd></div>
                </dl>
                {safetyInformation.length > 0 && <section className="donation-claim__safety"><h3>Safety information</h3>{safetyInformation.map((item) => <p key={item.label}><strong>{item.label}:</strong> {item.value}</p>)}</section>}
                <p className="donation-claim__privacy">Private addresses and contact details are not displayed. Inspect the resource and follow the recorded safety guidance at handover.</p>
              </div>
            </aside>

            <section className="donation-claim__form-panel" aria-labelledby="claim-form-title">
              <div className="donation-claim__status" role="status"><strong>Claim status: Not submitted</strong><span>No existing persisted claim was found because claim storage is not connected.</span></div>
              {session === undefined && <div className="donation-claim__auth" aria-live="polite"><strong>Checking sign-in status…</strong></div>}
              {session === null && <div className="donation-claim__auth"><h2>Sign in to request this resource</h2><p>Claim submission is a protected action. Your destination will be preserved.</p><Link className="button button--primary" href={`/auth/required?next=${encodeURIComponent(`/donations/resources/${resource.id}/claim`)}`}>Continue to sign in</Link></div>}
              {session && <>
                <div className="donation-claim__claimant"><span>Requesting as</span><strong>{session.fullName}</strong><small>Signed-in identity only; your private email is not displayed in this request summary.</small></div>
                {!claimable && <div className="donation-claim__blocked" role="alert"><strong>New claims are unavailable</strong><p>The recorded availability or quantity does not permit a request. No form submission can be made.</p></div>}
                <form onSubmit={handleSubmit} noValidate>
                  <div className="donation-claim__form-heading"><div><p className="section-kicker">Claim details</p><h2 id="claim-form-title">Tell the donor what is needed</h2></div><span>* Required</span></div>
                  {Object.keys(errors).length > 0 && <div className="donation-claim__errors" ref={errorSummaryRef} tabIndex={-1} role="alert"><strong>Check the highlighted fields</strong><ul>{Object.values(errors).map((error) => <li key={error}>{error}</li>)}</ul></div>}
                  <label className={`donation-field ${errors.quantity ? "is-error" : ""}`}><b>Quantity requested *</b><input type="number" inputMode="numeric" min="1" max={resource.availableQuantity} step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} disabled={!claimable} aria-describedby="quantity-help quantity-error" /><small id="quantity-help">Whole units only. Maximum currently recorded: {resource.availableQuantity} {resource.unit}.</small>{errors.quantity && <span id="quantity-error">{errors.quantity}</span>}</label>
                  <label className={`donation-field ${errors.intendedUse ? "is-error" : ""}`}><b>Intended use *</b><textarea rows={5} value={intendedUse} onChange={(event) => setIntendedUse(event.target.value)} disabled={!claimable} aria-describedby="use-help use-error" /><small id="use-help">Explain who will use the resource and how it will help. Do not include private addresses or sensitive personal information.</small>{errors.intendedUse && <span id="use-error">{errors.intendedUse}</span>}</label>
                  <label className="donation-field"><b>Supporting information <em>Optional</em></b><textarea rows={3} value={supportingInformation} onChange={(event) => setSupportingInformation(event.target.value)} disabled={!claimable} /><small>Share relevant context in text only. Secure document upload and verification are not available.</small></label>
                  <label className={`donation-field ${errors.handoverPreference ? "is-error" : ""}`}><b>Handover preference *</b><select value={handoverPreference} onChange={(event) => setHandoverPreference(event.target.value)} disabled={!claimable} aria-describedby="handover-help handover-error"><option value="">Select an arrangement</option>{resource.handoverMethod && <option value={resource.handoverMethod}>{resource.handoverMethod}</option>}</select><small id="handover-help">Only the donor-recorded arrangement is offered. A confirmed schedule requires donor review.</small>{errors.handoverPreference && <span id="handover-error">{errors.handoverPreference}</span>}</label>
                  <label className="donation-field"><b>Handover notes <em>Optional</em></b><textarea rows={3} value={handoverNotes} onChange={(event) => setHandoverNotes(event.target.value)} disabled={!claimable} /><small>Describe access or transport needs without sharing exact private locations.</small></label>
                  <section className="donation-claim__live-summary" aria-labelledby="live-summary-title"><h3 id="live-summary-title">Claim summary</h3><dl><div><dt>Resource</dt><dd>{resource.title}</dd></div><div><dt>Quantity</dt><dd>{Number.isInteger(requestedQuantity) && requestedQuantity > 0 ? `${requestedQuantity} ${resource.unit}` : "Not valid"}</dd></div><div><dt>Intended use</dt><dd>{intendedUse.trim() || "Not provided"}</dd></div><div><dt>Handover</dt><dd>{handoverPreference || "Not confirmed"}</dd></div></dl><p>Submitting a claim would not itself mean approval, reservation, allocation, or completed handover.</p></section>
                  {submissionNotice && <div className="donation-claim__notice" role="status"><strong>Live submission unavailable</strong><p>{submissionNotice}</p></div>}
                  <div className="donation-claim__actions"><button className="button button--primary" type="submit" disabled={!claimable}>Submit claim</button><button className="button button--secondary" type="button" onClick={cancel}>Cancel</button></div>
                </form>
              </>}
              <section className="donation-claim__review" aria-labelledby="review-title"><p className="section-kicker">Donor review</p><h2 id="review-title">Approval and rejection controls</h2><p>Active review controls are not shown to claimants. Ownership, claim records, reviewer authorization, and approval or rejection endpoints are not connected, so CONFLUMIX cannot safely offer these actions yet.</p><strong>No review decision or inventory reservation has been created.</strong></section>
            </section>
          </div>
        </div>
      </main>
      {showCancelDialog && <div className="donation-claim__dialog" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setShowCancelDialog(false); }}><section role="dialog" aria-modal="true" aria-labelledby="cancel-title"><h2 id="cancel-title">Discard your claim details?</h2><p>Your entries have not been submitted or saved.</p><div><button className="button button--secondary" type="button" autoFocus onClick={() => setShowCancelDialog(false)}>Stay and continue</button><button className="button button--primary" type="button" onClick={() => router.push(detailHref)}>Discard and return</button></div></section></div>}
    </PublicShell>
  );
}
