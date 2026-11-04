import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(new URL("../../apps/web/package.json", import.meta.url));
const { chromium } = require("playwright");
const base = process.env.E2E_BASE_URL ?? "http://127.0.0.1:3000";
const browser = await chromium.launch({ headless: true, executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await context.addInitScript(() => {
  const email = "sections@example.test";
  localStorage.setItem("conflumix.frontend.session", JSON.stringify({ email, fullName: "Section Seller" }));
  const now = new Date().toISOString();
  localStorage.setItem(`conflumix:seller-onboarding:${encodeURIComponent(email)}:v1`, JSON.stringify({ accountEmail: email, intent: "new-products", newProductsStartedAt: now, createdAt: now, updatedAt: now }));
  localStorage.setItem(`conflumix:seller-setup:v2:${encodeURIComponent(email)}`, JSON.stringify({ sellerType: "individual", sellerName: "Section Seller", email, phone: "03001234567", storeName: "Section Test Store", description: "A store for section integration testing.", publicContact: "03001234567", storeAddress: "Test Market", city: "Lahore", locality: "DHA Phase 6", deliveryOptions: ["pickup"], returnPolicy: "Seven days", paymentMethod: "cash-on-delivery", termsAccepted: true, declarationAccepted: true, identityDocumentsSubmitted: true, newProductsEnabled: true, productCategories: ["Electronics & Smart Devices"], productSubcategories: { "Electronics & Smart Devices": [] }, selectedAttributes: { "Electronics & Smart Devices": [] }, categoryCustomAttributes: {}, reuseCategories: [], customCategories: [], customSubcategories: [] }));
});
const page = await context.newPage();
await page.goto(`${base}/dashboard/new-products/sections`);
for (const name of ["New Arrivals", "Accessories", "Best Sellers"]) {
  await page.getByRole("button", { name: "Create Section" }).first().click();
  await page.getByLabel("Section name").fill(name);
  await page.getByRole("button", { name: "Create", exact: true }).click();
}
await page.reload();
await page.getByText("3 of 30 sections", { exact: true }).waitFor();
await page.getByRole("button", { name: "Rename" }).first().click();
await page.getByLabel("Section name").fill("Latest Arrivals");
await page.getByRole("button", { name: "Save name" }).click();
await page.getByText("Latest Arrivals", { exact: true }).waitFor();
await page.getByRole("button", { name: "Move Best Sellers up" }).click();
await page.reload();
const headings = await page.locator(".section-details h2").allInnerTexts();
assert.deepEqual(headings, ["Latest Arrivals", "Best Sellers", "Accessories"]);

await page.goto(`${base}/new-products/sell/new`);
await page.locator("#title").fill("Section Product Draft");
await page.locator("#sectionId").selectOption({ label: "Best Sellers" });
await page.getByRole("button", { name: "Save draft" }).click();
const draft = await page.evaluate(() => JSON.parse(localStorage.getItem("conflumix:new-product-draft:v1") ?? "null"));
assert.equal(draft.title, "Section Product Draft");
assert.ok(draft.sectionId);
assert.equal(draft.storeId, "section-test-store");

await page.locator("#sectionId").selectOption("__create");
await page.getByLabel("Section name").fill("Premium Collection");
await page.getByRole("button", { name: "Create and select" }).click();
assert.equal(await page.locator("#title").inputValue(), "Section Product Draft");
assert.equal(await page.locator("#sectionId option:checked").textContent(), "Premium Collection");

const assignedSection = await page.locator("#sectionId").inputValue();
await page.evaluate(({ assignedSection }) => {
  const records = JSON.parse(localStorage.getItem("conflumix:new-product-listings:v1") ?? "[]");
  records.push({ id: "section-product", storeId: "section-test-store", sectionId: assignedSection, title: "Published Section Product", category: "Electronics & Smart Devices", subcategory: "", description: "Published product for section navigation.", price: "1200", quantity: "4", sku: "SEC-1", tags: [], images: [{ id: "logo", src: "/CONFLUMIX_nav.png", name: "Logo", local: false }], attributes: {}, variants: [], delivery: "", cancellation: "", returns: "", status: "published" });
  localStorage.setItem("conflumix:new-product-listings:v1", JSON.stringify(records));
}, { assignedSection });
await page.goto(`${base}/stores/section-test-store?section=${encodeURIComponent(assignedSection)}`);
await page.getByRole("button", { name: "Premium Collection" }).waitFor();
await page.getByText("Published Section Product", { exact: true }).waitFor();
await page.getByRole("button", { name: "All Products" }).click();

await page.goto(`${base}/dashboard/new-products/sections`);
const premium = page.locator(".sections-list article").filter({ hasText: "Premium Collection" });
await premium.getByRole("button", { name: "Delete" }).click();
await page.getByRole("button", { name: "Delete section" }).click();
const unassigned = await page.evaluate(() => JSON.parse(localStorage.getItem("conflumix:new-product-listings:v1") ?? "[]").find((item) => item.id === "section-product"));
assert.equal(unassigned.sectionId, undefined);
assert.equal(unassigned.status, "published");

await page.evaluate(() => {
  const now = new Date().toISOString();
  const sections = Array.from({ length: 30 }, (_, index) => ({ id: `limit-${index}`, storeId: "section-test-store", name: `Limit Section ${index + 1}`, order: index, createdAt: now, updatedAt: now }));
  sections.push({ id: "other-store", storeId: "another-store", name: "Independent", order: 0, createdAt: now, updatedAt: now });
  localStorage.setItem("conflumix:new-product-shop-sections:v1", JSON.stringify(sections));
});
await page.reload();
await page.getByText("30 of 30 sections", { exact: true }).waitFor();
assert.equal(await page.getByRole("button", { name: "Create Section" }).isDisabled(), true);
assert.equal(await page.getByText("Independent", { exact: true }).count(), 0);

for (const viewport of [{ width: 360, height: 740 }, { width: 390, height: 844 }]) {
  await page.setViewportSize(viewport);
  for (const route of ["/dashboard/new-products/sections", "/new-products/sell/new", "/stores/section-test-store"]) {
    await page.goto(`${base}${route}`);
    await page.waitForLoadState("networkidle");
    const dimensions = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
    assert.ok(dimensions.scroll <= dimensions.client, `${route} overflows at ${viewport.width}px: ${dimensions.scroll}/${dimensions.client}`);
  }
}
await browser.close();
console.log("Shop Sections browser journey passed");
