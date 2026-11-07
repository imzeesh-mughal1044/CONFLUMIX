"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { PublicShell } from "@/components/public/public-shell";
import { reuseAttributeDefinitions } from "@/data/reuse-attributes";
import { localities } from "@/data/marketplace";
import { readAuthSession, type AuthSession } from "@/lib/auth";
import { getEditableReuseListing, saveReuseListing } from "@/services/reuse";
import { readReuseConfiguration } from "@/services/reuse-seller";
import { readSellerSetup } from "@/services/seller-setup";
import {
  reuseConditions,
  type ReuseListing,
  type ReuseRepairDisclosure,
} from "@/types/reuse";

type FormState = {
  title: string;
  description: string;
  category: string;
  brand: string;
  model: string;
  condition: ReuseListing["condition"];
  classification: ReuseListing["classification"];
  price: string;
  negotiable: boolean;
  quantity: string;
  locality: ReuseListing["locality"];
  usageDuration: string;
  purchaseDate: string;
  reasonForSelling: string;
  warrantyStatus: string;
  accessories: string;
  defects: string;
  sellerNotes: string;
  handoverMethods: string[];
  attributes: Record<string, string>;
  repairs: ReuseRepairDisclosure[];
  media: ReuseListing["media"];
};
const blank: FormState = {
  title: "",
  description: "",
  category: "",
  brand: "",
  model: "",
  condition: "Good",
  classification: "Pre-owned",
  price: "",
  negotiable: false,
  quantity: "1",
  locality: "DHA Phase 6",
  usageDuration: "",
  purchaseDate: "",
  reasonForSelling: "",
  warrantyStatus: "",
  accessories: "",
  defects: "",
  sellerNotes: "",
  handoverMethods: [],
  attributes: {},
  repairs: [],
  media: [],
};
const split = (value: string) =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
const toForm = (item: ReuseListing): FormState => ({
  title: item.title,
  description: item.description,
  category: item.category,
  brand: item.brand ?? "",
  model: item.model ?? "",
  condition: item.condition,
  classification: item.classification,
  price: String(item.askingPrice),
  negotiable: item.negotiable,
  quantity: String(item.quantity ?? 1),
  locality: item.locality,
  usageDuration: item.usageDuration ?? "",
  purchaseDate: item.purchaseDate ?? "",
  reasonForSelling: item.reasonForSelling ?? "",
  warrantyStatus: item.warrantyStatus ?? "",
  accessories: (item.accessories ?? []).join("\n"),
  defects: (item.defects ?? []).join("\n"),
  sellerNotes: item.sellerNotes ?? "",
  handoverMethods: item.handoverMethods,
  attributes: Object.fromEntries(
    item.attributes.map((value) => [value.label, value.value]),
  ),
  repairs: item.repairHistory,
  media: item.media,
});

export function ReuseListingForm({
  mode,
  itemId,
}: {
  mode: "create" | "edit";
  itemId?: string;
}) {
  const router = useRouter(),
    fileRef = useRef<HTMLInputElement>(null),
    [session, setSession] = useState<AuthSession | null>(null),
    [data, setData] = useState<FormState>(blank),
    [original, setOriginal] = useState<ReuseListing | null>(null),
    [categories, setCategories] = useState<string[]>([]),
    [ready, setReady] = useState(false),
    [blocked, setBlocked] = useState(""),
    [errors, setErrors] = useState<Record<string, string>>({}),
    [notice, setNotice] = useState(""),
    [preview, setPreview] = useState(false),
    [saving, setSaving] = useState(false),
    [categoryPending, setCategoryPending] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    void readAuthSession().then((current) => {
      if (!active) return;
      if (!current) {
        router.replace(
          `/auth/login?next=${encodeURIComponent(mode === "create" ? "/reuse/sell/new" : `/reuse/sell/${itemId}/edit`)}`,
        );
        return;
      }
      const config = readReuseConfiguration(),
        setup = readSellerSetup();
      setSession(current);
      setCategories(config.categories);
      if (!setup.reuseEnabled || !config.categories.length) {
        setBlocked(
          "Complete Reuse category configuration before creating or editing listings.",
        );
        setReady(true);
        return;
      }
      if (mode === "edit") {
        if (!itemId || !/^[a-z0-9-]+$/i.test(itemId)) {
          setBlocked("This listing identifier is invalid.");
          setReady(true);
          return;
        }
        const item = getEditableReuseListing(itemId);
        if (!item) {
          setBlocked("The requested Reuse listing was not found.");
          setReady(true);
          return;
        }
        if (
          !item.ownerEmail ||
          item.ownerEmail.toLowerCase() !== current.email.toLowerCase()
        ) {
          setBlocked(
            "You are not authorized to edit this listing. Fixture listings have no editable owner context.",
          );
          setReady(true);
          return;
        }
        if (item.lifecycle !== "draft" && item.status !== "Active") {
          setBlocked(
            `This ${item.status.toLowerCase()} listing is read-only because no supported edit transition exists for its current state.`,
          );
          setReady(true);
          return;
        }
        if (!config.categories.includes(item.category)) {
          setBlocked(
            "This listing’s category is no longer configured. Re-enable it before editing.",
          );
          setReady(true);
          return;
        }
        setOriginal(item);
        setData(toForm(item));
      }
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, [itemId, mode, router]);
  const dirty =
    ready &&
    !blocked &&
    JSON.stringify(data) !==
      JSON.stringify(original ? toForm(original) : blank);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const definitions = useMemo(
    () => reuseAttributeDefinitions[data.category] ?? [],
    [data.category],
  );
  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setData((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
    setNotice("");
  }
  function chooseCategory(value: string) {
    const incompatible = Object.keys(data.attributes).filter(
      (key) =>
        data.attributes[key] &&
        !(reuseAttributeDefinitions[value] ?? []).some(
          (field) => field.label === key,
        ),
    );
    if (incompatible.length) {
      setCategoryPending(value);
      return;
    }
    update("category", value);
  }
  function confirmCategory() {
    if (!categoryPending) return;
    const allowed = new Set(
      (reuseAttributeDefinitions[categoryPending] ?? []).map(
        (field) => field.label,
      ),
    );
    update(
      "attributes",
      Object.fromEntries(
        Object.entries(data.attributes).filter(([key]) => allowed.has(key)),
      ),
    );
    update("category", categoryPending);
    setCategoryPending(null);
  }
  async function chooseMedia(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (data.media.length + files.length > 20) {
      setErrors((value) => ({
        ...value,
        media: "A listing can contain up to 20 photos.",
      }));
      return;
    }
    if (
      files.some(
        (file) =>
          !["image/jpeg", "image/png", "image/webp"].includes(file.type),
      )
    ) {
      setErrors((value) => ({
        ...value,
        media:
          "Use JPEG, PNG, or WebP photos. Repository media rules do not define a file-size limit.",
      }));
      return;
    }
    const additions = await Promise.all(
      files.map(
        (file) =>
          new Promise<ReuseListing["media"][number]>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve({
                id: crypto.randomUUID(),
                src: String(reader.result),
                alt: `Local preview for ${file.name}`,
                type: "image",
                local: true,
              });
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          }),
      ),
    );
    update("media", [...data.media, ...additions]);
    event.target.value = "";
  }
  function validate(publish: boolean) {
    const next: Record<string, string> = {};
    if (!data.title.trim()) next.title = "Enter a product title.";
    if (publish && data.description.trim().length < 20)
      next.description = "Enter at least 20 characters describing the item.";
    if (!data.category) next.category = "Choose a configured main category.";
    if (publish && !reuseConditions.includes(data.condition))
      next.condition = "Choose a valid condition.";
    if (
      publish &&
      (!Number.isFinite(Number(data.price)) || Number(data.price) <= 0)
    )
      next.price = "Enter a valid asking price greater than zero.";
    if (
      publish &&
      (!Number.isInteger(Number(data.quantity)) || Number(data.quantity) < 1)
    )
      next.quantity = "Enter a whole quantity of at least one.";
    if (publish && !data.media.length)
      next.media = "Add at least one photo before publishing.";
    if (data.media.length > 20)
      next.media = "A listing can contain up to 20 photos.";
    if (publish && !data.handoverMethods.length)
      next.handoverMethods = "Choose at least one handover method.";
    if (publish)
      definitions
        .filter((field) => field.required)
        .forEach((field) => {
          if (!data.attributes[field.label]?.trim())
            next[`attribute-${field.id}`] = `${field.label} is required.`;
        });
    setErrors(next);
    if (Object.keys(next).length)
      document.getElementById(Object.keys(next)[0])?.focus();
    return !Object.keys(next).length;
  }
  function build(lifecycle: "draft" | "published"): ReuseListing {
    const now = new Date().toISOString(),
      price = Number(data.price) || 0;
    return {
      id: original?.id ?? `reuse-${crypto.randomUUID()}`,
      title: data.title.trim() || "Untitled draft",
      description: data.description.trim(),
      category: data.category,
      locality: data.locality,
      createdAt: original?.createdAt ?? now,
      askingPrice: price,
      previousAskingPrice:
        original && original.askingPrice !== price
          ? original.askingPrice
          : original?.previousAskingPrice,
      condition: data.condition,
      classification: data.classification,
      status: original?.status ?? "Active",
      availability: original?.availability ?? "Available",
      sellerType:
        original?.sellerType ??
        (readSellerSetup().sellerType === "business"
          ? "Local Business"
          : "Individual"),
      sellerName:
        original?.sellerName ??
        (readSellerSetup().storeName || session?.fullName || "Seller"),
      sellerVerification: original?.sellerVerification ?? "Unverified",
      image: data.media[0]?.src,
      media: data.media,
      negotiable: data.negotiable,
      brand: data.brand || undefined,
      model: data.model || undefined,
      purchaseDate: data.purchaseDate || undefined,
      usageDuration: data.usageDuration || undefined,
      reasonForSelling: data.reasonForSelling || undefined,
      warrantyStatus: data.warrantyStatus || undefined,
      accessories: split(data.accessories),
      defects: split(data.defects),
      attributes: Object.entries(data.attributes)
        .filter(([, value]) => value.trim())
        .map(([label, value]) => ({ label, value })),
      sellerNotes: data.sellerNotes || undefined,
      handoverMethods: data.handoverMethods,
      repairHistory: data.repairs,
      priceHistory:
        original?.priceHistory ??
        (price
          ? [{ id: crypto.randomUUID(), changedAt: now, askingPrice: price }]
          : []),
      ownerEmail: session?.email,
      quantity: Number(data.quantity) || 1,
      lifecycle,
      updatedAt: original?.updatedAt,
      version: original?.version,
      demo: true,
    };
  }
  function save(lifecycle: "draft" | "published") {
    if (!validate(lifecycle === "published")) return;
    setSaving(true);
    try {
      const result = saveReuseListing(build(lifecycle), original?.version);
      setOriginal(result);
      setData(toForm(result));
      setNotice(
        lifecycle === "draft"
          ? "Draft saved in this browser. It is not publicly visible."
          : mode === "edit"
            ? "Prototype listing changes saved."
            : "Prototype listing published in this browser.",
      );
      if (lifecycle === "published") router.push(`/reuse/${result.id}`);
    } catch (value) {
      setErrors({
        form:
          value instanceof Error
            ? value.message
            : "The listing could not be saved.",
      });
    } finally {
      setSaving(false);
    }
  }
  function cancel() {
    if (
      !dirty ||
      window.confirm("Discard your unsaved changes and leave this form?")
    )
      router.push(
        original?.lifecycle === "published"
          ? `/reuse/${original.id}`
          : "/reuse",
      );
  }
  if (!ready)
    return (
      <div className="route-loading" role="status">
        Loading Reuse listing form…
      </div>
    );
  if (blocked)
    return (
      <PublicShell>
        <main className="reuse-form-blocked page-container">
          <p className="section-kicker">Reuse Seller Center</p>
          <h1>
            {mode === "edit" ? "Listing cannot be edited" : "Setup required"}
          </h1>
          <p>{blocked}</p>
          <div>
            <Link
              className="button button--primary"
              href="/dashboard/seller-center/reuse/categories"
            >
              Configure Reuse categories
            </Link>
            <Link className="button button--secondary" href="/reuse">
              Return to Reuse
            </Link>
          </div>
        </main>
      </PublicShell>
    );
  return (
    <PublicShell>
      <main className="reuse-seller-page">
        <div className="page-container">
          <header className="reuse-listing-header">
            <div>
              <p className="section-kicker">
                Browser-local Reuse seller workflow
              </p>
              <h1>
                {mode === "create"
                  ? "Create Reuse Listing"
                  : "Edit Reuse Listing"}
              </h1>
              <p>
                List a pre-owned, refurbished, or surplus item. Draft, preview,
                and publish remain separate actions.
              </p>
            </div>
            <button
              type="button"
              className="button button--secondary"
              onClick={cancel}
            >
              Cancel
            </button>
          </header>
          {original && (
            <div className="prototype-banner">
              <strong>
                Current listing state: {original.lifecycle ?? "published"}
              </strong>
              <span>
                Status remains {original.status}; saving edits does not reset
                lifecycle status.
              </span>
            </div>
          )}
          {errors.form && (
            <p className="config-error" role="alert">
              {errors.form}
            </p>
          )}
          <div className="reuse-listing-layout">
            <form
              className="reuse-listing-form"
              onSubmit={(event) => {
                event.preventDefault();
                save("published");
              }}
              noValidate
            >
              <Section title="Basic product information">
                <Field id="title" label="Product title" error={errors.title}>
                  <input
                    id="title"
                    value={data.title}
                    onChange={(e) => update("title", e.target.value)}
                    maxLength={120}
                  />
                </Field>
                <Field
                  id="category"
                  label="Main category"
                  error={errors.category}
                >
                  <select
                    id="category"
                    value={data.category}
                    onChange={(e) => chooseCategory(e.target.value)}
                  >
                    <option value="">Choose a configured category</option>
                    {categories.map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </Field>
                <Field id="brand" label="Brand (optional)">
                  <input
                    id="brand"
                    value={data.brand}
                    onChange={(e) => update("brand", e.target.value)}
                  />
                </Field>
                <Field id="model" label="Model (optional)">
                  <input
                    id="model"
                    value={data.model}
                    onChange={(e) => update("model", e.target.value)}
                  />
                </Field>
                <Field
                  id="description"
                  label="Description"
                  error={errors.description}
                  wide
                >
                  <textarea
                    id="description"
                    rows={6}
                    value={data.description}
                    onChange={(e) => update("description", e.target.value)}
                  />
                </Field>
              </Section>
              <Section title="Category-specific attributes">
                {data.category ? (
                  definitions.map((field) => (
                    <Field
                      key={field.id}
                      id={`attribute-${field.id}`}
                      label={`${field.label}${field.required ? " *" : ""}`}
                      error={errors[`attribute-${field.id}`]}
                    >
                      <input
                        id={`attribute-${field.id}`}
                        value={data.attributes[field.label] ?? ""}
                        onChange={(e) =>
                          update("attributes", {
                            ...data.attributes,
                            [field.label]: e.target.value,
                          })
                        }
                      />
                    </Field>
                  ))
                ) : (
                  <p className="listing-empty">
                    Choose a configured main category to load its supported
                    fields.
                  </p>
                )}
              </Section>
              <Section title="Condition and item details">
                <Field
                  id="condition"
                  label="Product condition"
                  error={errors.condition}
                >
                  <select
                    id="condition"
                    value={data.condition}
                    onChange={(e) =>
                      update(
                        "condition",
                        e.target.value as FormState["condition"],
                      )
                    }
                  >
                    {reuseConditions.map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </Field>
                <Field id="classification" label="Classification">
                  <select
                    id="classification"
                    value={data.classification}
                    onChange={(e) =>
                      update(
                        "classification",
                        e.target.value as FormState["classification"],
                      )
                    }
                  >
                    <option>Pre-owned</option>
                    <option>Refurbished</option>
                    <option>Surplus</option>
                  </select>
                </Field>
                <Field id="usageDuration" label="Usage duration">
                  <input
                    id="usageDuration"
                    value={data.usageDuration}
                    onChange={(e) => update("usageDuration", e.target.value)}
                  />
                </Field>
                <Field id="purchaseDate" label="Purchase date (if known)">
                  <input
                    id="purchaseDate"
                    type="date"
                    value={data.purchaseDate}
                    onChange={(e) => update("purchaseDate", e.target.value)}
                  />
                </Field>
                <Field id="reasonForSelling" label="Reason for selling">
                  <input
                    id="reasonForSelling"
                    value={data.reasonForSelling}
                    onChange={(e) => update("reasonForSelling", e.target.value)}
                  />
                </Field>
                <Field id="warrantyStatus" label="Warranty status">
                  <input
                    id="warrantyStatus"
                    value={data.warrantyStatus}
                    onChange={(e) => update("warrantyStatus", e.target.value)}
                  />
                </Field>
                <Field
                  id="accessories"
                  label="Included accessories (one per line)"
                >
                  <textarea
                    id="accessories"
                    rows={4}
                    value={data.accessories}
                    onChange={(e) => update("accessories", e.target.value)}
                  />
                </Field>
                <Field
                  id="defects"
                  label="Known defects or damage (one per line)"
                >
                  <textarea
                    id="defects"
                    rows={4}
                    value={data.defects}
                    onChange={(e) => update("defects", e.target.value)}
                  />
                </Field>
                <Field id="sellerNotes" label="Seller notes" wide>
                  <textarea
                    id="sellerNotes"
                    rows={4}
                    value={data.sellerNotes}
                    onChange={(e) => update("sellerNotes", e.target.value)}
                  />
                </Field>
              </Section>
              <Section title="Price and availability">
                <Field
                  id="price"
                  label="Asking price (PKR)"
                  error={errors.price}
                >
                  <input
                    id="price"
                    inputMode="decimal"
                    value={data.price}
                    onChange={(e) => update("price", e.target.value)}
                  />
                </Field>
                <Field id="quantity" label="Quantity" error={errors.quantity}>
                  <input
                    id="quantity"
                    inputMode="numeric"
                    value={data.quantity}
                    onChange={(e) => update("quantity", e.target.value)}
                  />
                </Field>
                <label className="reuse-check">
                  <input
                    type="checkbox"
                    checked={data.negotiable}
                    onChange={(e) => update("negotiable", e.target.checked)}
                  />
                  <span>Price is negotiable</span>
                </label>
              </Section>
              <Section title="Photos">
                <div className="reuse-media-manager">
                  <input
                    ref={fileRef}
                    className="sr-only"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={chooseMedia}
                  />
                  <button
                    type="button"
                    className="reuse-media-picker"
                    onClick={() => fileRef.current?.click()}
                  >
                    <strong>Select photos</strong>
                    <span>
                      Up to 20 JPEG, PNG, or WebP images. Local previews are
                      stored only when the prototype listing is saved.
                    </span>
                  </button>
                  {errors.media && (
                    <p id="media" className="field-error" role="alert">
                      {errors.media}
                    </p>
                  )}
                  <div className="reuse-media-grid">
                    {data.media.map((media, index) => (
                      <figure key={media.id}>
                        <div>
                          <Image
                            src={media.src}
                            alt={media.alt}
                            fill
                            unoptimized={media.local}
                            sizes="160px"
                          />
                        </div>
                        <figcaption>
                          <span>
                            {media.local ? "Local preview" : "Saved media"}
                            {index === 0 ? " · Primary" : ""}
                          </span>
                          <button
                            type="button"
                            aria-label={`Remove photo ${index + 1}`}
                            onClick={() => {
                              if (
                                !media.local &&
                                !window.confirm(
                                  "Remove this saved photo when changes are saved?",
                                )
                              )
                                return;
                              update(
                                "media",
                                data.media.filter(
                                  (item) => item.id !== media.id,
                                ),
                              );
                            }}
                          >
                            Remove
                          </button>
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                </div>
              </Section>
              <Section title="Repair and refurbishment disclosure">
                <RepairEditor
                  value={data.repairs}
                  onChange={(value) => update("repairs", value)}
                />
              </Section>
              <Section title="Location and handover">
                <Field id="locality" label="Locality">
                  <select
                    id="locality"
                    value={data.locality}
                    onChange={(e) =>
                      update(
                        "locality",
                        e.target.value as FormState["locality"],
                      )
                    }
                  >
                    {localities.map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </Field>
                <fieldset className="reuse-handover">
                  <legend>Handover methods</legend>
                  {[
                    "Local pickup",
                    "Public-place handover",
                    "Seller-arranged local delivery",
                  ].map((value) => (
                    <label key={value}>
                      <input
                        type="checkbox"
                        checked={data.handoverMethods.includes(value)}
                        onChange={(e) =>
                          update(
                            "handoverMethods",
                            e.target.checked
                              ? [...data.handoverMethods, value]
                              : data.handoverMethods.filter(
                                  (item) => item !== value,
                                ),
                          )
                        }
                      />
                      {value}
                    </label>
                  ))}
                  {errors.handoverMethods && (
                    <p id="handoverMethods" className="field-error">
                      {errors.handoverMethods}
                    </p>
                  )}
                </fieldset>
              </Section>
              <div className="reuse-form-actions">
                <button
                  className="button button--secondary"
                  type="button"
                  disabled={saving}
                  onClick={() => save("draft")}
                >
                  Save Draft
                </button>
                <button
                  className="button button--secondary"
                  type="button"
                  onClick={() => setPreview(true)}
                >
                  Preview
                </button>
                <button
                  className="button button--primary"
                  type="submit"
                  disabled={saving}
                >
                  {saving
                    ? "Saving…"
                    : mode === "edit"
                      ? "Save Changes"
                      : "Publish"}
                </button>
              </div>
            </form>
            <aside className="reuse-form-aside">
              <strong>
                {dirty ? "Unsaved changes" : "No unsaved changes"}
              </strong>
              <p>
                Only configured categories appear. Listing values never modify
                category templates.
              </p>
              <dl>
                <div>
                  <dt>Photos</dt>
                  <dd>{data.media.length}/20</dd>
                </div>
                <div>
                  <dt>Category</dt>
                  <dd>{data.category || "Not selected"}</dd>
                </div>
                <div>
                  <dt>Persistence</dt>
                  <dd>Browser only</dd>
                </div>
              </dl>
            </aside>
          </div>
          {notice && (
            <div className="product-toast" role="status">
              {notice}
            </div>
          )}
        </div>
      </main>
      {preview && <Preview data={data} onClose={() => setPreview(false)} />}{" "}
      {categoryPending && (
        <ConfirmCategory
          category={categoryPending}
          onCancel={() => setCategoryPending(null)}
          onConfirm={confirmCategory}
        />
      )}
    </PublicShell>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="reuse-form-section">
      <h2>{title}</h2>
      <div>{children}</div>
    </section>
  );
}
function Field({
  id,
  label,
  error,
  wide,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`reuse-form-field ${wide ? "is-wide" : ""}`} htmlFor={id}>
      {label}
      {children}
      {error && (
        <span className="field-error" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}
function RepairEditor({
  value,
  onChange,
}: {
  value: ReuseRepairDisclosure[];
  onChange: (value: ReuseRepairDisclosure[]) => void;
}) {
  function add() {
    onChange([
      ...value,
      {
        id: crypto.randomUUID(),
        date: "",
        component: "",
        type: "DIY",
        notes: "",
      },
    ]);
  }
  return (
    <div className="reuse-repair-editor">
      {value.map((repair, index) => (
        <fieldset key={repair.id}>
          <legend>Disclosure {index + 1}</legend>
          <label>
            Date
            <input
              type="date"
              value={repair.date}
              onChange={(e) =>
                onChange(
                  value.map((item) =>
                    item.id === repair.id
                      ? { ...item, date: e.target.value }
                      : item,
                  ),
                )
              }
            />
          </label>
          <label>
            Component
            <input
              value={repair.component}
              onChange={(e) =>
                onChange(
                  value.map((item) =>
                    item.id === repair.id
                      ? { ...item, component: e.target.value }
                      : item,
                  ),
                )
              }
            />
          </label>
          <label>
            Type
            <select
              value={repair.type}
              onChange={(e) =>
                onChange(
                  value.map((item) =>
                    item.id === repair.id
                      ? {
                          ...item,
                          type: e.target.value as ReuseRepairDisclosure["type"],
                        }
                      : item,
                  ),
                )
              }
            >
              <option>DIY</option>
              <option>Third-party</option>
              <option>Authorized</option>
            </select>
          </label>
          <label>
            Notes
            <textarea
              rows={3}
              value={repair.notes}
              onChange={(e) =>
                onChange(
                  value.map((item) =>
                    item.id === repair.id
                      ? { ...item, notes: e.target.value }
                      : item,
                  ),
                )
              }
            />
          </label>
          <label>
            Parts warranty
            <input
              value={repair.partsWarranty ?? ""}
              onChange={(e) =>
                onChange(
                  value.map((item) =>
                    item.id === repair.id
                      ? { ...item, partsWarranty: e.target.value }
                      : item,
                  ),
                )
              }
            />
          </label>
          <button
            type="button"
            onClick={() =>
              onChange(value.filter((item) => item.id !== repair.id))
            }
          >
            Remove disclosure
          </button>
        </fieldset>
      ))}
      <button type="button" className="button button--secondary" onClick={add}>
        Add repair disclosure
      </button>
      <p>
        All repair details are seller-provided. “Authorized” does not mean
        CONFLUMIX verified the repair.
      </p>
    </div>
  );
}
function Preview({ data, onClose }: { data: FormState; onClose: () => void }) {
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    close.current?.focus();
    const key = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [onClose]);
  return (
    <div
      className="listing-preview-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reuse-preview-title"
    >
      <section className="reuse-preview-dialog">
        <button
          ref={close}
          type="button"
          onClick={onClose}
          aria-label="Close preview"
        >
          ×
        </button>
        <p className="section-kicker">Unpublished preview</p>
        <h2 id="reuse-preview-title">
          {data.title || "Untitled Reuse listing"}
        </h2>
        {data.media[0] && (
          <div className="reuse-preview-image">
            <Image
              src={data.media[0].src}
              alt={data.media[0].alt}
              fill
              unoptimized={data.media[0].local}
            />
          </div>
        )}
        <strong>PKR {Number(data.price || 0).toLocaleString()}</strong>
        <p>{data.description || "No description entered yet."}</p>
        <small>
          Opening this preview does not save or publish the listing.
        </small>
      </section>
    </div>
  );
}
function ConfirmCategory({
  category,
  onCancel,
  onConfirm,
}: {
  category: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="listing-preview-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-change-title"
    >
      <section className="reuse-preview-dialog">
        <h2 id="category-change-title">Change category to {category}?</h2>
        <p>
          Values that are not defined for the new category will be removed from
          this form. Common listing fields and compatible attribute labels are
          preserved.
        </p>
        <div>
          <button
            className="button button--secondary"
            type="button"
            onClick={onCancel}
          >
            Keep current category
          </button>
          <button
            className="button button--primary"
            type="button"
            onClick={onConfirm}
          >
            Change category
          </button>
        </div>
      </section>
    </div>
  );
}
