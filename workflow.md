# CONFLUMIX Frontend Workflow

## Purpose and current status

This document records the frontend routes, shared navigation, URL state, and cross-page workflows that are currently implemented. Group 01 authentication and Group 02 public discovery exist in the Next.js frontend. Group 02 uses deterministic local demonstration data; marketplace transactions, live notifications, GPS, and backend persistence remain pending.

## Route inventory

| ID | Page | Route | Purpose | Access | Status | Related routes |
| --- | --- | --- | --- | --- | --- | --- |
| PUB-01 | Homepage | `/` | Introduce and enter the four-mode platform | Public | Implemented | `/marketplace`, `/search`, `/discover` |
| PUB-02 | Marketplace Explorer | `/marketplace` | Filter and compare all marketplace modes | Public | Implemented | `/search`, `/discover`, auth routes |
| PUB-03 | Global Search | `/search?q=...` | Search across supported entity fields | Public | Implemented | `/marketplace`, `/discover` |
| PUB-04 | Local Discovery | `/discover?location=...` | Explore records in a selected locality | Public | Implemented | `/marketplace`, `/search` |
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
- New Products → `/marketplace?mode=new-products`.
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

## Group 24 — Task landing and browsing

TSM-01 is available at `/tasks` and TSM-02 at `/tasks/browse`. The landing page uses the shared public shell and routes task-specific search into Browse Tasks. Category links use normalized URL state, recent ordering uses fixture timestamps, open opportunities exclude closed and expired records, and locality is explicitly described as owner context rather than an on-site requirement.

Browse Tasks supports shareable `q`, `category`, `skills`, `status`, `budget`, `deadline`, `arrangement`, `locality`, and `sort` parameters. Unsupported values fall back safely. Search covers task title, description, category, skills, and owner display name; filtering and sorting are deterministic and reset Load More pagination. Mobile filters use a dismissible sheet with a scrim, close control, Escape handling, focus placement, Clear, and Apply actions. Typed frontend fixtures and published browser-local authored tasks supply the catalogue; no API, rating, verification, or recommendation data is implied.

Every task card preserves the `/tasks/[taskId]` TSM-03 contract. Post a Task routes authenticated frontend sessions to `/tasks/new`; proposals, server authorization, file storage, and remote persistent task data remain future dependencies. Responsive browser smoke verification covers 360 × 740, 390 × 844, and 1280 × 900.

TSM-03 is implemented at `/tasks/[taskId]` and resolves both stable fixture IDs and slugs. Group 24 View Task actions open a full opportunity brief containing publication context, description, skills, expected deliverable, requirements, submission expectations, compensation, deadline, remote arrangement, and permitted owner identity/locality. Open tasks expose the protected `/tasks/[taskId]/propose` workflow; reviewing, in-progress, closed, and expired tasks explain why ordinary proposals are unavailable. Browser-local submitted proposal counts are derived when records exist; ratings, reviews, verification, and unsupported activity metrics remain omitted.

The frontend session identifies a fixture owner only when its display name exactly matches the task owner. Invalid identifiers render a recoverable Task unavailable page, and route loading reserves the two-column layout. Browser verification covers open, closed, expired, invalid-ID, mobile overflow, and ID/slug resolution at 360 × 740, 390 × 844, and 1280 × 900. Proposal submission/management, backend ownership enforcement, workroom, and deliverable submission remain future work.

## Group 26 — Task creation and editing

TSM-04 is implemented at `/tasks/new` and TSM-05 at `/tasks/[taskId]/edit` through one shared authoring form. The category catalogue contains 40 grouped task types and renders only the selected category’s structured fields; changing a populated category requires confirmation before those specialized values are cleared. A custom-category path remains available. Common fields cover description, skill tags, deliverable, capability, experience, deadline, duration, submission expectations, fixed/hourly PKR compensation, and conditions.

Create mode supports browser-local drafts, automatic restoration of the latest account-owned draft, reusable task-card and full-detail preview, validation summary links, and inline errors. Published local tasks join task browsing and task-detail resolution without appearing while still in draft. Edit mode requires an exact frontend-session owner match and an open lifecycle state, preserves stable IDs and slugs, and provides Save Changes, Preview, Cancel, and confirmed Close Task actions. Supporting files are page-memory-only and are explicitly not uploaded or persisted. Server authorization, remote persistence, object storage, and irreversible production lifecycle enforcement remain backend work. Browser verification covers authoring at 360 × 740, 390 × 844, and 1280 × 900, including draft restoration, preview, publish, owner edit access, and closure.

## Group 27 — Task proposals and personal task lists

TSM-06 is implemented at `/tasks/[taskId]/propose`. One normalized proposal record references the related task ID and stores solver identity, approach, optional experience/examples, proposed completion date, optional PKR compensation, timestamps, status, and latest deterministic update. Supported statuses are Draft, Pending, Accepted, Rejected, Withdrawn, and Completed. The frontend currently creates Draft and Pending records and can transition Pending to Withdrawn; later owner-review and work groups own acceptance, rejection, selection, and completion transitions.

Eligibility is centralized in the proposal service: the user must be signed in, the task must exist and remain open before its deadline, the user cannot own the task, and a submitted proposal for the same solver/task prevents a duplicate. Drafts are browser-local, restored on return, excluded from submitted counts and My Proposals, and become the submitted record without changing identity. Valid submission requires a meaningful approach, a future completion date no later than the task deadline, and positive PKR compensation. Successful submission routes to `/dashboard/tasks/proposals` with honest success feedback.

TSM-07 is implemented at `/dashboard/tasks/posted`. It resolves tasks from the current frontend account, derives Draft, Published, Receiving Proposals, Under Review, In Progress, Completed, and Closed/Expired summary counts, and derives proposal counts from submitted proposal records. Desktop uses a semantic comparison table and mobile uses management cards. Selected solver remains “Not selected” unless an accepted proposal record genuinely exists. Review Proposals and View Work Progress use future route contracts only when relevant; their workflows are not implemented here.

TSM-08 is implemented at `/dashboard/tasks/proposals` with optional `status=pending|accepted|rejected|withdrawn|historical`. It shows only the current solver’s submitted records, resolves title and owner from the related task, and displays the actual submission date, proposed completion, proposed compensation, status, and latest supported update. A read-only dialog exposes the submitted content. Only Pending proposals can be withdrawn, using an accessible confirmation; withdrawal does not change the task. Review/selection, workroom, messaging, submission, revision, and completion remain future groups.

All Group 27 writes use browser local storage and frontend-session authorization. No API, database transaction, server constraint, payment, or remote file storage is claimed. Browser verification covers 360 × 740, 390 × 844, 768 × 900, 1280 × 800, and 1440 × 900 across all three routes, including draft restoration, submit, duplicate/owner/closed/expired blocking, current-user scoping, proposal counts, filters, proposal inspection, withdrawal, and horizontal-overflow checks.

## Group 28 — Proposal review and solver selection

TSM-09 is implemented at `/dashboard/tasks/posted/[taskId]/proposals`. The route resolves the current frontend session before loading private proposal records and permits access only to the exact task owner. Submitted proposals can be filtered and inspected without scores, recommendations, or automatic ranking. The owner can manually reject a pending proposal or confirm one solver; selection accepts exactly one proposal, rejects the remaining pending proposals, records the selected proposal, solver, and time on the browser-local task override, and moves the task to Solver Selected. Revalidation prevents a stale or repeated selection from replacing an existing solver.

The selected task exposes `View Work Progress` into TSM-10. Group 28 uses deterministic browser-local services and frontend-session identity only; it is not a server transaction or production authorization boundary.

## Group 29 — Task workroom and execution

TSM-10 is implemented at `/dashboard/tasks/work/[taskId]`. Direct route access is limited to the exact task owner or the accepted proposal's solver. Unknown tasks, unrelated accounts, and tasks without a selected solver receive distinct safe states; private scope and submission information is not rendered to unrelated accounts. The same account can be an owner on one task and a solver on another because the role is derived relative to the requested task.

The workroom combines the original task brief and requirements with the accepted proposal's approach, completion date, experience, and proposed compensation. It displays the actual deadline, expected deliverable, a compact lifecycle view, chronological submission history, revision history, and meaningful stored activity events. It does not add chat, fake progress percentages, time tracking, project boards, meetings, payments, or invented activity.

Lifecycle permissions are centralized in `task-workroom.ts`. The selected solver receives a TSM-11 route link for Submit Work while the task is Solver Selected, In Progress, or Revision; the detailed submission form is intentionally not implemented in Group 29. For a stored Submitted record, the owner can request a specific revision (`Submitted → Revision`) or accept the submission (`Submitted → Completed`). Acceptance and completion are one authoritative prototype transition because the current approved lifecycle defines no separate accepted-task state. The owner can cancel active selected/in-progress/revision work after confirmation (`→ Cancelled`); existing agreement, submissions, revisions, and activity remain readable. Completed, cancelled, and closed workrooms are read-only. No payment action is implied.

Workroom records use typed browser-local storage with one service-level transition writing the task lifecycle and execution record. The current frontend cannot provide database transactions, server concurrency constraints, permanent file storage, or real authorization; those remain ASP.NET Core/Supabase dependencies. My Posted Tasks, My Proposals, Review Proposals, and Task Details use the expanded lifecycle and link to the canonical workroom route where eligible.

Group 29 verification (2026-11-04): `npm run typecheck`, `npm run lint`, and `npm run build` passed. The production build used Next's WASM SWC fallback because the local native Windows binary could not load. Chrome browser checks passed for owner, selected solver, unrelated account, no-solver and invalid-task states, revision, acceptance/completion, role action separation, dialog fit, and horizontal overflow at 360 × 740, 390 × 844, 768 × 900, 1280 × 800, and 1440 × 900.

## Group 30 — Work submission and task history

TSM-11 is implemented at `/dashboard/tasks/work/[taskId]/submit`. Direct access resolves the authenticated account against the accepted proposal and renders the active form only for the selected solver while the shared workroom is Solver Selected, In Progress, or Revision. Owners and unrelated accounts cannot submit through the route. Submitted, Completed, Cancelled, and Closed tasks show lifecycle-specific read-only guidance instead of an active form.

The deliverable record stores a required submission message, required deliverable description, up to five optional validated HTTPS references, optional completion notes, version, status, timestamp, and optional related revision ID. The repository has no secure object storage, so Group 30 deliberately provides no file input and claims no uploaded attachments. Save Draft is omitted because the workroom service has no genuine draft persistence contract.

`submitTaskDeliverable` performs the complete browser-local transition through one service operation. A first submission creates the next immutable version, moves the task and workroom to Submitted, and appends a `work-submitted` event. A revision resubmission preserves the previous submission, creates the next version linked to the active revision, records the revision's resolution time, returns the lifecycle to Submitted, and appends `work-resubmitted`. Current-state and selected-solver checks reject stale or duplicate attempts. The frontend service boundary is not a database transaction or production authorization mechanism.

TSM-12 is implemented at `/dashboard/tasks/work/[taskId]/history`. It applies the same owner/selected-solver privacy boundary as TSM-10, reads the same workroom record, and shows only stored execution events in oldest-to-newest order. Each event includes its recorded date, actor, contextual role where identifiable, and stored detail. Submission and revision history use the same reusable components as the Workroom. View Submission opens the actual message, deliverable description, completion notes, HTTPS references, status, date, and associated revision. Completed/cancelled/closed history remains read-only; missing earlier lifecycle events are not fabricated from current state.

TSM-10 now links to Submit Work and View Full History and reads the shared Group 30 submission/history components. TSM-07, TSM-08, TSM-09, and TSM-03 continue to derive lifecycle state from the same authored task and accepted proposal records, while private deliverable contents remain restricted to execution routes.

Group 30 verification (2026-11-05): `npm run typecheck`, `npm run lint`, and `npm run build` passed. Chrome checks covered first submission, required-field and HTTPS validation, rapid duplicate activation, owner/third-party access denial, revision context and version-two resubmission, revision resolution, history consistency, submission detail, completed read-only history, and horizontal overflow at 360 × 740, 390 × 844, 768 × 900, 1280 × 800, and 1440 × 900.

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
