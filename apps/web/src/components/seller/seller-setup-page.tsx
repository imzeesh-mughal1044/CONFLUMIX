"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { PublicShell } from "@/components/public/public-shell";
import { readAuthSession } from "@/lib/auth";
import { emailPattern } from "@/lib/validation";
import { calculateSellerCompletion, cnicPattern, completeSellerProfile, emptySellerSetup, phonePattern, readSellerSetup, saveSellerSetup, sellerDeclaration } from "@/services/seller-setup";
import type { DeliveryOption, PaymentMethod, SellerSetup, SensitiveSellerDraft } from "@/types/seller-setup";

const steps = ["Personal information", "Store information", "Preferences", "Review"];
const imageTypes = ["image/jpeg", "image/png", "image/webp"];
const maxImageBytes = 5 * 1024 * 1024;

export function SellerSetupPage() {
  const router = useRouter();
  const summaryRef = useRef<HTMLDivElement>(null);
  const [setup, setSetup] = useState<SellerSetup>(emptySellerSetup);
  const [sensitive, setSensitive] = useState<SensitiveSellerDraft>({ cnicNumber: "", cnicFront: null, cnicBack: null });
  const [branding, setBranding] = useState<{ logo: File | null; banner: File | null }>({ logo: null, banner: null });
  const [step, setStep] = useState(0);
  const [ready, setReady] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [notice, setNotice] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    void readAuthSession().then((session) => {
      if (!active) return;
      if (!session) { router.replace("/auth/login?next=%2Fdashboard%2Fseller-center%2Fsetup"); return; }
      const stored = readSellerSetup();
      setSetup({ ...stored, sellerName: stored.sellerName || session.fullName, email: stored.email || session.email, publicContact: stored.publicContact || stored.phone });
      setCompleted(Boolean(stored.identityDocumentsSubmitted && stored.submittedAt));
      setReady(true);
    });
    return () => { active = false; };
  }, [router]);

  const identityReady = setup.identityDocumentsSubmitted || Boolean(cnicPattern.test(sensitive.cnicNumber) && sensitive.cnicFront && sensitive.cnicBack);
  const completion = useMemo(() => calculateSellerCompletion(setup, identityReady), [identityReady, setup]);

  function update<K extends keyof SellerSetup>(key: K, value: SellerSetup[K]) {
    setSetup((current) => ({ ...current, [key]: value }));
    setErrors((current) => { const next = { ...current }; delete next[String(key)]; return next; });
    setCompleted(false);
    setNotice("");
  }

  function toggleDelivery(value: DeliveryOption) {
    update("deliveryOptions", setup.deliveryOptions.includes(value) ? setup.deliveryOptions.filter((item) => item !== value) : [...setup.deliveryOptions, value]);
  }

  function validate() {
    const next: Record<string, string> = {};
    completion.missing.forEach((item) => { next[item.key] = `${item.label} is required.`; });
    if (!setup.identityDocumentsSubmitted) {
      if (!cnicPattern.test(sensitive.cnicNumber)) next.cnicNumber = "Enter a CNIC in the format 12345-1234567-1.";
      if (!sensitive.cnicFront) next.cnicFront = "Select the CNIC front image.";
      if (!sensitive.cnicBack) next.cnicBack = "Select the CNIC back image.";
    }
    if (setup.email && !emailPattern.test(setup.email.trim())) next.email = "Enter a valid email address.";
    if (setup.phone && !phonePattern.test(setup.phone.replace(/[\s-]/g, ""))) next.phone = "Enter a Pakistani mobile number such as 03001234567.";
    setErrors(next);
    return next;
  }

  function saveDraft() { saveSellerSetup(setup); setNotice("Draft saved."); }
  function review() {
    const next = validate();
    if (Object.keys(next).length) { setStep(completion.missing[0]?.step ?? 0); window.setTimeout(() => summaryRef.current?.focus(), 0); return; }
    setStep(3);
  }
  async function submit() {
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) { window.setTimeout(() => summaryRef.current?.focus(), 0); return; }
    const saved = completeSellerProfile({ ...setup,storeLogo:branding.logo?await fileDataUrl(branding.logo):setup.storeLogo,storeBanner:branding.banner?await fileDataUrl(branding.banner):setup.storeBanner });
    saveSellerSetup(saved);
    setSetup(saved);
    setSensitive({ cnicNumber: "", cnicFront: null, cnicBack: null });
    setCompleted(true);
    setNotice("Seller profile saved successfully.");
  }

  if (!ready) return <div className="route-loading">Loading Seller Center…</div>;
  return <PublicShell><div className="seller-setup-page"><div className="page-container">
    <nav className="seller-back"><Link href="/dashboard">← Personal dashboard</Link></nav>
    <header className="seller-setup-hero"><div><p className="section-kicker">New Product Seller Center</p><h1>Set Up Your Seller Profile</h1><p>Add the information customers need for your store and New Product selling experience.</p></div><div className={`setup-status ${completion.complete ? "is-complete" : ""}`}><span>Profile completion</span><strong>{completion.percentage}% · {completion.complete ? "Complete" : "In progress"}</strong><div className="setup-progress" aria-hidden="true"><i style={{ width: `${completion.percentage}%` }}/></div></div></header>
    <nav className="setup-stepper" aria-label="Seller profile progress">{steps.map((label, index) => <button key={label} type="button" className={step === index ? "is-current" : ""} aria-current={step === index ? "step" : undefined} onClick={() => setStep(index)}><span>{index + 1}</span>{label}</button>)}</nav>
    {Object.keys(errors).length > 0 && <div className="setup-error-summary" ref={summaryRef} tabIndex={-1} role="alert"><strong>Please review the missing or invalid information.</strong><ul>{Array.from(new Set(Object.values(errors))).slice(0, 10).map((message) => <li key={message}>{message}</li>)}</ul></div>}
    <div className="setup-grid"><main>
      {step === 0 && <>
        <Panel title="Personal Information" description="Tell us who owns or represents this store."><fieldset className="seller-type-options"><legend>Seller Type</legend><label><input type="radio" checked={setup.sellerType === "individual"} onChange={() => update("sellerType", "individual")}/><span><strong>Individual</strong>Sell under your own name.</span></label><label><input type="radio" checked={setup.sellerType === "business"} onChange={() => update("sellerType", "business")}/><span><strong>Company / Business</strong>Sell as an owner or authorized representative.</span></label></fieldset><Fields><TextField id="sellerName" label="Owner / Representative Full Name" value={setup.sellerName} onChange={(value) => update("sellerName", value)} error={errors.sellerName}/></Fields></Panel>
        <Panel title="Contact Information" description="Use contact details where customers and CONFLUMIX can reach you."><Fields><TextField id="email" label="Email Address" type="email" value={setup.email} onChange={(value) => update("email", value)} error={errors.email}/><TextField id="phone" label="Phone Number" type="tel" value={setup.phone} onChange={(value) => update("phone", value)} error={errors.phone} placeholder="03001234567"/></Fields></Panel>
        <Panel title="Identity Documents" description="Provide your CNIC number and clear images of both sides."><div className="identity-fields"><TextField id="cnicNumber" label="CNIC Number" value={sensitive.cnicNumber} onChange={(value) => { setSensitive((current) => ({ ...current, cnicNumber: value })); setErrors((current) => { const next = { ...current }; delete next.cnicNumber; return next; }); }} error={errors.cnicNumber} placeholder="12345-1234567-1" hint={setup.identityDocumentsSubmitted ? "Documents selected when this profile was completed." : "Use the format 12345-1234567-1."}/><div className="identity-uploads"><UploadField id="cnicFront" label="CNIC Front Image" file={sensitive.cnicFront} error={errors.cnicFront} privateFile onChange={(file) => setSensitive((current) => ({ ...current, cnicFront: file }))}/><UploadField id="cnicBack" label="CNIC Back Image" file={sensitive.cnicBack} error={errors.cnicBack} privateFile onChange={(file) => setSensitive((current) => ({ ...current, cnicBack: file }))}/></div></div></Panel>
      </>}
      {step === 1 && <>
        <Panel title="Store Information" description="Create a clear, recognizable storefront for your products."><Fields><UploadField id="storeLogo" label="Profile / Store Logo" file={branding.logo} onChange={(file) => setBranding((current) => ({ ...current, logo: file }))}/><UploadField id="storeBanner" label="Store Banner" file={branding.banner} banner onChange={(file) => setBranding((current) => ({ ...current, banner: file }))}/><TextField id="storeName" label="Store Name" value={setup.storeName} onChange={(value) => update("storeName", value)} error={errors.storeName}/><label className="setup-field is-wide" htmlFor="description">Store Description / About <span>Optional</span><textarea id="description" rows={5} maxLength={600} value={setup.description} onChange={(event) => update("description", event.target.value)}/><small>{setup.description.length}/600 characters</small></label></Fields></Panel>
        {setup.sellerType === "business" && <Panel title="Business Information" description="Provide the details customers need to understand your business."><Fields><TextField id="businessName" label="Company / Business Name" value={setup.businessName} onChange={(value) => update("businessName", value)} error={errors.businessName}/><SelectField id="businessType" label="Business Type" value={setup.businessType} onChange={(value) => update("businessType", value as SellerSetup["businessType"])} error={errors.businessType} options={[["retailer","Retailer"],["wholesaler","Wholesaler"],["manufacturer","Manufacturer"],["distributor","Distributor"],["other","Other"]]}/><TextField id="businessRepresentative" label="Owner / Authorized Representative Name" value={setup.sellerName} onChange={(value) => update("sellerName", value)}/><SelectField id="representativePosition" label="Representative Position" value={setup.representativePosition} onChange={(value) => update("representativePosition", value as SellerSetup["representativePosition"])} error={errors.representativePosition} options={[["owner","Owner"],["manager","Manager"],["authorized-representative","Authorized Representative"]]}/><TextField id="businessEmail" label="Business Email" type="email" value={setup.businessEmail} onChange={(value) => update("businessEmail", value)} error={errors.businessEmail}/><TextField id="businessPhone" label="Business Phone Number" type="tel" value={setup.businessPhone} onChange={(value) => update("businessPhone", value)} error={errors.businessPhone}/><TextField id="businessAddress" label="Business Address" value={setup.businessAddress} onChange={(value) => update("businessAddress", value)} error={errors.businessAddress}/></Fields></Panel>}
        <Panel title="Business Address" description="Add your store location and customer support number."><Fields><TextField id="storeAddress" label="Business / Store Address" value={setup.storeAddress} onChange={(value) => update("storeAddress", value)} error={errors.storeAddress}/><TextField id="city" label="City" value={setup.city} onChange={(value) => update("city", value)} error={errors.city}/><TextField id="locality" label="Area" value={setup.locality} onChange={(value) => update("locality", value)} error={errors.locality}/><TextField id="publicContact" label="Contact / Support Number" type="tel" value={setup.publicContact} onChange={(value) => update("publicContact", value)} error={errors.publicContact}/></Fields></Panel>
      </>}
      {step === 2 && <>
        <Panel title="Delivery & Returns" description="Choose how customers receive orders and explain your return policy."><fieldset className="preference-options"><legend>Delivery Options</legend>{[["pickup","Pickup"],["local-delivery","Local Delivery"],["shipping","Shipping"]].map(([value,label]) => <label key={value}><input type="checkbox" checked={setup.deliveryOptions.includes(value as DeliveryOption)} onChange={() => toggleDelivery(value as DeliveryOption)}/><span>{label}</span></label>)}{errors.deliveryOptions && <small>{errors.deliveryOptions}</small>}</fieldset><Fields><label className="setup-field is-wide" htmlFor="returnPolicy">Return / Exchange Policy<textarea id="returnPolicy" rows={5} value={setup.returnPolicy} onChange={(event) => update("returnPolicy", event.target.value)} aria-invalid={Boolean(errors.returnPolicy)}/>{errors.returnPolicy && <small className="field-error">{errors.returnPolicy}</small>}</label></Fields></Panel>
        <Panel title="Payment Preferences" description="Choose the payment method you prefer for New Product orders."><Fields><SelectField id="paymentMethod" label="Preferred Payment Method" value={setup.paymentMethod} onChange={(value) => update("paymentMethod", value as PaymentMethod)} error={errors.paymentMethod} options={[["cash-on-delivery","Cash on delivery"],["bank-transfer","Bank transfer"],["cash-on-pickup","Cash on pickup"]]}/></Fields></Panel>
        <Panel title="Terms & Declaration" description="Review and accept both agreements to complete your profile."><div className="agreement-list"><label><input type="checkbox" checked={setup.termsAccepted} onChange={(event) => update("termsAccepted", event.target.checked)}/><span>I accept the <Link href="/terms">CONFLUMIX Terms &amp; Conditions</Link>.</span></label>{errors.termsAccepted && <small>{errors.termsAccepted}</small>}<label><input type="checkbox" checked={setup.declarationAccepted} onChange={(event) => update("declarationAccepted", event.target.checked)}/><span>{sellerDeclaration}</span></label>{errors.declarationAccepted && <small>{errors.declarationAccepted}</small>}</div></Panel>
      </>}
      {step === 3 && <Panel title="Review Your Information" description="Confirm your seller and store details before saving your profile.">{completed ? <div className="setup-ready"><strong>Your seller profile is complete.</strong><p>You can now choose the New Product categories and attributes your store will use.</p><Link className="button button--primary" href="/dashboard/seller-center/new-products/categories">Continue to Category Setup</Link></div> : completion.missing.length ? <div className="missing-list"><strong>{completion.missing.length} item{completion.missing.length === 1 ? "" : "s"} still needed</strong><ul>{completion.missing.map((item) => <li key={item.key}><button type="button" onClick={() => setStep(item.step)}>{item.label}</button></li>)}</ul></div> : <div className="setup-ready"><strong>Your information is ready to save.</strong><p>Completing your seller profile is separate from choosing product categories.</p></div>}<div className="trust-grid"><Trust label="Seller Type" value={setup.sellerType === "business" ? "Company / Business" : "Individual"}/><Trust label="Owner / Representative" value={setup.sellerName || "Not provided"}/><Trust label="Email Address" value={setup.email || "Not provided"}/><Trust label="Store Name" value={setup.storeName || "Not provided"}/><Trust label="Business / Store Address" value={setup.storeAddress || "Not provided"}/><Trust label="Delivery Options" value={setup.deliveryOptions.length ? setup.deliveryOptions.map(titleCase).join(", ") : "Not provided"}/><Trust label="Preferred Payment Method" value={setup.paymentMethod ? titleCase(setup.paymentMethod) : "Not provided"}/></div>{!completed && <div className="review-actions"><button className="button button--secondary" type="button" onClick={saveDraft}>Save Draft</button><button className="button button--primary" type="button" onClick={submit} disabled={!completion.complete}>Save Seller Profile</button></div>}</Panel>}
      <div className="setup-navigation"><button className="button button--secondary" type="button" disabled={step === 0} onClick={() => setStep((value) => Math.max(0, value - 1))}>Back</button><button className="button button--secondary" type="button" onClick={saveDraft}>Save Draft</button>{step < 3 ? <button className="button button--primary" type="button" onClick={() => setStep((value) => Math.min(3, value + 1))}>Continue</button> : <button className="button button--primary" type="button" onClick={review}>Review Profile</button>}</div>
    </main><aside className="setup-summary"><p className="section-kicker">Profile summary</p><h2>{setup.storeName || setup.sellerName || "Your seller profile"}</h2><Trust label="Seller Type" value={setup.sellerType === "business" ? "Company / Business" : "Individual"}/><Trust label="Marketplace" value="New Products"/><Trust label="Profile" value={completed ? "Complete" : completion.complete ? "Ready to save" : "In progress"}/><div className="summary-completion"><span>{completion.percentage}% complete</span><div><i style={{ width: `${completion.percentage}%` }}/></div></div><button className="button button--primary" type="button" onClick={review}>Review Profile</button>{completed && <Link href="/dashboard/seller-center/new-products/categories">Continue to Category Setup</Link>}</aside></div>
    {notice && <div className="product-toast" role="status">{notice}</div>}
  </div></div></PublicShell>;
}

function Panel({ title, description, children }: { title: string; description: string; children: React.ReactNode }) { return <section className="setup-panel"><div className="setup-panel__heading"><div><h2>{title}</h2></div><p>{description}</p></div>{children}</section>; }
function Fields({ children }: { children: React.ReactNode }) { return <div className="setup-fields">{children}</div>; }
function TextField({ id, label, value, onChange, error, hint, type = "text", placeholder }: { id: string; label: string; value: string; onChange: (value: string) => void; error?: string; hint?: string; type?: string; placeholder?: string }) { return <label className="setup-field" htmlFor={id}>{label}<input id={id} type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} aria-invalid={Boolean(error)} aria-describedby={error || hint ? `${id}-message` : undefined}/>{(error || hint) && <small id={`${id}-message`} className={error ? "field-error" : ""}>{error || hint}</small>}</label>; }
function SelectField({ id, label, value, onChange, error, options }: { id: string; label: string; value: string; onChange: (value: string) => void; error?: string; options: string[][] }) { return <label className="setup-field" htmlFor={id}>{label}<select id={id} value={value} onChange={(event) => onChange(event.target.value)} aria-invalid={Boolean(error)}><option value="">Choose an option</option>{options.map(([optionValue,label]) => <option value={optionValue} key={optionValue}>{label}</option>)}</select>{error && <small className="field-error">{error}</small>}</label>; }
function UploadField({ id, label, file, onChange, error, privateFile, banner }: { id: string; label: string; file: File | null; onChange: (file: File | null) => void; error?: string; privateFile?: boolean; banner?: boolean }) {
  const [localError, setLocalError] = useState("");
  const preview = useMemo(() => file ? URL.createObjectURL(file) : "", [file]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  function choose(event: ChangeEvent<HTMLInputElement>) { const selected = event.target.files?.[0] ?? null; setLocalError(""); if (selected && (!imageTypes.includes(selected.type) || selected.size > maxImageBytes)) { setLocalError("Choose a JPEG, PNG, or WebP image no larger than 5 MB."); event.target.value = ""; return; } onChange(selected); }
  return <div className={`setup-upload ${banner ? "is-banner" : ""} ${privateFile ? "is-private" : ""}`}><label htmlFor={id}>{label}</label><div className="setup-upload__preview">{preview ? <Image src={preview} alt={`${label} preview`} fill unoptimized sizes={banner ? "600px" : "280px"}/> : <span>{privateFile ? "No document selected" : banner ? "No banner selected" : "No image selected"}</span>}</div><input id={id} type="file" accept="image/jpeg,image/png,image/webp" onChange={choose}/><div><label className="button button--secondary" htmlFor={id}>{file ? "Replace" : "Select image"}</label>{file && <button type="button" onClick={() => onChange(null)}>Remove</button>}</div><small className={error || localError ? "field-error" : ""}>{error || localError || "JPEG, PNG or WebP · Maximum 5 MB"}</small></div>;
}
function Trust({ label, value }: { label: string; value: string }) { return <div className="summary-row"><span>{label}</span><strong>{value}</strong></div>; }
function titleCase(value: string) { return value.split("-").map((item) => item.charAt(0).toUpperCase() + item.slice(1)).join(" "); }
function fileDataUrl(file:File){return new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(reader.error);reader.readAsDataURL(file)})}
