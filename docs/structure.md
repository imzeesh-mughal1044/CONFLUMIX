# CONFLUMIX - Repository Structure Documentation

## A. Document Purpose

This document describes the initial repository structure for **CONFLUMIX** and defines the intended responsibilities of each directory and root-level file. It serves as a structural reference for developers and AI coding agents to understand where future work belongs.

This document is **strictly limited to repository organization**. It is not a Product Requirements Document (PRD), Technical Requirements Document (TRD), Software Requirements Specification (SRS), or a detailed software architecture specification. Implementation details, API contracts, database schemas, and specific algorithms are outside its scope.

## B. Technology Stack Overview

The agreed technology stack and the high-level responsibility of each component are as follows:

| Technology | Purpose | Responsibility |
|------------|---------|---------------|
| **Next.js, React, TypeScript, Tailwind CSS** | Frontend | Delivers the user interface for all four marketplace modes, ensuring a responsive and consistent user experience. |
| **C#, ASP.NET Core Web API** | Backend | Provides the unified business logic, validation, authorization, and data access layer for the entire platform. |
| **Supabase PostgreSQL & Supabase Auth** | Database & Authentication | Manages persistent data storage and handles user authentication/authorization across the application. |
| **Python, FastAPI, Pandas, NumPy, Matplotlib, Seaborn** | Analytics Service | Processes, analyzes, and visualizes marketplace data to support reporting and data science requirements. |
| **Git & GitHub** | Version Control & Collaboration | Facilitates source control, code review, issue tracking, and team collaboration. |
| **Vercel** | Frontend Deployment | Hosts the Next.js frontend application. |
| **TBD (To Be Decided)** | Backend & Analytics Deployment | Deployment targets for the API and analytics service will be determined at a later stage. |

No alternative frameworks or technologies beyond those listed above are assumed or proposed.

## C. Complete Directory Tree

The complete intended repository structure is shown below. Directories and files created as part of this initial structural setup are noted where applicable.

```text
CONFLUMIX/
│
├── apps/
│   ├── web/                        # [Created] Next.js frontend application (framework layout pending)
│   └── api/                        # [Created] ASP.NET Core Web API (framework layout pending)
│
├── services/
│   └── analytics/                 # [Created] Python FastAPI analytics service (framework layout pending)
│
├── docs/
│   ├── structure.md               # [Created] This structural documentation file
│   ├── requirements/              # [Created] Future project requirements documentation
│   ├── architecture/              # [Created] Future architectural documentation
│   ├── diagrams/                  # [Created] Future system and process diagrams
│   ├── api/                       # [Created] Future API documentation and specifications
│   ├── data-science/              # [Created] Future data science methodology and analysis docs
│   ├── testing/                   # [Created] Future testing strategies and documentation
│   └── project-management/        # [Created] Future project planning and tracking docs
│
├── tests/
│   ├── frontend/                  # [Created] Future frontend test assets
│   ├── backend/                   # [Created] Future backend test assets
│   └── analytics/                 # [Created] Future analytics service test assets
│
├── scripts/                       # [Created] Future development and maintenance scripts
│
├── .github/
│   ├── ISSUE_TEMPLATE/            # [Created] Future GitHub issue templates
│   └── workflows/                 # [Created] Future CI/CD workflow definitions
│
├── .gitignore                     # [Created/Updated] Git ignore rules for stack artifacts
├── README.md                      # [Created/Updated] Project overview and foundation information
└── .git/                          # [Existing] Git repository metadata
```

**Note:** At this stage, only the directory scaffolding and essential root files have been established. No application source code, test implementations, workflows, or detailed specification documents have been created.

## D. Root-Level Responsibilities

| Path | Type | Purpose |
|------|------|---------|
| `apps/` | Directory | Contains deployable applications: the web frontend and the backend API. |
| `services/` | Directory | Contains supporting services. Currently scoped to the Python analytics service. |
| `docs/` | Directory | Centralized location for all project documentation. |
| `tests/` | Directory | Organized container for future automated and manual test assets, grouped by component. |
| `scripts/` | Directory | Placeholder for future utility, setup, build, or maintenance scripts. |
| `.github/` | Directory | GitHub-specific configuration for collaboration (issue templates and workflows). |
| `.gitignore` | File | Defines files and directories to exclude from version control (build artifacts, dependencies, secrets, local environment files, IDE/OS artifacts). |
| `README.md` | File | Provides a concise project overview, technology stack, marketplace modes, and reference to detailed structure documentation. |

## E. Application Boundaries

### Planned Application Responsibilities

- **`apps/web/`** – Hosts the Next.js frontend application. This is the user-facing interface for all four marketplace modes. It is responsible for rendering UI, handling client-side interactions, and consuming the backend API.
- **`apps/api/`** – Hosts the ASP.NET Core Web API. This is the unified backend for the entire CONFLUMIX platform. It centralizes business logic, validation, authorization, data access, and serves as the single integration point for the frontend.
- **`services/analytics/`** – Hosts the Python FastAPI analytics service. This is a dedicated service focused on data processing, statistical analysis, and visualization to meet the data science academic requirements.

### Planned Communication Flow

The following illustrates the intended logical communication direction between components:

```text
Next.js Frontend (apps/web)
       │
       │ HTTPS / REST API
       ▼
ASP.NET Core Web API (apps/api)
       │
       ├─── PostgreSQL / Supabase  (Data Persistence & Auth)
       │
       └─── Python FastAPI Analytics Service (services/analytics)
```

**Important boundaries:**

- This is a **planned logical relationship only**—no integration code, endpoints, or contracts have been implemented in this structural task.
- The frontend **must not** directly access the database using privileged credentials.
- The frontend **must not** call the analytics service as a substitute for the backend API. The backend remains the authoritative boundary for business operations.

## F. Marketplace Module Organization

CONFLUMIX consists of **four finalized marketplace modes** operating as distinct business modules within a **single, unified platform**:

1. **New Product Marketplace** – Facilitates transactions for brand-new products within the local exchange ecosystem.
2. **Reuse / Old Product Marketplace** – Promotes sustainability by enabling resale and reuse of pre-owned items.
3. **Task & Soft Skills Marketplace** – Connects users for short-term tasks, freelance work, and skill-based services.
4. **Donation & Social Impact Network** – Supports donation-based exchanges and community-driven social impact initiatives.

These modules will share common platform capabilities (users, locations, listings, transactions, matching, reviews, and analytics) rather than existing as four separate applications or backend projects. For this initial structure, these modes are represented as **architectural concepts only** in documentation—no source files or implementations have been created.

### F.1 Implemented frontend routes — Shared account and Groups 03–05

| Page ID | Page | Route | Status | Shared dependencies |
|---|---|---|---|---|
| USER-01 | Personal Dashboard and Seller Center entry | `/dashboard` | Implemented as a frontend account overview with honest unavailable states for unimplemented account data and future Seller Center destinations | `PublicShell`, shared account language, existing marketplace routes |
| USER-02 | Seller marketplace selection | `/become-a-seller` | Implemented as an authenticated buyer-to-seller entry with independent New Product, Reuse, and Both intent; Reuse records interest only and does not create a seller profile | `BecomeASellerPage`, account-scoped seller onboarding service, seller route guard |
| NPM-04A | New Product Seller Profile Setup | `/dashboard/seller-center/setup` | Implemented as a four-step browser-local New Product seller profile with personal/contact details, memory-only identity document staging, public store details, conditional business fields, fulfilment preferences, agreements, and a successful prototype completion state | `SellerSetupPage`, seller setup service and types |
| NPM-04B | New Product Category and Attribute Configuration | `/dashboard/seller-center/new-products/categories` | Implemented with frontend-session protection, the 23-category catalogue, subcategory selection, template preview, and basic custom parent templates | `CategoryConfigurationPage`, seller setup service, product taxonomy and attribute templates |
| NPM-01 | New Product Marketplace Landing Page | `/new-products` | Implemented with local fixture data | `PublicShell`, `ProductCard`, product catalogue |
| NPM-02 | Browse All New Products | `/new-products/browse` | Implemented with URL-driven frontend search, filters, sorting, and Load More | `PublicShell`, `Breadcrumb`, `ProductCard`, product service |
| NPM-03 | Product Details and Purchase Experience | `/new-products/[productId]` where `productId` accepts a stable fixture ID or slug | Implemented with local variants, gallery, requirement checking, deterministic alternatives, evidence summary, and page-local prototype cart | `PublicShell`, `ProductCard`, product details fixture, product service |
| NPM-04 | Create New Product Listing | `/new-products/sell/new` | Implemented as a browser-local seller prototype with shared profile eligibility, drafts, image previews, validation, variants, enabled-category attributes, and listing preview | `PublicShell`, shared `ProductListingForm`, seller eligibility and listing persistence services |
| NPM-05 | Edit Product Listing | `/new-products/sell/[productId]/edit` | Implemented for fixture IDs/slugs and locally stored listing IDs, preserving stable identifiers and safely identifying disabled existing categories | `PublicShell`, shared `ProductListingForm`, seller eligibility, product and listing services |
| NPM-06 | Product Listing Quality Check | `/new-products/sell/[productId]/quality` | Implemented as a responsive browser-local pre-publication checklist with completeness scoring, quick-fix editor links, category attributes, and simulated publication | `ProductQualityCheck`, product listing and seller setup services, category attribute templates |
| NPM-07 | Seller Storefront | `/stores/[storeId]` | Implemented with a safe public-store selector, product filtering, category controls, policies, branding fallbacks, and invalid/empty states | `StorefrontPage`, storefront service and types, shared `ProductCard` |
| NPM-08 | New Product Seller Dashboard | `/dashboard/new-products` | Implemented as the private frontend-session seller overview with setup status, derived catalogue/order counts, inventory alerts, activity, and honest future-action states | `SellerDashboardPage`, seller setup/listing services, storefront prototype service |
| NPM-09 | Manage New Product Listings | `/dashboard/new-products/products` | Implemented with seller-scoped listing search, combined filters and sorting, responsive table/cards, page selection, row actions, CSV export, and safe inline bulk previews | `ListingManagementPage`, listing management service and typed bulk-operation models |
| NPM-10 | Safe Bulk Operation Preview | `/dashboard/new-products/bulk-preview` | Implemented as a seller-bound review checkpoint with current-state validation, stale-preview refresh, eligibility/exclusion details, expected impact, final confirmation, and local execution results | `BulkPreviewPage`, shared listing-management service and typed operation lifecycle models |
| NPM-11 | Bulk Operation Result and Rollback | `/dashboard/new-products/activity` | Implemented with seller-scoped operation history, record details, field-level rollback assessment, stale confirmation protection, partial restoration, and linked rollback records | `OperationHistoryPage`, shared listing-management history and rollback service/models |
| NPM-12 | Import and Export Products | `/dashboard/new-products/import-export` | Implemented with local CSV/XLSX parsing, mapping, seller/category validation, duplicate detection, row reports, confirmed draft creation, templates, filtered CSV/XLSX export, and formula-injection protection | `ImportExportPage`, import-export service and typed session/result models, shared listing persistence |

The seller workflow is NPM-04A Seller Profile Setup → NPM-04B Category Configuration → NPM-04 Create Listing → NPM-05 Edit Listing. Profile completion and category completion are separate eligibility checks, so listing pages route users to the specific missing step. NPM-04 and NPM-05 reuse one seller form and one listing-eligibility rule. Their saves use development-only browser storage; selected listing images and public store branding are converted to reload-safe data URLs, while CNIC documents remain memory-only. Published active local listings feed the public landing, browse, detail, and storefront routes through one catalogue selector. NPM-04A and NPM-04B require the frontend test session, but server-backed authorization, ownership enforcement, permanent object storage, checkout, payment, and server-backed reviews remain unimplemented.

The approved 23-category New Product public taxonomy is centralized in `apps/web/src/data/product-taxonomy.ts`; reusable parent and subcategory attribute fields are centralized in `apps/web/src/data/product-attribute-templates.ts`. NPM-04B exclusively owns New Product category and subcategory configuration. Non-sensitive seller profile fields, completion metadata, and category templates use the typed browser-local boundary in `apps/web/src/services/seller-setup.ts`. CNIC numbers, identity image objects, and their previews stay in component memory and are never written to browser storage, query strings, public assets, listings, or public profile fixtures. Email verification will be supplied by backend authentication later; phone verification is not part of the seller-profile workflow. Reuse seller profile setup is outside the current scope.

Seller state is buyer-first and account-scoped. Authentication creates no seller record. `/become-a-seller` stores marketplace intent separately from actual onboarding completion; New Product intent unlocks only the supported onboarding steps, while Reuse intent stores a future-registration interest without creating or reusing a New Product profile. Shared route layouts protect Seller Center, New Product management, and listing-authoring routes from direct URL access and send incomplete users to their next required step.

The New Product Seller Center uses one persistent navigation surface supplied by `PublicShell` and `SellerSidebar` for dashboard, listing management, import/export, orders, returns, promotions, bulk operations, profile settings, and category settings. Desktop uses a sticky left sidebar; smaller viewports use an accessible drawer. Focused listing creation/editing and public storefront pages remain outside the workspace shell.

NPM-04B stores category-specific custom attribute definitions alongside selected field names. Text, number, boolean, single-select, and multi-select definitions are supported; selection fields require at least two unique options. Safe removal deletes the field only from future forms, while attributes referenced by existing listings are protected. Saving completes category setup and navigates to NPM-08 rather than listing creation.

## G. Documentation Organization

The following directories are placeholders for future documentation. **No detailed documentation files have been authored** during this structural task:

| Directory | Intended Purpose |
|-----------|-----------------|
| `docs/requirements/` | Future capture of functional and non-functional requirements. |
| `docs/architecture/` | Future high-level and component-level architecture documentation. |
| `docs/diagrams/` | Future visual artifacts (e.g., system diagrams, flowcharts, entity relationships). |
| `docs/api/` | Future API reference documentation, contracts, and usage guidelines. |
| `docs/data-science/` | Future data science methodology, analysis, experiments, and findings. |
| `docs/testing/` | Future testing strategy, test plans, and testing guidelines. |
| `docs/project-management/` | Future project planning, timelines, meeting notes, and coordination artifacts. |

## H. Testing Organization

The `tests/` directory is structured to accommodate future test assets by component. **No test cases, frameworks, or configurations have been created** at this stage:

| Directory | Intended Purpose |
|-----------|-----------------|
| `tests/frontend/` | Future frontend unit, integration, and end-to-end tests. |
| `tests/backend/` | Future backend unit, integration, and API tests for the ASP.NET Core Web API. |
| `tests/analytics/` | Future tests for the Python FastAPI analytics service, including data processing and analysis validation. |

## I. Future Development Boundaries

This structural task establishes **only** the initial repository organization. It does **not** define or implement:

- Detailed requirements, use cases, or user stories
- Database schemas, tables, migrations, or seed data
- API endpoints, contracts, or detailed request/response models
- Security implementation (authentication flows, authorization policies, encryption, or hardening)
- Data Structures and Algorithms (DSA) implementations
- Data Science workflows, models, or analytical algorithms
- Deployment configurations, CI/CD pipelines, or infrastructure-as-code
- Application source code for any of the planned components

The framework-specific layouts (`apps/web`, `apps/api`, `services/analytics`) will be established when each application is initialized in a later task.

## J. Structural Maintenance Rules

To maintain a clean, scalable, and professional repository, the following rules should be observed:

1. **Maintain clear application boundaries** – Keep frontend, backend API, and analytics service in their designated locations.
2. **Preserve a unified platform** – The four marketplace modes must remain as modules within the single unified CONFLUMIX platform; avoid splitting them into separate applications.
3. **Isolate analytics concerns** – Keep the Python analytics service separate from the C# API to respect their distinct technology stacks and responsibilities.
4. **Centralize documentation** – Place all project documentation under `docs/` with appropriate subdirectories.
5. **Organize tests by component** – Add test assets to the corresponding `tests/` subdirectory (frontend, backend, or analytics).
6. **Never commit secrets** – Do not commit passwords, private keys, API tokens, credentials, or populated local environment files (`.env*`, key files, etc.).
7. **Avoid unnecessary placeholders** – Only create minimal placeholder files (e.g., `.gitkeep`) when strictly necessary to preserve empty directories in Git. Avoid creating dummy source code, fake datasets, or speculative artifacts.
8. **Minimize duplication** – Avoid redundant directory structures, duplicate placeholder files, or unnecessary nesting.
9. **Keep structure accurate** – Update this document (`docs/structure.md`) if the actual directory structure changes materially in future work.
10. **Adhere to the agreed stack** – Do not introduce unapproved technologies, frameworks, or folders outside the agreed scope.

## Group 12 — Promotion Management

- Route: `apps/web/src/app/dashboard/new-products/promotions/page.tsx` (`/dashboard/new-products/promotions`).
- Interface: `apps/web/src/components/seller/promotion-management-page.tsx` contains the promotion list, create/edit form, scope selector, preview, conflict explanations, activation blocking, and deactivation confirmation.
- Models and shared logic: `apps/web/src/types/promotions.ts` and `apps/web/src/services/promotions.ts` define lifecycle state, browser-local persistence, seller filtering, pricing, validation, applicability, and conflict detection.
- Integrations: the NPM-09 listing page, NPM-07 storefront, and NPM-08 seller dashboard consume the shared promotion service. Responsive styles are in `apps/web/src/app/public.css`.
- Prototype boundary: promotion records use browser local storage. Server authorization, transactional conflict enforcement, concurrency control, and promotion analytics remain backend work.

## Group 13 — Orders and Order Details

- Routes: `apps/web/src/app/dashboard/new-products/orders/page.tsx` and `apps/web/src/app/dashboard/new-products/orders/[orderId]/page.tsx` implement `/dashboard/new-products/orders` and its seller-authorized detail route.
- Interfaces: `apps/web/src/components/seller/orders-page.tsx` provides search, status filtering, sorting, summary counts, desktop rows, mobile cards, loading, empty, no-result, and unauthorized states. `order-details-page.tsx` provides item snapshots, buyer contact scope, policy/payment boundaries, timeline, supported transitions, cancellation, and seller return decisions.
- Models and service: `apps/web/src/types/orders.ts` defines order, item snapshot, history, cancellation, and return records. `apps/web/src/services/orders.ts` is the shared browser-local checkout/order boundary, seller-scoped reader, optimistic-state validator, transition service, and history writer.
- Dashboard integration: `seller-dashboard-page.tsx` now reads the shared order source for counts and recent orders; disconnected dashboard sample orders were removed.
- Current boundary: no checkout route or buyer order surface exists. `createOrderFromCheckout` is ready for a future demo checkout, but no orders are seeded or fabricated. Inventory is not reserved or restored, and there is no payment, refund, carrier, or remote persistence integration.

## Group 14 — Returns and Purchase Failure Insights

- Route: `apps/web/src/app/dashboard/new-products/returns/page.tsx` implements `/dashboard/new-products/returns`.
- Interface: `apps/web/src/components/seller/returns-insights-page.tsx` provides shared date/reason filters, distinct-request metrics, reason distribution, cautious trend handling, product/category summaries, evidence-based seller observations, return/order navigation, unavailable-product handling, purchase-failure instrumentation state, and filtered CSV export.
- Analytics boundary: `apps/web/src/services/return-analytics.ts` reads seller-scoped NPM-14 orders, normalizes structured and legacy reasons, deduplicates return requests, filters by request date, aggregates reasons/products/categories, applies minimum evidence rules, and exports non-sensitive records. Supporting result types are in `apps/web/src/types/return-analytics.ts`.
- The NPM-14 `ReturnReason` union now uses the nine approved categories. Unknown historical strings are preserved as Unclassified rather than guessed.
- Dashboard integration: the seller dashboard displays the actual return-request count and links to NPM-15.
- Boundary: there are no seeded returns, checkout-failure events, public buyer warnings, predictive models, or reliable cohort denominators for return rates.

This concludes the structural specification for the CONFLUMIX repository.
# New Product Shop Sections

- `/dashboard/new-products/sections` is the shared Seller Center management route for flat, seller-defined storefront sections.
- `apps/web/src/services/shop-sections.ts` owns browser-local section validation, the per-store 30-section limit, ordering, rename, and safe deletion behavior.
- `apps/web/src/types/shop-section.ts` defines the store-owned section record. New Product listing records carry optional `storeId` and `sectionId` relationships.
- Shop sections are independent from the marketplace category taxonomy and are not shared with Reuse or unrelated stores.
