"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { products } from "@/data/products";
import {
  draftStorageKey,
  emptyListing,
  listingFromProduct,
  makeLocalId,
  currentSeller,
  readStoredListings,
  saveStoredListing,
  validateListing,
} from "@/services/product-listings";
import type {
  ListingErrors,
  ListingFormData,
  ListingImage,
} from "@/types/product-listing";
import type { Product } from "@/types/products";
import { PublicShell } from "@/components/public/public-shell";
import { Icon } from "@/components/public/icons";
import {
  newProductListingEligibility,
  readSellerSetup,
} from "@/services/seller-setup";
import type { SellerSetup } from "@/types/seller-setup";
import { parentAttributeTemplates } from "@/data/product-attribute-templates";
import { ShopSectionSelector } from "@/components/seller/shop-section-selector";
import { storeIdForName } from "@/services/storefront";

const money = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 0,
});
const imageTypes = ["image/jpeg", "image/png", "image/webp"];
const maxImageBytes = 5 * 1024 * 1024;

export function ProductListingForm({
  mode,
  product,
  identifier,
}: {
  mode: "create" | "edit";
  product?: Product;
  identifier?: string;
}) {
  const router = useRouter();
  const [data, setData] = useState<ListingFormData>(() =>
    product ? listingFromProduct(product) : emptyListing,
  );
  const [initial, setInitial] = useState("");
  const [errors, setErrors] = useState<ListingErrors>({});
  const [imageError, setImageError] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [ready, setReady] = useState(false);
  const [missing, setMissing] = useState(false);
  const [sellerSetup, setSellerSetup] = useState<SellerSetup | null>(null);
  const [tagInput, setTagInput] = useState("");
  const summaryRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const currentSetup = readSellerSetup();
      setSellerSetup(currentSetup);
      let loaded = product ? listingFromProduct(product) : emptyListing;
      if (mode === "edit") {
        const stored = readStoredListings().find(
          (item) => item.id === (product?.id ?? identifier),
        );
        if (stored) loaded = stored;
        else if (!product) {
          setMissing(true);
          setReady(true);
          return;
        }
      }
      if (mode === "create") {
        try {
          const draft = localStorage.getItem(draftStorageKey);
          if (draft)
            loaded = { ...emptyListing, ...JSON.parse(draft), images: [] };
        } catch {}
      }
      setData(loaded);
      setTagInput("");
      setInitial(JSON.stringify(loaded));
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [identifier, mode, product]);

  const dirty = ready && JSON.stringify(data) !== initial;
  const eligibility = sellerSetup ? newProductListingEligibility(sellerSetup) : null;
  const productCategories = useMemo(() => {
    const enabled = sellerSetup?.productCategories ?? [];
    return data.category && !enabled.includes(data.category) ? [data.category, ...enabled] : enabled;
  }, [data.category, sellerSetup]);
  const categoryNoLongerEnabled = Boolean(data.category && sellerSetup && !sellerSetup.productCategories.includes(data.category));
  const storeId = storeIdForName(sellerSetup?.storeName ?? "");
  const configuredFields = useMemo(
    () =>
      data.category
        ? Array.from(
            new Set([
              ...(parentAttributeTemplates[data.category] ?? []),
              ...(sellerSetup?.selectedAttributes[data.category] ?? []),
            ]),
          )
        : [],
    [data.category, sellerSetup],
  );
  const configuredSubcategories = data.category
    ? (sellerSetup?.productSubcategories[data.category] ?? [])
    : [];
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty) event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const completeness = useMemo(() => {
    const checks = [
      data.title.trim(),
      data.category,
      data.description.trim(),
      Number(data.price) > 0,
      data.quantity !== "",
      data.images.length > 0,
      data.category
        ? configuredFields.every((label) => data.attributes[label]?.trim())
        : false,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [configuredFields, data]);

  function update<K extends keyof ListingFormData>(
    key: K,
    value: ListingFormData[K],
  ) {
    setData((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[String(key)];
      return next;
    });
  }
  function changeCategory(value: ListingFormData["category"]) {
    setData((current) => ({
      ...current,
      category: value,
      subcategory: "",
      attributes: value
        ? Object.fromEntries(
            [
              ...parentAttributeTemplates[value],
              ...(sellerSetup?.selectedAttributes[value] ?? []),
            ]
              .filter((label) => current.attributes[label])
              .map((label) => [label, current.attributes[label]]),
          )
        : {},
    }));
    setErrors({});
  }
  function addTags(values: string[]) {
    const candidates = values.map((tag) => tag.trim()).filter(Boolean);
    if (!candidates.length) return;
    const invalid = candidates.find(
      (tag) =>
        !/^[A-Za-z0-9][A-Za-z0-9 _-]{0,19}$/.test(tag) ||
        /^\d+\.\d+$/.test(tag),
    );
    if (invalid) {
      setErrors((current) => ({ ...current, tags: `“${invalid}” is not a valid keyword.` }));
      return;
    }
    const next = [...data.tags];
    candidates.forEach((tag) => {
      if (!next.some((item) => item.toLowerCase() === tag.toLowerCase())) next.push(tag);
    });
    if (next.length > 20) {
      setErrors((current) => ({ ...current, tags: "Use no more than 20 keywords." }));
      return;
    }
    update("tags", next);
  }
  function changeTagInput(value: string) {
    if (!value.includes(",")) {
      setTagInput(value);
      return;
    }
    const parts = value.split(",");
    addTags(parts.slice(0, -1));
    setTagInput(parts.at(-1) ?? "");
  }
  function commitTagInput() {
    if (!tagInput.trim()) return;
    addTags([tagInput]);
    setTagInput("");
  }
  function removeTag(tag: string) {
    update("tags", data.tags.filter((item) => item !== tag));
  }
  async function chooseImages(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    setImageError("");
    if (data.images.length + files.length > 20) {
      setImageError("A listing can contain up to 20 photos.");
      event.target.value = "";
      return;
    }
    const invalid = files.find(
      (file) => !imageTypes.includes(file.type) || file.size > maxImageBytes,
    );
    if (invalid) {
      setImageError(
        `${invalid.name} must be JPEG, PNG, or WebP and no larger than 5 MB.`,
      );
      event.target.value = "";
      return;
    }
    const next: ListingImage[] = await Promise.all(files.map(async(file) => ({
      id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
      src: await readDataUrl(file),
      name: file.name,
      local: false,
    })));
    update("images", [...data.images, ...next]);
    event.target.value = "";
  }
  function removeImage(image: ListingImage) {
    if (image.local) URL.revokeObjectURL(image.src);
    update(
      "images",
      data.images.filter((item) => item.id !== image.id),
    );
  }
  function makePrimary(index: number) {
    const next = [...data.images];
    const [image] = next.splice(index, 1);
    next.unshift(image);
    update("images", next);
  }
  function addVariant() {
    update("variants", [
      ...data.variants,
      {
        id: crypto.randomUUID(),
        label: "",
        price: Number(data.price) || 0,
        stock: Number(data.quantity) || 0,
      },
    ]);
  }
  function updateVariant(
    index: number,
    field: "label" | "price" | "stock",
    value: string,
  ) {
    update(
      "variants",
      data.variants.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [field]: field === "label" ? value : Number(value) }
          : item,
      ),
    );
  }
  function removeVariant(index: number) {
    update(
      "variants",
      data.variants.filter((_, itemIndex) => itemIndex !== index),
    );
  }
  function saveDraft() {
    const draft = {
      ...data,
      storeId,
      id: data.id ?? makeLocalId(),
      status: "draft" as const,
      images: data.images.filter((image) => !image.local),
    };
    try {
      if (mode === "create")
        localStorage.setItem(draftStorageKey, JSON.stringify(draft));
      else saveStoredListing(draft);
      setData(draft);
      setInitial(JSON.stringify(draft));
      setNotice(
        "Draft saved successfully.",
      );
    } catch {
      setNotice("The draft could not be saved. Please try again.");
    }
  }
  function publish(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validateListing(data);
    if (categoryNoLongerEnabled) nextErrors.category = "This listing's category is no longer enabled. Enable it in Seller Center or choose another configured category.";
    configuredFields.forEach((label) => {
      if (!data.attributes[label]?.trim())
        nextErrors[`attribute-${label}`] = `Enter ${label.toLowerCase()}.`;
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      window.setTimeout(() => summaryRef.current?.focus(), 0);
      return;
    }
    const saved = {
      ...data,
      storeId,
      id: data.id ?? makeLocalId(),
      status: "published" as const,
      images: data.images.filter((image) => !image.local),
    };
    try {
      saveStoredListing(saved);
      if (mode === "create") localStorage.removeItem(draftStorageKey);
      setData(saved);
      setInitial(JSON.stringify(saved));
      setNotice(
        mode === "create"
          ? "Listing published successfully."
          : "Listing changes saved.",
      );
    } catch {
      setNotice("The listing could not be saved. Please try again.");
    }
  }
  function cancel() {
    if (
      !dirty ||
      window.confirm(
        "Discard unsaved changes? Saved drafts will remain available.",
      )
    )
      router.push("/new-products");
  }

  if (!ready) return <div className="route-loading">Loading listing form…</div>;
  if (missing) return <ListingNotFound />;
  if (!sellerSetup || !eligibility?.eligible)
    return (
      <PublicShell>
        <div className="product-not-found">
          <p className="section-kicker">Seller setup required</p>
          <h1>{eligibility?.profileComplete ? "Configure your product categories." : "Complete your seller profile."}</h1>
          <p>{eligibility?.profileComplete ? "Choose at least one New Product category before creating or editing a listing." : "Save your required seller and store information before creating or editing a listing."}</p>
          {eligibility && <ul className="seller-required-list">{eligibility.missing.slice(0, 8).map((item) => <li key={item}>{item}</li>)}</ul>}
          <div className="seller-required-actions">
            {!eligibility?.profileComplete && <Link
              className="button button--primary"
              href="/dashboard/seller-center/setup"
            >
              Set Up Seller Profile
            </Link>}
            {eligibility?.profileComplete && <Link
              className="button button--primary"
              href="/dashboard/seller-center/new-products/categories"
            >
              Configure categories
            </Link>}
          </div>
        </div>
      </PublicShell>
    );
  return (
    <PublicShell>
      <div className="seller-page">
        <div className="page-container">
          <nav className="product-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <Icon name="chevron" size={14} />
            <Link href="/new-products">New Products</Link>
            <Icon name="chevron" size={14} />
            <span>Sell</span>
            <Icon name="chevron" size={14} />
            <span aria-current="page">
              {mode === "create" ? "Create Listing" : "Edit Listing"}
            </span>
          </nav>
          <header className="seller-heading">
            <div>
              <p className="section-kicker">
                Seller workflow
              </p>
              <h1>
                {mode === "create"
                  ? "Create a New Product Listing"
                  : `Edit ${product?.title}`}
              </h1>
              <p>
                Build a clear, useful product listing for your customers.
              </p>
            </div>
            <button
              className="button button--secondary"
              type="button"
              onClick={cancel}
            >
              Cancel
            </button>
          </header>
          <div className="seller-layout">
            <form className="listing-form" noValidate onSubmit={publish}>
              {categoryNoLongerEnabled && <div className="configuration-hint" role="status">This listing keeps its existing category and attributes, but changes cannot be saved until the category is enabled again or replaced.</div>}
              {Object.keys(errors).length > 0 && (
                <div
                  className="listing-error-summary"
                  ref={summaryRef}
                  tabIndex={-1}
                  role="alert"
                >
                  <h2>
                    Review {Object.keys(errors).length} issue
                    {Object.keys(errors).length === 1 ? "" : "s"} before
                    publishing
                  </h2>
                  <ul>
                    {Object.entries(errors)
                      .slice(0, 8)
                      .map(([key, message]) => (
                        <li key={key}>
                          <a href={`#${key}`}>{message}</a>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
              <FormSection
                number="01"
                title="Basic information"
                description="Give buyers the essential product details."
              >
                <Field label="Product title" id="title" error={errors.title}>
                  <input
                    id="title"
                    value={data.title}
                    maxLength={100}
                    onChange={(event) => update("title", event.target.value)}
                    aria-invalid={Boolean(errors.title)}
                    aria-describedby={
                      errors.title ? "title-error" : "title-help"
                    }
                  />
                  <small id="title-help">
                    Use the product name buyers would search for.{" "}
                    {data.title.length}/100
                  </small>
                </Field>
                <Field label="Category" id="category" error={errors.category}>
                  <select
                    id="category"
                    value={data.category}
                    onChange={(event) =>
                      changeCategory(
                        event.target.value as ListingFormData["category"],
                      )
                    }
                    aria-invalid={Boolean(errors.category)}
                  >
                    <option value="">Choose a category</option>
                    {productCategories.map((category) => (
                      <option key={category} disabled={!sellerSetup.productCategories.includes(category)}>{category}{!sellerSetup.productCategories.includes(category) ? " (no longer enabled)" : ""}</option>
                    ))}
                  </select>
                </Field>
                {data.category && configuredSubcategories.length > 0 && (
                  <Field label="Subcategory" id="subcategory">
                    <select
                      id="subcategory"
                      value={data.subcategory}
                      onChange={(event) =>
                        update("subcategory", event.target.value)
                      }
                    >
                      <option value="">No subcategory</option>
                      {configuredSubcategories.map((subcategory) => (
                        <option key={subcategory}>{subcategory}</option>
                      ))}
                    </select>
                  </Field>
                )}
                <Field
                  label="Description"
                  id="description"
                  error={errors.description}
                  wide
                >
                  <textarea
                    id="description"
                    rows={6}
                    value={data.description}
                    onChange={(event) =>
                      update("description", event.target.value)
                    }
                    aria-invalid={Boolean(errors.description)}
                    placeholder="Describe features, included items, compatibility, dimensions, and important limitations."
                  />
                </Field>
                <Field
                  label="Search keywords"
                  id="tags"
                  error={errors.tags}
                  wide
                >
                  {data.tags.length > 0 && (
                    <div className="listing-tag-list" aria-label="Selected search keywords">
                      {data.tags.map((tag) => (
                        <span key={tag}>
                          {tag}
                          <button type="button" aria-label={`Remove ${tag}`} onClick={() => removeTag(tag)}>×</button>
                        </span>
                      ))}
                    </div>
                  )}
                  <input
                    id="tags"
                    value={tagInput}
                    onChange={(event) => changeTagInput(event.target.value)}
                    onBlur={commitTagInput}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        commitTagInput();
                      }
                    }}
                    aria-invalid={Boolean(errors.tags)}
                    placeholder={data.tags.length ? "Add another keyword" : "wireless, headphones, bluetooth"}
                  />
                  <small>
                    {data.tags.length}/20 keywords selected. Type a comma or press Enter to add one.
                    Each keyword must be 1–20 characters and start with a letter or number.
                  </small>
                </Field>
                <Field label="SKU" id="sku">
                  <input
                    id="sku"
                    value={data.sku}
                    maxLength={64}
                    onChange={(event) => update("sku", event.target.value)}
                    placeholder="e.g. HDP-BLK-001"
                  />
                  <small>Your internal stock-keeping code. Customers will not use this to search.</small>
                </Field>
                <ShopSectionSelector storeId={storeId} value={data.sectionId} onChange={(sectionId) => update("sectionId", sectionId)} />
              </FormSection>
              <FormSection
                number="02"
                title="Product images"
                description="Add up to 20 JPEG, PNG, or WebP files, each no larger than 5 MB."
              >
                <div className="image-manager">
                  <input
                    ref={fileRef}
                    className="sr-only"
                    id="images"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={chooseImages}
                  />
                  <button
                    className="image-picker"
                    type="button"
                    onClick={() => fileRef.current?.click()}
                  >
                    <Icon name="plus" />
                    <strong>Select product images</strong>
                    <span>
                      Files remain local previews until a backend upload is
                      implemented.
                    </span>
                  </button>
                  {(imageError || errors.images) && (
                    <p id="images-error" className="field-error" role="alert">
                      {imageError || errors.images}
                    </p>
                  )}
                  {data.images.length > 0 && (
                    <div className="image-preview-grid">
                      {data.images.map((image, index) => (
                        <figure key={image.id}>
                          <div>
                            <Image
                              src={image.src}
                              alt={`${data.title || "Product"} preview ${index + 1}`}
                              fill
                              unoptimized={image.local}
                              sizes="140px"
                            />
                          </div>
                          <figcaption>
                            {index === 0 ? (
                              <strong>Primary image</strong>
                            ) : (
                              <button
                                type="button"
                                onClick={() => makePrimary(index)}
                              >
                                Make primary
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeImage(image)}
                            >
                              Remove
                            </button>
                          </figcaption>
                        </figure>
                      ))}
                    </div>
                  )}
                </div>
              </FormSection>
              <FormSection
                number="03"
                title="Pricing and availability"
                description="Stock status is derived from the available quantity."
              >
                <Field label="Price (PKR)" id="price" error={errors.price}>
                  <input
                    id="price"
                    inputMode="decimal"
                    value={data.price}
                    onChange={(event) => update("price", event.target.value)}
                    placeholder="28500"
                    aria-invalid={Boolean(errors.price)}
                  />
                </Field>
                <Field
                  label="Available quantity"
                  id="quantity"
                  error={errors.quantity}
                >
                  <input
                    id="quantity"
                    inputMode="numeric"
                    value={data.quantity}
                    onChange={(event) => update("quantity", event.target.value)}
                    placeholder="0"
                    aria-invalid={Boolean(errors.quantity)}
                  />
                  <small>
                    {Number(data.quantity) > 0
                      ? "Listing will appear in stock."
                      : "Zero quantity appears out of stock."}
                  </small>
                </Field>
              </FormSection>
              <FormSection
                number="04"
                title="Variations"
                description="Optional: add purchasable options with their own price and quantity."
              >
                <div className="variant-editor">
                  {data.variants.map((variant, index) => (
                    <div key={variant.id} id={`variant-${index}`}>
                      <label>
                        Option name
                        <input
                          value={variant.label}
                          onChange={(event) =>
                            updateVariant(index, "label", event.target.value)
                          }
                          placeholder="Black, 512GB, Large…"
                        />
                      </label>
                      <label>
                        Price
                        <input
                          inputMode="decimal"
                          value={variant.price || ""}
                          onChange={(event) =>
                            updateVariant(index, "price", event.target.value)
                          }
                        />
                      </label>
                      <label>
                        Quantity
                        <input
                          inputMode="numeric"
                          value={variant.stock}
                          onChange={(event) =>
                            updateVariant(index, "stock", event.target.value)
                          }
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                      >
                        Remove
                      </button>
                      {errors[`variant-${index}`] && (
                        <p className="field-error">
                          {errors[`variant-${index}`]}
                        </p>
                      )}
                    </div>
                  ))}
                  <button
                    className="button button--secondary"
                    type="button"
                    onClick={addVariant}
                  >
                    Add variation
                  </button>
                </div>
              </FormSection>
              <FormSection
                number="05"
                title="Product specifications"
                description="These fields also power the product-detail requirement checker."
              >
                {data.category ? (
                  <div className="listing-fields">
                    {configuredFields.map((label) => (
                      <Field
                        key={label}
                        label={label}
                        id={`attribute-${label}`}
                        error={errors[`attribute-${label}`]}
                      >
                        <input
                          id={`attribute-${label}`}
                          value={data.attributes[label] ?? ""}
                          onChange={(event) =>
                            update("attributes", {
                              ...data.attributes,
                              [label]: event.target.value,
                            })
                          }
                          aria-invalid={Boolean(errors[`attribute-${label}`])}
                        />
                      </Field>
                    ))}
                  </div>
                ) : (
                  <p className="listing-empty">
                    Choose a category to see its relevant specifications.
                  </p>
                )}
              </FormSection>
              <FormSection
                number="06"
                title="Delivery and policies"
                description="Optional seller-supplied terms. Do not promise what you cannot provide."
              >
                <Field label="Delivery information" id="delivery" wide>
                  <textarea
                    id="delivery"
                    rows={3}
                    value={data.delivery}
                    onChange={(event) => update("delivery", event.target.value)}
                  />
                </Field>
                <Field label="Cancellation terms" id="cancellation">
                  <textarea
                    id="cancellation"
                    rows={3}
                    value={data.cancellation}
                    onChange={(event) =>
                      update("cancellation", event.target.value)
                    }
                  />
                </Field>
                <Field label="Return terms" id="returns">
                  <textarea
                    id="returns"
                    rows={3}
                    value={data.returns}
                    onChange={(event) => update("returns", event.target.value)}
                  />
                </Field>
              </FormSection>
              <div className="listing-actions">
                {mode === "edit" && identifier && (
                  <Link
                    className="button button--secondary"
                    href={`/new-products/sell/${encodeURIComponent(identifier)}/quality`}
                  >
                    Quality check
                  </Link>
                )}
                <button
                  className="button button--secondary"
                  type="button"
                  onClick={saveDraft}
                >
                  Save draft
                </button>
                <button
                  className="button button--secondary"
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                >
                  Preview listing
                </button>
                <button className="button button--primary" type="submit">
                  {mode === "create" ? "Publish listing" : "Save changes"}
                </button>
              </div>
            </form>
            <aside className="listing-sidebar">
              <div className="completeness">
                <span>Listing completeness</span>
                <strong>{completeness}%</strong>
                <div>
                  <i style={{ width: `${completeness}%` }} />
                </div>
                <p>
                  Publication still checks every required field. This indicator
                  is guidance, not approval.
                </p>
              </div>
              <ListingPreview data={data} />
              <div className="current-seller">
                <span>Seller</span>
                <strong>{sellerSetup.storeName || currentSeller.name}</strong>
                <p>{sellerSetup.locality || currentSeller.locality}</p>
              </div>
            </aside>
          </div>
        </div>
      </div>
      {previewOpen && (
        <PreviewDialog data={data} onClose={() => setPreviewOpen(false)} />
      )}{" "}
      {notice && (
        <div className="product-toast" role="status">
          {notice}
        </div>
      )}
    </PublicShell>
  );
}

function readDataUrl(file:File){return new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(reader.error);reader.readAsDataURL(file)})}

function FormSection({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="listing-section">
      <header>
        <span>{number}</span>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </header>
      <div className="listing-fields">{children}</div>
    </section>
  );
}
function Field({
  label,
  id,
  error,
  wide,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`listing-field ${wide ? "is-wide" : ""}`} htmlFor={id}>
      {label}
      {children}
      {error && (
        <span className="field-error" id={`${id}-error`}>
          {error}
        </span>
      )}
    </label>
  );
}
function ListingPreview({ data }: { data: ListingFormData }) {
  return (
    <article className="listing-preview">
      <div className="listing-preview__image">
        {data.images[0] ? (
          <Image
            src={data.images[0].src}
            alt="Current listing preview"
            fill
            unoptimized={data.images[0].local}
            sizes="280px"
          />
        ) : (
          <span>Image preview</span>
        )}
      </div>
      <div>
        <span>{data.category || "Category"}</span>
        <h2>{data.title || "Your product title"}</h2>
        <strong>
          {Number(data.price) > 0
            ? money.format(Number(data.price))
            : "Price not set"}
        </strong>
        <p>{currentSeller.name}</p>
        <small>
          {Number(data.quantity) > 0
            ? `${data.quantity} in stock`
            : "Out of stock"}
        </small>
      </div>
    </article>
  );
}
function PreviewDialog({
  data,
  onClose,
}: {
  data: ListingFormData;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const escape = (event: KeyboardEvent) =>
      event.key === "Escape" && onClose();
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [onClose]);
  return (
    <div
      className="listing-preview-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-title"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close listing preview"
        >
          <Icon name="close" />
        </button>
        <p className="section-kicker">Buyer view</p>
        <h2 id="preview-title">{data.title || "Untitled product"}</h2>
        <ListingPreview data={data} />
        <p>{data.description || "No description entered yet."}</p>
        {data.category && (
          <dl className="specification-list">
            {Object.keys(data.attributes).map((label) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{data.attributes[label] || "Not provided"}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>
    </div>
  );
}

export function ListingNotFound() {
  return (
    <PublicShell>
      <div className="product-not-found">
        <p className="section-kicker">Listing unavailable</p>
        <h1>We could not find that listing.</h1>
        <p>
          Use a valid product ID or slug to open the listing editor.
        </p>
        <Link className="button button--primary" href="/new-products/browse">
          Browse New Products
        </Link>
      </div>
    </PublicShell>
  );
}

export function findLocalOrFixture(identifier: string) {
  const fixture = products.find(
    (item) => item.id === identifier || item.slug === identifier,
  );
  return fixture;
}
