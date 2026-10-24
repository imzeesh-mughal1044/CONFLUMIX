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
