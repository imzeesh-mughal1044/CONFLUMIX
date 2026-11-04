"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PublicShell } from "@/components/public/public-shell";
import { readStoredListings } from "@/services/product-listings";
import { readAuthSession } from "@/lib/auth";
import {
  attributesForSubcategory,
  categoryAdditionalAttributes,
  parentAttributeTemplates,
} from "@/data/product-attribute-templates";
import { productTaxonomy } from "@/data/product-taxonomy";
import {
  configuredSubcategoryCount,
  emptySellerSetup,
  readSellerSetup,
  saveSellerSetup,
} from "@/services/seller-setup";
import type { ProductCategory } from "@/types/products";
import type {
  AttributeDefinition,
  AttributeType,
  CustomCategory,
  SellerSetup,
} from "@/types/seller-setup";

const colors = [
  "Black",
  "White",
  "Grey",
  "Silver",
  "Red",
  "Maroon",
  "Orange",
  "Yellow",
  "Gold",
  "Green",
  "Olive",
  "Lime",
  "Teal",
  "Blue",
  "Navy",
  "Sky Blue",
  "Purple",
  "Violet",
  "Pink",
  "Rose",
  "Brown",
  "Beige",
  "Cream",
  "Tan",
  "Khaki",
  "Bronze",
  "Copper",
  "Transparent",
  "Multicolor",
  "Other",
];

export function CategoryConfigurationPage() {
  const router = useRouter();
  const [setup, setSetup] = useState<SellerSetup>(emptySellerSetup);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] =
    useState<ProductCategory>("Mobiles & Tablets");
  const [customSelected, setCustomSelected] = useState<string>();
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [dialog, setDialog] = useState<
    "category" | "subcategory" | "attribute" | null
  >(null);
  const [editingAttribute,setEditingAttribute]=useState<AttributeDefinition|null>(null);
  useEffect(() => {
    let active = true;
    void readAuthSession().then((session) => {
      if (!active) return;
      if (!session) { router.replace("/auth/login?next=%2Fdashboard%2Fseller-center%2Fnew-products%2Fcategories"); return; }
      const value = readSellerSetup();
      setSetup({
        ...emptySellerSetup,
        ...value,
        selectedAttributes: value.selectedAttributes ?? {},
        categoryCustomAttributes: value.categoryCustomAttributes ?? {},
      });
      setSelected(value.productCategories[0] ?? "Mobiles & Tablets");
      setReady(true);
    });
    return () => { active = false; };
  }, [router]);
  const visible = useMemo(
    () =>
      productTaxonomy.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );
  const enabled = setup.productCategories.includes(selected);
  const selectedSubs = useMemo(
    () => setup.productSubcategories[selected] ?? [],
    [setup.productSubcategories, selected],
  );
  const chosen = setup.selectedAttributes[selected] ?? [];
  const subcategorySources = useMemo(() => {
    const map = new Map<string, string[]>();
    selectedSubs.forEach((sub) =>
      (
        setup.customSubcategories
          .find((item) => item.parentId === selected && item.name === sub)
          ?.attributes.map((attribute) => attribute.name) ??
        attributesForSubcategory(selected, sub)
      ).forEach((attribute) =>
        map.set(attribute, [...(map.get(attribute) ?? []), sub]),
      ),
    );
    return map;
  }, [selected, selectedSubs, setup.customSubcategories]);
  const activeCustom = setup.customCategories.find(
    (item) => item.id === customSelected,
  );
  const customSubs = setup.customSubcategories.filter(
    (item) => item.parentId === customSelected,
  );
  const optionalAttributes = Array.from(
    new Set([
      ...categoryAdditionalAttributes[selected],
      ...setup.customSubcategories
        .filter((item) => item.parentId === selected)
        .flatMap((item) => item.attributes.map((attribute) => attribute.name)),
      ...(setup.categoryCustomAttributes[selected]??[]).map((attribute)=>attribute.name),
    ]),
  );
  function update(next: SellerSetup) {
    setSetup(next);
    setError("");
  }
  function toggleParent() {
    if (enabled)
      update({
        ...setup,
        productCategories: setup.productCategories.filter(
          (item) => item !== selected,
        ),
        productSubcategories: { ...setup.productSubcategories, [selected]: [] },
        selectedAttributes: { ...setup.selectedAttributes, [selected]: [] },
      });
    else
      update({
        ...setup,
        productCategories: [...setup.productCategories, selected],
      });
  }
  function toggleAttribute(name: string) {
    const current = setup.selectedAttributes[selected] ?? [];
    update({
      ...setup,
      selectedAttributes: {
        ...setup.selectedAttributes,
        [selected]: current.includes(name)
          ? current.filter((item) => item !== name)
          : [...current, name],
      },
    });
  }
  function toggleSub(sub: string) {
    if (!enabled) return;
    const removing = selectedSubs.includes(sub);
    const nextSubs = removing
      ? selectedSubs.filter((item) => item !== sub)
      : [...selectedSubs, sub];
    let nextAttributes = [...chosen];
    if (!removing)
      nextAttributes = Array.from(
        new Set([
          ...nextAttributes,
          ...attributesForSubcategory(selected, sub),
        ]),
      );
    update({
      ...setup,
      productSubcategories: {
        ...setup.productSubcategories,
        [selected]: nextSubs,
      },
      selectedAttributes: {
        ...setup.selectedAttributes,
        [selected]: nextAttributes,
      },
    });
  }
  function toggleCustomSub(item: CustomCategory) {
    if (!enabled) return;
    const removing = selectedSubs.includes(item.name);
    const nextSubs = removing
      ? selectedSubs.filter((name) => name !== item.name)
      : [...selectedSubs, item.name];
    const nextAttributes = removing
      ? chosen
      : Array.from(
          new Set([
            ...chosen,
            ...item.attributes.map((attribute) => attribute.name),
          ]),
        );
    update({
      ...setup,
      productSubcategories: {
        ...setup.productSubcategories,
        [selected]: nextSubs,
      },
      selectedAttributes: {
        ...setup.selectedAttributes,
        [selected]: nextAttributes,
      },
    });
  }
  function save() {
    if (!setup.productCategories.length && !setup.customCategories.length) {
      setError("Enable at least one parent or custom category before saving.");
      return;
    }
    const next = { ...setup, newProductsEnabled: true };
    saveSellerSetup(next);
    setSetup(next);
    setNotice("Category and attribute configuration saved.");
    router.push("/dashboard/new-products");
  }
  function addCustom(item: CustomCategory) {
    const key = item.parentId ? "customSubcategories" : "customCategories";
    setSetup((current) => ({ ...current, [key]: [...current[key], item] }));
    if (!item.parentId) setCustomSelected(item.id);
    setDialog(null);
  }
  function removeCustom(id: string) {
    if (
      !window.confirm(
        "Delete this custom category and its custom subcategories?",
      )
    )
      return;
    update({
      ...setup,
      customCategories: setup.customCategories.filter((item) => item.id !== id),
      customSubcategories: setup.customSubcategories.filter(
        (item) => item.parentId !== id,
      ),
    });
    if (customSelected === id) setCustomSelected(undefined);
  }
  function removeCustomSubcategory(id: string) {
    update({
      ...setup,
      customSubcategories: setup.customSubcategories.filter(
        (item) => item.id !== id,
      ),
    });
  }
  function addAttribute(item: AttributeDefinition) {
    if(activeCustom)update({...setup,customCategories:setup.customCategories.map((category)=>category.id===activeCustom.id?{...category,attributes:editingAttribute?category.attributes.map((attribute)=>attribute.id===editingAttribute.id?item:attribute):[...category.attributes,item]}:category)});
    else {const current=setup.categoryCustomAttributes[selected]??[],selectedNames=(setup.selectedAttributes[selected]??[]).filter((name)=>name!==editingAttribute?.name);update({...setup,categoryCustomAttributes:{...setup.categoryCustomAttributes,[selected]:editingAttribute?current.map((attribute)=>attribute.id===editingAttribute.id?item:attribute):[...current,item]},selectedAttributes:{...setup.selectedAttributes,[selected]:Array.from(new Set([...selectedNames,item.name]))}})}
    setEditingAttribute(null);
    setDialog(null);
  }
  function removeCategoryAttribute(attribute:AttributeDefinition){const used=readStoredListings().some((listing)=>listing.category===selected&&Object.prototype.hasOwnProperty.call(listing.attributes,attribute.name));if(used){setError(`“${attribute.name}” is used by an existing listing. It remains available to protect saved product data.`);return}if(!window.confirm(`Remove “${attribute.name}” from future ${selected} listing forms?`))return;update({...setup,categoryCustomAttributes:{...setup.categoryCustomAttributes,[selected]:(setup.categoryCustomAttributes[selected]??[]).filter((item)=>item.id!==attribute.id)},selectedAttributes:{...setup.selectedAttributes,[selected]:(setup.selectedAttributes[selected]??[]).filter((name)=>name!==attribute.name)}})}
  if (!ready)
    return <div className="route-loading">Loading category configuration…</div>;
  return (
    <PublicShell>
      <div className="category-config-page">
        <div className="page-container">
          <nav className="seller-back">
            <Link href="/dashboard/seller-center/setup">
              ← Seller Center Setup
            </Link>
          </nav>
          <header className="category-config-hero">
            <div>
              <p className="section-kicker">New Product Seller Center</p>
              <h1>New Product Categories &amp; Attributes</h1>
              <p>
                Enable a parent, add optional subcategories, then select the
                exact fields your future listings should use.
              </p>
            </div>
            <div className="category-metrics">
              <span>
                <strong>
                  {setup.productCategories.length +
                    setup.customCategories.length}
                </strong>
                Parents
              </span>
              <span>
                <strong>
                  {configuredSubcategoryCount(setup) +
                    setup.customSubcategories.length}
                </strong>
                Subcategories
              </span>
            </div>
          </header>
          <div className="category-config-layout">
            <aside className="category-selector">
              <label>
                Search categories
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search 23 categories"
                />
              </label>
              <div>
                {visible.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    className={
                      !customSelected && selected === item.name
                        ? "is-selected"
                        : ""
                    }
                    onClick={() => {
                      setSelected(item.name);
                      setCustomSelected(undefined);
                    }}
                  >
                    <input
                      tabIndex={-1}
                      type="checkbox"
                      checked={setup.productCategories.includes(item.name)}
                      readOnly
                    />
                    <span>{item.name}</span>
                    <small>{item.subcategories.length} subcategories</small>
                  </button>
                ))}
                {setup.customCategories.map((item) => (
                  <article
                    className={
                      customSelected === item.id
                        ? "custom-category-item is-selected"
                        : "custom-category-item"
                    }
                    key={item.id}
                  >
                    <button
                      type="button"
                      onClick={() => setCustomSelected(item.id)}
                    >
                      <span>{item.name}</span>
                      <small>
                        Custom · {item.attributes.length} attributes
                      </small>
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${item.name}`}
                      onClick={() => removeCustom(item.id)}
                    >
                      ×
                    </button>
                  </article>
                ))}
              </div>
              <button
                className="button button--secondary"
                type="button"
                onClick={() => setDialog("category")}
              >
                Add custom category
              </button>
            </aside>
            <main className="attribute-config">
              {activeCustom ? (
                <CustomCategoryEditor
                  category={activeCustom}
                  subcategories={customSubs}
                  onAddSubcategory={() => setDialog("subcategory")}
                  onAddAttribute={() => setDialog("attribute")}
                />
              ) : (
                <>
                  <section>
                    <div className="attribute-config__top">
                      <div>
                        <p className="section-kicker">
                          Selected catalogue category
                        </p>
                        <h2>{selected}</h2>
                      </div>
                      <label className="enable-switch">
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={toggleParent}
                        />
                        <span>{enabled ? "Enabled" : "Enable category"}</span>
                      </label>
                    </div>
                    <p className="configuration-hint">
                      Enabling the category adds only its parent attributes.
                      Subcategory fields appear after their checkbox is
                      selected.
                    </p>
                    <h3>Optional subcategories</h3>
                    <div className="subcategory-grid">
                      {productTaxonomy
                        .find((item) => item.name === selected)
                        ?.subcategories.map((sub) => (
                          <label key={sub}>
                            <input
                              type="checkbox"
                              disabled={!enabled}
                              checked={selectedSubs.includes(sub)}
                              onChange={() => toggleSub(sub)}
                            />
                            <span>{sub}</span>
                          </label>
                        ))}
                      {setup.customSubcategories
                        .filter((item) => item.parentId === selected)
                        .map((item) => (
                          <label className="custom-subcategory" key={item.id}>
                            <input
                              type="checkbox"
                              disabled={!enabled}
                              checked={selectedSubs.includes(item.name)}
                              onChange={() => toggleCustomSub(item)}
                            />
                            <span>
                              {item.name} <small>Custom</small>
                            </span>
                            <button
                              type="button"
                              aria-label={`Delete ${item.name}`}
                              onClick={() => removeCustomSubcategory(item.id)}
                            >
                              ×
                            </button>
                          </label>
                        ))}
                    </div>
                    <button
                      className="text-action"
                      type="button"
                      disabled={!enabled}
                      onClick={() => setDialog("subcategory")}
                    >
                      + Add custom subcategory
                    </button>
                  </section>
                  <section>
                    <div className="attribute-config__top">
                      <div>
                        <p className="section-kicker">Interactive attributes</p>
                        <h2>Build the listing form</h2>
                      </div>
                      <span className="template-badge">
                        {parentAttributeTemplates[selected].length +
                          chosen.length}{" "}
                        fields
                      </span>
                    </div>
                    {!enabled ? (
                      <div className="listing-empty">
                        Enable this category to start building its listing
                        fields.
                      </div>
                    ) : (
                      <div className="attribute-builder">
                        <div>
                          <h3>Available optional attributes</h3>
                          <p>
                            Select any field manually. Teal fields were chosen
                            by you; orange fields were added through a selected
                            subcategory.
                          </p>
                          <div className="attribute-choice-list">
                            {optionalAttributes.map((name) => {
                              const active = chosen.includes(name);
                              const inherited = subcategorySources.has(name);
                              return (
                                <button
                                  key={name}
                                  type="button"
                                  aria-pressed={active}
                                  className={
                                    active
                                      ? inherited
                                        ? "is-subcategory"
                                        : "is-manual"
                                      : ""
                                  }
                                  onClick={() => toggleAttribute(name)}
                                >
                                  <span>{name}</span>
                                  {active && (
                                    <small>
                                      {inherited
                                        ? subcategorySources
                                            .get(name)
                                            ?.join(", ")
                                        : "Manually selected"}
                                    </small>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                          <div className="custom-attribute-manager">
                            <div><h3>Custom attributes</h3><p>Add fields used only by your store’s {selected} listings.</p></div>
                            <button className="button button--secondary" type="button" onClick={()=>{setEditingAttribute(null);setDialog("attribute")}}>Add custom attribute</button>
                            {(setup.categoryCustomAttributes[selected]??[]).map((attribute)=><article key={attribute.id}><div><strong>{attribute.name}</strong><span>{attribute.type}{attribute.required?" · Required":""}</span></div><div><button type="button" onClick={()=>{setEditingAttribute(attribute);setDialog("attribute")}}>Edit</button><button type="button" onClick={()=>removeCategoryAttribute(attribute)}>Remove</button></div></article>)}
                          </div>
                        </div>
                        <div className="live-form-preview">
                          <h3>Current listing fields</h3>
                          <p>
                            Parent fields are fixed. Optional fields can be
                            removed from the selection panel.
                          </p>
                          {parentAttributeTemplates[selected].map((name) => (
                            <PreviewField
                              key={`parent-${name}`}
                              name={name}
                              source="Parent"
                            />
                          ))}
                          {chosen.map((name) => (
                            <PreviewField
                              key={name}
                              name={name}
                              source={
                                subcategorySources.has(name)
                                  ? "Subcategory"
                                  : "Selected"
                              }
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </section>
                </>
              )}
            </main>
          </div>
          {error && (
            <p className="config-error" role="alert">
              {error}
            </p>
          )}
          <div className="configuration-actions">
            <Link
              className="button button--secondary"
              href="/dashboard/seller-center/setup"
            >
              Cancel
            </Link>
            <button
              className="button button--primary"
              type="button"
              onClick={save}
            >
              Save configuration
            </button>
          </div>
          {dialog === "category" && (
            <CategoryDialog
              title="Add custom parent category"
              onClose={() => setDialog(null)}
              onSave={addCustom}
            />
          )}{" "}
          {dialog === "subcategory" && (
            <CategoryDialog
              title="Add custom subcategory"
              parentId={activeCustom?.id ?? selected}
              onClose={() => setDialog(null)}
              onSave={addCustom}
            />
          )}{" "}
          {dialog === "attribute" && (activeCustom || enabled) && (
            <AttributeDialog
              initial={editingAttribute}
              existingNames={activeCustom?activeCustom.attributes.filter((item)=>item.id!==editingAttribute?.id).map((item)=>item.name):(setup.categoryCustomAttributes[selected]??[]).filter((item)=>item.id!==editingAttribute?.id).map((item)=>item.name)}
              onClose={() => setDialog(null)}
              onSave={addAttribute}
            />
          )}{" "}
          {notice && (
            <div className="product-toast" role="status">
              {notice}
            </div>
          )}
        </div>
      </div>
    </PublicShell>
  );
}

function PreviewField({
  name,
  source,
}: {
  name: string;
  source: "Parent" | "Subcategory" | "Selected";
}) {
  const lower = name.toLowerCase();
  let control: React.ReactNode = (
    <input disabled placeholder={`Enter ${name.toLowerCase()}`} />
  );
  if (lower.includes("color") || lower.includes("colour"))
    control = (
      <select disabled>
        <option>Select a colour</option>
        {colors.map((color) => (
          <option key={color}>{color}</option>
        ))}
      </select>
    );
  else if (
    /required|safe|support|available|assembly|resistance|wireless/.test(lower)
  )
    control = (
      <select disabled>
        <option>Select an option</option>
        <option>Yes</option>
        <option>No</option>
        <option>Other</option>
      </select>
    );
  else if (/date|expiry/.test(lower)) control = <input type="date" disabled />;
  else if (
    /number|capacity|weight|size|voltage|wattage|ram|storage/.test(lower)
  )
    control = (
      <input inputMode="decimal" disabled placeholder="Enter a value" />
    );
  return (
    <label className={`preview-field source-${source.toLowerCase()}`}>
      <span>
        {name}
        <small>{source}</small>
      </span>
      {control}
    </label>
  );
}
function CustomCategoryEditor({
  category,
  subcategories,
  onAddSubcategory,
  onAddAttribute,
}: {
  category: CustomCategory;
  subcategories: CustomCategory[];
  onAddSubcategory: () => void;
  onAddAttribute: () => void;
}) {
  return (
    <>
      <section>
        <p className="section-kicker">Custom parent category</p>
        <h2>{category.name}</h2>
        <p>{category.description || "No description supplied."}</p>
        <div className="custom-editor-actions">
          <button
            className="button button--secondary"
            type="button"
            onClick={onAddSubcategory}
          >
            Add custom subcategory
          </button>
          <button
            className="button button--secondary"
            type="button"
            onClick={onAddAttribute}
          >
            Add custom attribute
          </button>
        </div>
        {subcategories.length > 0 && (
          <div className="custom-list">
            {subcategories.map((item) => (
              <article key={item.id}>
                <strong>{item.name}</strong>
                <span>{item.attributes.length} additional attributes</span>
              </article>
            ))}
          </div>
        )}
      </section>
      <section>
        <p className="section-kicker">Reusable template</p>
        <h2>Current listing fields</h2>
        {category.attributes.length ? (
          <div className="live-form-preview">
            {category.attributes.map((item) => (
              <PreviewField key={item.id} name={item.name} source="Parent" />
            ))}
          </div>
        ) : (
          <p className="listing-empty">
            Add at least one custom attribute to build this form.
          </p>
        )}
      </section>
    </>
  );
}
function CategoryDialog({
  title,
  parentId,
  onClose,
  onSave,
}: {
  title: string;
  parentId?: string;
  onClose: () => void;
  onSave: (item: CustomCategory) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [attributes, setAttributes] = useState("");
  const [error, setError] = useState("");
  function save() {
    if (!name.trim()) {
      setError("Enter a name.");
      return;
    }
    onSave({
      id: `custom-${crypto.randomUUID()}`,
      name: name.trim(),
      description,
      parentId,
      attributes: attributes
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
        .map((value, index) => ({
          id: crypto.randomUUID(),
          name: value,
          type: "text" as const,
          required: false,
          allowedValues: [],
          order: index,
        })),
    });
  }
  return (
    <div
      className="listing-preview-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="custom-title"
    >
      <section className="custom-dialog">
        <button type="button" onClick={onClose} aria-label="Close">
          ×
        </button>
        <p className="section-kicker">Reusable configuration</p>
        <h2 id="custom-title">{title}</h2>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          Description <em>Optional</em>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <label>
          Attributes <em>Optional</em>
          <textarea
            rows={3}
            value={attributes}
            onChange={(event) => setAttributes(event.target.value)}
            placeholder="Material, Finish, Compatibility"
          />
          <small>Separate reusable attribute names with commas.</small>
        </label>
        {error && <p className="field-error">{error}</p>}
        <div>
          <button
            className="button button--secondary"
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="button button--primary"
            type="button"
            onClick={save}
          >
            Add
          </button>
        </div>
      </section>
    </div>
  );
}
function AttributeDialog({
  initial,
  existingNames,
  onClose,
  onSave,
}: {
  initial:AttributeDefinition|null;
  existingNames:string[];
  onClose: () => void;
  onSave: (item: AttributeDefinition) => void;
}) {
  const [name, setName] = useState(initial?.name??"");
  const [type, setType] = useState<AttributeType>(initial?.type??"text");
  const [required, setRequired] = useState(initial?.required??false);
  const [values, setValues] = useState(initial?.allowedValues.join(", ")??"");
  const [error,setError]=useState("");
  function saveAttribute(){const clean=name.trim(),allowed=values.split(",").map((value)=>value.trim()).filter(Boolean);if(!clean){setError("Enter an attribute name.");return}if(existingNames.some((value)=>value.toLowerCase()===clean.toLowerCase())){setError("Use a unique attribute name for this category.");return}if((type==="single-choice"||type==="multiple-choice")&&allowed.length<2){setError("Add at least two distinct options for a selection field.");return}if(new Set(allowed.map((value)=>value.toLowerCase())).size!==allowed.length){setError("Selection options cannot be duplicated.");return}onSave({id:initial?.id??crypto.randomUUID(),name:clean,type,required,allowedValues:allowed,order:initial?.order??0})}
  return (
    <div
      className="listing-preview-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="attribute-title"
    >
      <section className="custom-dialog">
        <button type="button" onClick={onClose} aria-label="Close">
          ×
        </button>
        <h2 id="attribute-title">{initial?"Edit custom attribute":"Add custom attribute"}</h2>
        <label>
          Attribute name
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          Input type
          <select
            value={type}
            onChange={(e) => setType(e.target.value as AttributeType)}
          >
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="boolean">Yes / No</option>
            <option value="single-choice">Dropdown</option>
            <option value="multiple-choice">Multiple choice</option>
            <option value="date">Date</option>
          </select>
        </label>
        {(type === "single-choice" || type === "multiple-choice") && (
          <label>
            Allowed values
            <textarea
              rows={3}
              value={values}
              onChange={(e) => setValues(e.target.value)}
              placeholder="Separate options with commas"
            />
          </label>
        )}
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={required}
            onChange={(e) => setRequired(e.target.checked)}
          />
          Required on listings
        </label>
        {error&&<p className="field-error" role="alert">{error}</p>}
        <div>
          <button
            className="button button--secondary"
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="button button--primary"
            type="button"
            onClick={saveAttribute}
          >
            {initial?"Save changes":"Add attribute"}
          </button>
        </div>
      </section>
    </div>
  );
}
