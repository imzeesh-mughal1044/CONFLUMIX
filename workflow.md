# CONFLUMIX Frontend Workflow

## Purpose and current status

This document records the frontend routes, shared navigation, URL state, and cross-page workflows that are currently implemented. Group 01 authentication, Group 02 public discovery, Group 03 New Product landing/browsing, and Group 04 product details exist in the Next.js frontend. Marketplace data remains deterministic local demonstration data; transactions, live notifications, GPS, and backend persistence remain pending.

## Route inventory

| ID | Page | Route | Purpose | Access | Status | Related routes |
| --- | --- | --- | --- | --- | --- | --- |
| PUB-01 | Homepage | `/` | Introduce and enter the four-mode platform | Public | Implemented | `/marketplace`, `/search`, `/discover` |
| PUB-02 | Marketplace Explorer | `/marketplace` | Filter and compare all marketplace modes | Public | Implemented | `/search`, `/discover`, auth routes |
| PUB-03 | Global Search | `/search?q=...` | Search across supported entity fields | Public | Implemented | `/marketplace`, `/discover` |
| PUB-04 | Local Discovery | `/discover?location=...` | Explore records in a selected locality | Public | Implemented | `/marketplace`, `/search` |
| NPM-01 | New Product Marketplace Landing | `/new-products` | Introduce categories, featured products, and recent additions | Public | Implemented | `/new-products/browse` |
| NPM-02 | Browse All New Products | `/new-products/browse` | Search, filter, sort, and paginate the product catalogue | Public | Implemented | `/new-products`, `/new-products/[productId]` |
| NPM-03 | Product Details | `/new-products/[productId]` | Inspect a fixture-backed product, choose a variant and quantity, check requirements, and compare alternatives | Public | Implemented | `/new-products/browse`, other product detail routes |
| NPM-04 | Create New Product Listing | `/new-products/sell/new` | Create, preview, locally draft, and locally publish a demo listing | Prototype seller context | Implemented | `/new-products` |
| NPM-05 | Edit Product Listing | `/new-products/sell/[productId]/edit` | Edit a fixture or browser-local listing through the shared form | Prototype seller context | Implemented | `/new-products/browse` |
| NPM-06 | Product Listing Quality Check | `/new-products/sell/[productId]/quality` | Review listing completeness, mandatory gaps, category attributes, media, and storefront readiness before simulated publication | Prototype seller context | Implemented | `/new-products/sell/[productId]/edit` |
| AUTH-01 | Sign in | `/auth/login` | Existing account access | Public | Implemented | `/auth/register`, `/auth/forgot-password` |
| AUTH-02 | Register | `/auth/register` | Account creation | Public | Implemented | `/auth/login`, `/terms`, `/privacy` |
| AUTH-03 | Forgot password | `/auth/forgot-password` | Request password recovery | Public | Implemented | `/auth/login`, `/auth/reset-password` |
| AUTH-04 | Reset password | `/auth/reset-password` | Set a replacement password | Public | Implemented | `/auth/login` |
| AUTH-05 | Verify email | `/auth/verify-email` | Confirm account email | Public | Implemented | `/auth/login` |
| AUTH-06 | Sign-in required | `/auth/required?next=...` | Guard frontend-only protected actions | Public entry | Implemented | Requested return route |
| LEGAL-01 | Privacy notice | `/privacy` | Current placeholder privacy notice | Public | Implemented placeholder | Registration, footer |
| LEGAL-02 | Terms | `/terms` | Current placeholder terms | Public | Implemented placeholder | Registration, footer |

## Global navigation map

- Logo → `/`.
- Marketplace → `/marketplace`.
- New Products → `/new-products`.
- Reuse → `/marketplace?mode=reuse`.
- Tasks → `/marketplace?mode=tasks`.
- Donations → `/marketplace?mode=donations`.
- Header and hero search → `/search?q=<normalized input>` with locality when supplied.
- Header locality selector updates `/discover` immediately when already on local discovery; other pages retain a local header selection for subsequent search.
- Sign in and account CTAs use `/auth/login` and `/auth/register`.
- Footer links point to implemented public, authentication, privacy, terms, and guarded support destinations.
- Mobile menu exposes the same marketplace destinations and closes after navigation.

## Page workflows

### Homepage

- `Explore marketplace` → `/marketplace`.
- `Explore all modes` → `#marketplace-modes`.
- Each mode card → `/marketplace?mode=<mode>`.
- Search submission → `/search?q=<query>&location=<locality>`.
- Locality and mode selection update the local preview from the mock dataset.
- `Explore <locality>` → `/discover?location=<slug>[&mode=<mode>]`.
- Featured cards open the shared frontend detail panel.
- Account CTA → `/auth/register`.

### Marketplace Explorer

- Mode tabs update `mode` and clear incompatible category, condition, and donation-kind filters.
- Locality, category, status, reuse condition, and donation type write compatible query parameters.
- Sorting writes `sort`; Load More reveals another six locally filtered records.
- Card detail actions open the shared frontend detail panel. The panel closes with its close control, Escape, or backdrop, and its protected continuation uses `/auth/required?next=<current context>`.

### Global Search

- `q` initializes the shared search input and deterministic title/description/category/locality/entity-specific matching.
- Mode changes preserve `q` and compatible filters.
- Filters, sorting, detail panel, Load More, clear filters, and browser history use the same explorer contract.
- Missing `q` shows the search-entry state; unmatched queries show the explicit no-match state.

### Local Discovery

- Missing or invalid locality defaults to DHA Phase 6.
- Selecting a locality writes `location=<slug>` and filters actual locality fields.
- Mode, compatible category, filters, and sorting remain URL-addressable.
- A locality/mode with no records shows actions to clear filters or explore the unified marketplace.
- Details preserve the current URL because the panel does not replace the route.

### New Product Marketplace

- Header New Products and the dedicated landing entry resolve to `/new-products`.
- Landing search submits to `/new-products/browse?q=<encoded query>`; clearing it opens the complete catalogue.
- Category shortcuts open `/new-products/browse?category=<category>` with a count derived from the fixture catalogue.
- Featured status is explicit fixture metadata. Recently Added is ordered deterministically by `createdAt`.
- Browse All Products opens `/new-products/browse`.
- Browse reads `q`, `category`, `min`, `max`, `availability`, `seller`, `locality`, `attribute`, and `sort` from the URL.
- Search covers title, description, category, seller, and structured attributes. Category changes remove incompatible attribute state.
- Minimum and maximum price inputs accept non-negative values and show an inline error when the range is invalid.
- Active filters are independently removable. Clear All preserves the search query and clears catalogue refinements.
- Sorting supports newest, price ascending, and price descending with stable ID tie-breaking.
- Load More reveals ten additional filtered products without duplication and resets after query changes.
- Product cards open a local detail panel. Add to Cart updates a page-local prototype count and confirmation; it does not reserve stock or persist an order.
- Out-of-stock products remain discoverable but cannot be added to the prototype cart.
- Product catalogue, filters, details, and cart state are frontend-only. Product-detail routes, seller listing creation, persistent carts, checkout, payment, and inventory APIs are not implemented.

## Search workflow

1. The user enters a query in a shared `SearchBar`.
2. Enter or Search submits normalized non-empty text.
3. The router navigates to `/search?q=...` and includes compatible locality context.
4. `discoverMarketplace` searches entity-common and entity-specific fields case-insensitively.
5. Mode tabs narrow the same query context.
6. Supported filters update URL parameters and results.
7. Sorting applies deterministic relevance, newest, alphabetical, applicable price, or donation urgency ordering.
8. Load More increases the visible page by six without discarding filters.
9. Empty query, no query matches, and filtered-empty states remain explicit.
10. Clear removes filter parameters while retaining the search query and selected mode.
11. Next.js router navigation preserves meaningful state through browser back and forward actions.

## Local discovery workflow

1. The page reads a valid locality slug or defaults to DHA Phase 6.
2. The locality select exposes all localities present in the mock dataset.
3. Selecting a locality updates the control.
4. The URL receives the normalized locality slug.
5. Mode selection preserves locality and removes incompatible filters.
6. Category, status, condition, donation type, and sorting apply where meaningful.
7. Cards open the shared entity-specific detail panel.
8. Closing the panel returns to the unchanged results context.
9. Empty localities or filter combinations show recovery actions instead of unrelated records.

## Shared components

| Component | Responsibility |
| --- | --- |
| `PublicShell` | Header, desktop/mobile navigation, header search, locality, account action, footer |
| `SearchBar` | Accessible reusable query entry, clear, keyboard submit, URL navigation |
| `DiscoveryExplorer` | URL parsing, modes, filters, sorting, count, loading, Load More, empty states |
| `ListingCard` | Entity-aware label, metadata, optimized listing image or honest fallback, locality, detail action |
| `ListingDetail` | Reusable accessible frontend-only detail panel and guarded continuation |
| `Breadcrumb` | Public-page orientation |
| `Icon` | Consistent stroke-based SVG icon language |

## Frontend data and service architecture

- Typed discriminated entity models: `apps/web/src/types/marketplace.ts`.
- Deterministic records and mode/locality metadata: `apps/web/src/data/marketplace.ts`.
- Search, filter, sort, result counts, and record lookup: `apps/web/src/services/marketplace.ts`.
- Pages and components consume the async service boundary rather than importing data for explorer results. The homepage imports the local dataset only for deterministic featured and locality previews.
- A future API adapter can replace the service implementation while retaining `DiscoveryQuery`, `DiscoveryResult`, and page component contracts.

## Known gaps and future integration

- All records are clearly frontend demonstration content; no API or database is queried.
- The detail panel is implemented, but checkout, offers, task proposals, donation claims, and notifications are not.
- Header locality is component-local outside `/discover`; shared account persistence is pending.
- Seven locally stored marketplace photographs support the primary featured and category records; records without a matching approved image use an honest styled fallback.
- On phones, results use a two-column grid and filters open in a dismissible drawer; desktop retains the inline filter panel.
- Homepage promotions rotate through four locally stored Unsplash images every five seconds and expose previous, next, and direct slide controls. Pointer and keyboard interaction pauses rotation.
- Homepage category quick access expands the selected marketplace mode in place. Close returns to the four compact mode choices; Show more opens `/marketplace?mode=...`.
- At full desktop width, featured homepage listings use five columns and explorer/discovery listings use four. Responsive reductions preserve two columns on phones.
- Privacy, terms, and safety/support destinations remain explicit placeholders or guarded routes.

## Verification record

Updated 2026-10-24.

- TypeScript: executed successfully after Group 02 implementation.
- ESLint: `npx eslint src` passed after correcting the initial hook findings.
- Production build: `npm run build` passed; Next.js produced all 14 routes. The environment used the WASM SWC fallback because its installed native Windows binary was invalid.
- Browser routes checked after the marketplace-first redesign: `/`, `/marketplace`, `/search?q=desk`, and `/discover`.
- Responsive browser checks passed at 360 × 740, 390 × 844, 768 × 1024, 1024 × 900, and 1440 × 900 with document scroll width equal to the viewport client width.
- The mobile explorer now exposes a labeled Filters trigger and dismissible filter drawer; the mobile menu remains available from shared chrome.
- Mode-filter check: `/marketplace?mode=reuse` rendered four cards and every rendered entity label was `Reuse`.
- Group 03 validation (2026-10-25): `/new-products`, `/new-products/browse`, matching and no-match `q` URLs, category/sort URLs, and out-of-stock URLs returned HTTP 200.
- Group 03 desktop browser captures confirmed five product columns on the browse page alongside the filter rail. The phone capture confirmed the mandatory two-column grid and visible Filters control.
- Group 03 `npm run lint`, `npm run typecheck`, and `npm run build` passed. The production build generated 16 routes using the environment's WASM SWC fallback.

## Group 04 — Product Details Workflows

1. Browse New Products → select a product card → open `/new-products/[productId]` for that fixture-backed product.
2. Product Details → select a gallery thumbnail → update the main image; selecting the main image opens an Escape-dismissible enlarged viewer.
3. Product Details → select an available variant → update the displayed price and supported stock; unavailable variants remain disabled.
4. Product Details → decrease or increase quantity → keep the quantity between one and the selected variant or product stock maximum.
5. Product Details → Add to prototype cart → validate stock and quantity → update the page-local cart indicator and show a local confirmation. No inventory is reserved.
6. Product Details → select category-specific requirements → Check compatibility → show Match, Mismatch, or Unknown results derived from the selected product's structured attributes.
7. Requirement results → compare deterministic in-stock alternatives from the same category → select an alternative → open that product's own detail route.
8. Product Details → select a related product → open that product's own detail route.
9. Product Details → use the category breadcrumb → return to `/new-products/browse` with the category query preserved.
10. Unknown or malformed product identifier → show a product-not-found state → return to Browse New Products.

The Purchase Confidence Summary reports listing completeness, fixture-backed seller verification, stock-timestamp availability, and supplied purchase terms. It does not use a percentage, safety score, inferred rating, or guarantee. Reviews are explicitly unavailable because the current fixtures do not provide review data. Store pages, persistent/shared cart state, checkout, payments, real stock updates, real seller verification, server-backed recommendations, and server-backed reviews remain backend or future frontend work.

- Group 04 validation (2026-10-25): `npm run typecheck`, `npm run lint`, and `npm run build` passed. The production build generated the dynamic `/new-products/[productId]` route using the environment's WASM SWC fallback.
- Runtime HTTP checks returned 200 for two distinct product slugs, the browse route, and the intentional product-not-found experience. Automated viewport screenshots were not available because no browser automation package is installed in this environment; responsive rules were reviewed for the required 360 px, 390 px, tablet, 1024 px, and desktop breakpoints.

## Group 05 — Seller Listing Workflows

1. `/new-products/sell/new` → enter partial listing data → Save draft → store a development-only draft in browser storage. Reloading restores supported text, pricing, attributes, variants, and policy data; selected local image files must be chosen again.
2. Create Listing → Preview listing → inspect the current unsaved form state in an accessible modal → close and continue editing without losing values.
3. Create Listing → Publish demo listing → validate required fields, image presence, category attributes, price, quantity, and variants → store a browser-local `published-demo` record and show an explicitly local confirmation.
4. Invalid publication → show a focusable error summary plus field-level messages → preserve all entered values for correction.
5. `/new-products/sell/[productId]/edit` → resolve a fixture ID/slug or locally stored ID → prepopulate the same shared form → save changes without changing the identifier.
6. Create/Edit → change category → remove incompatible structured attributes and render the fields used by the Group 04 requirement checker.
7. Create/Edit → select valid JPEG, PNG, or WebP files up to 5 MB each and five images total → preview locally → change the primary image or remove an image. Files are not uploaded and object URLs are not persisted.
8. Create/Edit with unsaved changes → Cancel or close/reload → receive discard confirmation; saved drafts are not erased by cancellation.
9. Unknown edit identifier → show a useful listing-not-found state → return to New Product browsing.

The prototype seller identity is fixed and read-only because authentication and seller eligibility are not implemented. Browser storage is a development aid, not a security or persistence boundary. Locally saved listings do not mutate the server-rendered Group 03 catalogue or Group 04 product-detail data; authenticated ownership checks, permanent uploads, catalogue publication, lifecycle transitions, and backend validation remain future ASP.NET Core responsibilities. Archive/deactivation is omitted because no approved listing lifecycle currently defines that transition.

- Group 05 validation (2026-10-25): `npm run typecheck`, `npm run lint`, and `npm run build` passed. The build generated `/new-products/sell/new` and `/new-products/sell/[productId]/edit`.
- Runtime checks returned HTTP 200 for create, fixture-backed edit, and invalid-edit URLs. Chrome captures verified the desktop form layout and the responsive seller layout; the CSS provides explicit 360 px and 390 px width containment, single-column fields, touch-sized controls, and non-sticky mobile actions.

## Shared Personal Dashboard — USER-01

## Group 06 — Product Listing Quality Check

1. Open an existing listing editor and select Quality check to open `/new-products/sell/[productId]/quality`.
2. The page resolves a browser-local listing first, then a fixture-backed product. `/new-products/sell/demo-quality/quality` supplies the intentionally incomplete mixed-state demonstration listing.
3. Completeness is calculated from title, description, positive price, stock of at least one, one to twenty images, category, configured required category attributes, and seller storefront completion.
4. Missing rows link back to the corresponding editor field by URL fragment. Seller profile gaps link to Seller Center setup.
5. Complete missing demo checks updates only page-local state so the score and disabled publish action can be verified without an API or permanent data mutation.
6. Publish Listing is enabled only at 100%; it uses a short local delay and reports `Listing published successfully! (Simulated)` without claiming backend publication.

The desktop summary is sticky beside the checklist. At phone widths the summary becomes static and is placed before the checklist, while attribute rows collapse without horizontal document scrolling.

1. Open `/dashboard` → review the shared-account welcome, locality, and account status without fabricated backend counts.
2. Select Explore marketplace → continue to the shared four-mode marketplace.
3. Select Add a new product → continue to the existing browser-local New Product listing prototype.
4. Review task and donation actions → see that they are unavailable because those workflows are not implemented, not because Seller Center is incomplete.
5. Review Seller Center → see separate Not started / Not configured states and disabled future setup, category, and storefront controls with an explanation.

Seller Center setup is implemented at `/dashboard/seller-center/setup`, and New Product category configuration is implemented at `/dashboard/seller-center/new-products/categories`. The future Reuse configuration route `/dashboard/seller-center/reuse/categories` remains deliberately unimplemented. The approved public New Product taxonomy remains separate from seller-specific category enablement.

### Group 05 Seller Center workflow

1. `/dashboard` → NPM-04A Seller Profile Setup → authenticate through the frontend test session and complete the four-step New Product seller profile.
2. Personal and contact information → choose Individual or Company / Business and enter the applicable owner, email, phone, and conditional business details. Email verification will integrate with backend authentication later; there is no separate email or phone verification step in this workflow.
3. Private identity → enter a format-checked CNIC and stage separate front/back images in memory. CNIC values, file names, previews, and object URLs are not persisted. A successful submission stores only the non-sensitive fact that the profile was completed.
4. Store, delivery, returns, payment, and agreements → enter the public store details and preferences required for the New Product selling experience.
5. Review → the frontend validates the applicable fields, saves only non-sensitive prototype state, displays successful profile completion, and enables Continue to Category Setup. It does not claim official identity verification or a backend database write.
6. NPM-04B Category Configuration → enable at least one of the 23 New Product parent categories and configure optional subcategories and attributes. No category controls are duplicated in NPM-04A.
7. NPM-04 Create Listing → require both a completed seller profile and at least one configured category; route to the specific missing setup step when either requirement is absent.
8. NPM-05 Edit Listing → use the same eligibility rule while preserving the existing listing and its saved category data.
9. Reuse seller setup remains outside this workflow, and Task & Soft Skills actions remain independent from Seller Center eligibility.

Seller setup uses browser local storage for non-sensitive prototype state and is not backend persistence. Branding previews, full CNIC numbers, and CNIC documents are memory-only. The current session and route checks are frontend testing aids, not server authorization; authenticated ownership, email verification, and private object storage must be enforced by the ASP.NET Core/Supabase boundary when implemented.

- Group 05 seller-foundation validation (2026-10-25): `npm run typecheck`, `npm run lint`, and `npm run build` passed. The production build generated both Seller Center routes plus the existing create/edit routes.
- Runtime HTTP checks returned 200 for `/dashboard`, both Seller Center routes, create listing, fixture-backed edit listing, New Product landing/browse, and login.
- Automated browser interaction and screenshots were not run in this pass. Local-storage setup, category selection, and form validation require final interactive review at 360 × 740, 390 × 844, tablet, and desktop widths.

### Category configuration interaction refinements

- Enabling a predefined parent category initially renders only its approved parent fields in the live listing-form preview.
- Optional attributes can be selected manually; manually selected fields use the teal state and appear immediately in the preview.
- Selecting a predefined or custom subcategory adds its associated fields automatically; these use the orange subcategory state and remain individually removable.
- Custom parent categories persist into the category rail and can be deleted with confirmation. Custom subcategories and reusable custom attributes are supported through the same browser-local seller configuration.
- Attribute preview controls are inferred from field meaning, including date, numeric, yes/no, general text, and a 30-option colour selector with `Other`.
- Create/Edit Listing reads the seller's configured parent fields, selected optional fields, configured subcategories, and a maximum of 20 comma-separated search keywords. Keyword validation requires 1–20 characters, an alphanumeric first character, and rejects decimal-only values.

- Alignment validation (2026-10-25): `npm run typecheck`, `npm run lint`, and `npm run build` passed; the production build generated `/dashboard` and preserved all existing auth, public, and New Product routes.
- Runtime HTTP checks returned 200 for `/dashboard`, `/new-products`, an approved empty-category browse query, a product detail route, `/auth/login`, `/marketplace`, and `/discover`.
- Automated Chrome captures were attempted at 360 × 740, 390 × 844, and desktop widths, but this environment's Chrome GPU process exited before producing images. The dashboard includes explicit single-column phone rules, shrinkable grid children, bounded content, and touch-sized controls; a final interactive browser inspection remains recommended.
# Group 07 seller workflows

Public discovery follows `Product Discovery → Seller Storefront (/stores/[storeId]) → Store Products → Product Details (/new-products/[productId])`. Storefront categories come only from that store's visible products. The public view uses a safe mapping that excludes identity documents and private verification data.

Seller operations follow `Personal Dashboard (/dashboard) → New Product Seller Dashboard (/dashboard/new-products) → Relevant Seller Action`. Profile setup remains at `/dashboard/seller-center/setup`; New Product category configuration remains at `/dashboard/seller-center/new-products/categories`; listing creation remains at `/new-products/sell/new`; product management, import/export, activity history, and promotion management are available from their approved dashboard routes. Orders and analytics remain disabled until their approved pages exist.

Listing management follows `Seller Dashboard → Manage Products (/dashboard/new-products/products) → Search/filter/sort → Select current-page records → Dedicated NPM-10 preview → Explicit confirmation → Local result`. Sellers can edit and quality-check records through the existing listing routes, view only publicly active products, set price or quantity, deactivate or archive eligible active listings, and export selected non-sensitive product fields to CSV. Product activity history, duplication, configured batch rules, NPM-11 history/rollback, and full NPM-12 import/export remain unavailable.

The dedicated safe-operation workflow is `NPM-09 Selection → Operation Configuration → NPM-10 Preview (/dashboard/new-products/bulk-preview) → Current-state Validation → Final Confirmation → Local Execution → Result Feedback`. Pending operations use seller-bound session storage rather than URL snapshots. NPM-10 recalculates eligibility from current records, identifies stale previews, requires refresh and a new review, preserves excluded records unchanged, prevents duplicate local execution by operation ID, and records completed results for NPM-11. Cancellation clears the pending operation without modifying listings.

Operation history and rollback follows `NPM-09 Product Selection → NPM-10 Preview → Final Confirmation → Bulk Operation Execution → NPM-11 Operation History (/dashboard/new-products/activity) → View Details → Rollback Assessment → Rollback Preview → Confirmation → Restoration → Rollback Result`. NPM-10 records field-level before/after values for successful mutations. NPM-11 restores only an affected field whose current value still matches the recorded after-state; newer affected-field changes, missing products, original skips, exports, and already-restored changes are excluded. Partial rollbacks remain explicit, the original record stays intact, and each rollback creates a linked history entry.

Product import follows `Select CSV/XLSX File → Parse File → Map Columns → Validate Data → Review Row Errors → Preview Import → Confirm Import → Create Draft Listings → Import Result`. Files are limited to 5 MB and 500 data rows. Required listing fields reuse the manual listing validator; seller-enabled categories, configured subcategories and selected category attributes are checked separately. Existing and in-file SKU conflicts are excluded, invalid rows are never created, and imported records enter the normal listing service as drafts without automatic publication.

Product export follows `Choose Filters → Select CSV/XLSX → Review Record Count → Generate File → Download`. Exports are limited to the current seller's managed listings and include product fields only. Spreadsheet-formula prefixes are escaped, and seller identity, authentication, verification, payment, and buyer data are excluded.

Promotion management follows `Create Promotion → Configure Discount → Select Products/Categories → Set Dates → Preview → Conflict Check → Resolve Conflicts → Save → Active or Scheduled`. Editing repeats validation, price preview, and conflict checking. Deactivation requires confirmation, preserves the record, and immediately returns eligible displays to their original prices.

Disabled takes precedence over the date-derived status; future promotions are scheduled, promotions inside the inclusive start/end days are active, and passed end dates are expired. Product and category selections use inclusive OR applicability. Conflicts require both a shared eligible product and overlapping effective dates, covering product/product, category/category, and product/category cases. Enabled conflicts cannot be saved or applied. Percentage and fixed discounts share one rounded-PKR calculation across NPM-13, NPM-09, and NPM-07, while the managed listing price remains unchanged.

The NPM-14 seller flow is `Demo Checkout Order Record → Seller Orders List → Order Details → Supported Status Update → Completion`. The shared order service accepts checkout-created records, preserves product names, images, categories, quantities, unit prices, promotion information, totals, policy text, and buyer references as immutable purchase-time snapshots, then scopes reads by the current seller name and store-bound order identifier. The current application has no checkout route, persistent cart, or buyer order page, so it creates no seed orders; the seller page displays an honest empty state until checkout calls the shared creation boundary.

Supported seller transitions are `Pending → Confirmed → Processing → Completed`, with cancellation from Pending or Confirmed. Cancellation preserves the order and history and explicitly records that inventory was not restored because checkout never reserved stock. Existing buyer-submitted return records can transition `Return Requested → Return Approved / Return Rejected`, and approved returns can be recorded as Returned. Rejection requires a seller decision reason. The seller cannot submit a return pretending to be the buyer; buyer-side return creation remains unavailable until an authorized buyer order surface exists.

Every successful state change appends an actor, timestamp, previous status, new status, and optional note. Important updates require confirmation and revalidate the expected current state to avoid silently overwriting a newer browser-local change. Completed means a manual demo workflow state, not carrier-confirmed delivery. Payment state remains “no real payment collected”; refunds, banking, shipment tracking, inventory reservation, and inventory restoration are not implemented.

Return insights follow `NPM-14 Return Request → Structured Reason Recording → Seller Return Review → NPM-15 Return Insights`. Approved reasons are Wrong Size, Compatibility Issue, Description Mismatch, Wrong Product, Damaged Product, Quality Issue, Missing Feature, Changed Mind, and Other. Unknown or legacy values remain visible as Unclassified and are excluded from the categorized-reason percentage denominator.

NPM-15 reads distinct seller-owned return requests from the shared order store and uses return-request timestamps for 7-, 30-, 90-day, current-year, and all-time filters. Reason share is `requests for reason / categorized requests`; request counts and requested quantities remain separately labeled. Product and category aggregation uses historical order-item snapshots, so current listing edits do not rewrite evidence. Comparable purchase cohorts and completed return windows are unavailable, so the page does not publish return rates.

Trend visualization requires at least four requests across two recorded months. A seller observation requires at least three distinct requests for the same product and structured investigative reason; it uses cautious language, states the evidence count, and recommends review rather than asserting fault. View Return opens the owning NPM-14 order detail, View Product opens the seller listing editor, and CSV export respects the active reporting filters without buyer identity or contact fields. No buyer-facing warning is published.

Purchase failures remain separate from returns. Because the application records no checkout attempts, validation failures, abandonment, payment failures, or order-creation failures, NPM-15 reports unavailable instrumentation and calculates no purchase-failure count or rate.

## New Product frontend integration verification

Published browser-local listings now flow through seller management, the public store, catalogue search, and product detail without duplicating fixture state. Drafts stay private, edits propagate to public discovery, active promotions affect public prices, and store branding survives reloads. A development-only route at `/dashboard/new-products/test-data` loads or resets a clearly labelled deterministic dataset; it is not included in production navigation.

Run `npm run test:e2e` from `apps/web` while the local development server is available at `127.0.0.1:3000`. The Chrome journey covers registration and login, controlled seller data, dashboard and listing management, draft exclusion from the storefront, public search and detail navigation, edit propagation, unauthenticated seller-route protection, and horizontal-overflow assertions at 360 × 740 and 390 × 844.

## Buyer-to-seller entry workflow

Registration and login create a normal buyer account only. The personal dashboard and mobile account drawer show `Become a Seller` when no seller intent exists; they never infer seller access from authentication alone. The flow is `Personal Dashboard → Become a Seller (/become-a-seller) → Marketplace Selection`.

- New Products records New Product intent, starts NPM-04A, continues through NPM-04B, and unlocks listing creation and the New Product Seller Center only after profile and category completion.
- Reuse records account-specific interest and shows an honest coming-soon state. It creates no New Product profile and unlocks no seller management route.
- Both records New Product start and Reuse interest independently, then starts NPM-04A. Completing New Products does not complete Reuse.

Returning users receive a continuation action computed from their actual seller profile and category state. Seller setup, category setup, New Product management, and listing-authoring route layouts re-evaluate the signed-in account on refresh and direct URL navigation. Browser-local seller intent and non-sensitive setup records are keyed by account email; private CNIC files remain memory-only.

## New Product Seller Center navigation

The completed seller journey is `Profile Setup → Category & Attribute Settings → Seller Dashboard`. Category settings save before routing to `/dashboard/new-products`; product creation is intentionally available from the shared Seller Center navigation and dashboard context instead of the category page.

The workspace sidebar groups Overview; Create, Manage, and Import/Export listings; Orders and Returns; Promotions; Bulk Preview and History; Storefront, Profile, and Category settings; and Add Another Marketplace. The expansion link returns to the existing seller marketplace selection without changing the completed New Product profile. Dashboard-wide quick-action duplication has been removed; the dashboard retains only contextual actions and evidence-backed operational summaries.

For a completed New Product-only seller, `My Account` resolves directly to `/dashboard/new-products`. Incomplete New Product onboarding resolves to the next required setup step, while buyers continue to `/dashboard`. Reuse-only intent does not route into the New Product workspace.
# New Product Shop Sections

| Flow | Route | Implemented behavior | Persistence |
| --- | --- | --- | --- |
| Manage shop sections | `/dashboard/new-products/sections` | Create, rename, reorder, and safely delete up to 30 flat sections per New Product store | Browser-local prototype |
| Assign a listing | `/new-products/sell/new`, `/new-products/sell/[productId]/edit` | Optional single-section assignment and inline section creation without leaving the form | Saved on the local listing record |
| Browse a storefront section | `/stores/[storeId]?section=[sectionId]` | Public navigation shows ordered, non-empty sections and filters eligible published products | Browser-local prototype |

Deleting a section preserves its products and clears only their section assignments. All Products continues to include assigned and unassigned eligible products.
