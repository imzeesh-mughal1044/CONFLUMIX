# CONFLUMIX — UI/UX Design System Brief

**Document:** `UI/UX_brief.md`
**Product:** CONFLUMIX
**Document purpose:** Official frontend visual and interaction specification
**Status:** Approved design direction
**Primary theme:** Deep Teal + Signal Orange
**Primary background:** Cool White
**Design philosophy:** Unified, accessible, trustworthy, efficient, consistent, and responsive.

> **Repository context note (read first).** The frontend is implemented in `apps/web/` with Next.js, React, TypeScript, and Tailwind CSS and targets Vercel. This document is the active standard for that implementation.

## Marketplace-First Design Philosophy — Global Frontend Standard

CONFLUMIX is one unified marketplace for new products, reuse, tasks and skills, and donations. Branding supports discovery; it never competes with it. Public discovery pages prioritize, in order: compact navigation and search, comprehensible modes/categories, real listings, filters and sorting, then supporting marketing. A user must see useful marketplace content without first crossing an oversized promotional hero.

- Marketing explains the proposition briefly; marketplace discovery shows actual records, prices or budgets, conditions, availability, location, and the next action. Never substitute abstract decoration, fake metrics, ratings, testimonials, demand, or activity for real or clearly labeled demonstration data.
- New-product cards prioritize image, title, price, stock, seller, and locality. Reuse adds condition. Tasks prioritize outcome, budget, skill, work style, and status. Donations distinguish offer from need and show quantity, condition when known, organization, urgency, and locality. These types share tokens and chrome but must not be flattened into semantically identical cards.
- The header remains compact and predictable: official `CONFLUMIX_nav.png`, Marketplace and four mode destinations, searchable discovery, locality, and account access. Mobile uses a functional menu rather than silently removing navigation. The footer repeats only useful discovery, account, trust, and legal destinations.
- Layout is mobile-first at 360 px and enhanced at 390 px, tablet, 1280 px, and 1440 px. Phone listing grids use two equal columns with 8–12 px gaps; images remain prominent and text truncates safely. No document-level horizontal scrolling is permitted. Controls remain at least 44 × 44 CSS pixels and grid/flex children use `min-width: 0`.
- Local informative imagery uses meaningful alt text, reserved dimensions, framework optimization, appropriate crops, and a reliable fallback. Product/reuse cards default to square crops; banners may be landscape. Do not stretch images, use unrelated stock, or repeat one generic image across the catalogue.
- Search submits to a shareable URL. Filters, mode tabs, locality, sorting, pagination/load-more, and clear actions preserve compatible query state and browser navigation. Desktop uses an inline filter panel; mobile uses an accessible drawer with explicit open and close controls.
- Shared tokens govern deep teal and signal orange, surfaces, text, borders, semantic states, 4 px spacing, restrained 8–14 px radii, focus rings, and elevation. Shared shell, search, cards, explorer, tabs, drawers, empty states, and dialogs are reused instead of reimplemented per page.
- Typography uses **Neue Montreal** as the single product typeface. Desktop page headings normally stay within 30–38 px unless a specific composition justifies otherwise; mobile headings are 26–30 px, sections 22–28 px, body 15–17 px, and controls 14–16 px. Listing typography favors scanning over editorial scale.
- Motion communicates state only: short CSS transitions for hover, focus, drawers, and dialogs. No decorative floating, continuous motion, large staggered entrances, or interaction delays. Respect `prefers-reduced-motion`.
- Desktop marketplace density uses five cards per row for featured homepage collections and four cards per row for explorer/discovery results when the available content width supports it. Phone layouts remain two columns. This density rule is the default for future marketplace groups.
- Promotional carousels may contain three or four purposeful marketplace campaigns. They auto-advance at a calm interval, provide previous/next and direct-selection controls, pause during pointer or keyboard interaction, use local optimized imagery, and disable sliding motion when reduced motion is requested.
- Homepage mode quick access begins as four compact controls. Selecting one expands in place to show a close control, mode image and explanation, real records for that mode, and a route to the complete filtered marketplace.
- Loading reserves final layout with skeletons; empty states explain recovery; errors identify cause and next action; success states confirm the completed action without fabricating outcomes.
- Semantic HTML, logical headings, keyboard operation, visible focus, labeled inputs and icon buttons, useful alt text, sufficient contrast, non-color status cues, Escape dismissal, and focus-safe sticky/overlay UI are required.
- Avoid generic AI/SaaS motifs: giant abstract heroes, ornamental arcs, glows, glass surfaces, decorative badges, excessive gradients, unnecessary pills, repetitive rounded panels, and empty spacing that delays useful content.
- Future groups must extend the same tokens, shell, responsive rules, entity hierarchy, URL conventions, state patterns, and honest-data standard. Deviations require a documented product reason.

### Marketplace design review checklist

- Does the first screen make search, locality, modes, and actual inventory easy to find?
- Are every image, title, value, status, and action relevant to the record and free from fabricated claims?
- Do product, reuse, task, and donation records expose their distinct decision-making metadata?
- Do header, footer, filters, tabs, sorting, pagination, dialogs, and browser Back/Forward behave predictably?
- Are loading, empty, error, and success states useful and honest?
- Does keyboard navigation, focus, contrast, alt text, reduced motion, and 44 px target sizing pass review?
- At 360 × 740 and 390 × 844, are two listing cards visible side by side with no horizontal overflow?
- At 1280 × 800 and 1440 × 900, is the layout dense, aligned, image-led, and recognizably a marketplace?

---

## Table of Contents

1. [Product Identity and Design Philosophy](#1-product-identity-and-design-philosophy)
2. [Official Brand Color Palette](#2-official-brand-color-palette)
3. [Logo and Brand Asset Rules](#3-logo-and-brand-asset-rules)
4. [Typography System](#4-typography-system)
5. [Spacing, Layout, and Grid](#5-spacing-layout-and-grid)
6. [Border Radius, Borders, and Shadows](#6-border-radius-borders-and-shadows)
7. [Buttons](#7-buttons)
8. [Navigation Bar](#8-navigation-bar)
9. [Marketplace Mode Identity](#9-marketplace-mode-identity)
10. [Cards and Content Containers](#10-cards-and-content-containers)
11. [Forms, Inputs, and Validation](#11-forms-inputs-and-validation)
12. [Dropdowns, Menus, Tabs, and Filters](#12-dropdowns-menus-tabs-and-filters)
13. [Badges, Chips, and Status Indicators](#13-badges-chips-and-status-indicators)
14. [Icons and Imagery](#14-icons-and-imagery)
15. [Animation and Transition System](#15-animation-and-transition-system)
16. [Hover, Focus, Active, Selected, and Disabled States](#16-hover-focus-active-selected-and-disabled-states)
17. [Tables, Pagination, and Data-Heavy Interfaces](#17-tables-pagination-and-data-heavy-interfaces)
18. [Modals, Drawers, Toasts, and Notifications](#18-modals-drawers-toasts-and-notifications)
19. [Empty, Loading, Error, and Success States](#19-empty-loading-error-and-success-states)
20. [Responsive Design](#20-responsive-design)
21. [Accessibility Requirements](#21-accessibility-requirements)
22. [Data Visualization and Analytics Pages](#22-data-visualization-and-analytics-pages)
23. [Content and Microcopy](#23-content-and-microcopy)
24. [Design Tokens and Component Architecture](#24-design-tokens-and-component-architecture)
25. [Suggested Tailwind/CSS Usage](#25-suggested-tailwindcss-usage)
26. [Performance and Visual Stability](#26-performance-and-visual-stability)
27. [Anti-Patterns to Avoid](#27-anti-patterns-to-avoid)
28. [Page-Level Design Checklist](#28-page-level-design-checklist)
29. [Definition of Done](#29-definition-of-done)
30. [Repository-Specific Implementation Notes](#30-repository-specific-implementation-notes)

---

## 1. Product Identity and Design Philosophy

### 1.1 What is CONFLUMIX?

CONFLUMIX is a unified multi-mode marketplace for local exchange. It brings four forms of exchange into one platform:

1. New Product Marketplace
2. Reuse / Old Product Marketplace
3. Task & Soft Skills Marketplace
4. Donation & Social Impact Network

> **Naming note.** The product requirements document (`docs/requirements/PRD.md`) uses the official mode name **“Task & Soft Skills Marketplace.”** Some design drafts refer to it as **“Task & Skill Marketplace.”** This brief uses the PRD's official name (**Task & Soft Skills Marketplace**) for consistency. Where a shorter label is needed in the UI, “Tasks” is acceptable as a navigational shorthand, but the full official name should be used in headings and documentation.

Its core identity is:

**One Platform. Four Modes of Exchange. One Shared Data Ecosystem.**

The interface must communicate that these are connected parts of a single platform, not four separate applications.

### 1.2 Design objectives

The visual system must:

- Establish trust through a consistent, professional appearance.
- Make marketplace discovery and navigation intuitive.
- Make the four modes recognizable without creating four unrelated themes.
- Maintain clear visual hierarchy and readable typography.
- Make important actions easy to identify.
- Keep data-heavy pages organized and understandable.
- Support desktop, tablet, and mobile screens.
- Make interactive states predictable and accessible.
- Avoid unnecessary visual noise, excessive gradients, excessive shadows, and distracting motion.
- Support future features without requiring a complete redesign.

### 1.3 Visual personality

CONFLUMIX should feel:

- Trustworthy rather than corporate and cold.
- Modern rather than trendy or gimmicky.
- Energetic without excessive orange.
- Structured without appearing overly rigid.
- Friendly without using childish illustrations or excessive rounded shapes.
- Data-aware without making ordinary marketplace pages feel like analytics dashboards.

The interface should use clean typography, carefully spaced layouts, strong alignment, restrained color, meaningful icons, and consistent interaction patterns.

### 1.4 Core design principle

**Deep Teal establishes the brand. Signal Orange directs attention. Cool White provides breathing room.**

Do not use every brand color in every component. Most pages should primarily use white, cool white, teal, dark text, and subtle borders. Orange should be used selectively for emphasis and high-priority actions.

---

## 2. Official Brand Color Palette

The following colors are the approved foundational palette. Treat these values as canonical.

### 2.1 Brand colors

| Token | Hex | Usage |
|---|---|---|
| Brand Primary | `#0B5D63` | Main brand color, primary buttons, active navigation, key icons |
| Brand Primary Hover | `#08484D` | Hover state for teal controls |
| Brand Primary Active | `#063A3E` | Pressed state for teal controls |
| Brand Primary Light | `#E2F0F0` | Selected backgrounds, subtle teal surfaces |
| Brand Primary Subtle | `#F0F7F7` | Very light brand-tinted sections |
| Brand Accent | `#FF6B2C` | Brand accent, important highlights, selected promotional elements |
| Brand Accent Hover | `#E85B20` | Hover state for orange controls |
| Brand Accent Active | `#CC4D19` | Pressed state for orange controls |
| Brand Accent Light | `#FFF0E8` | Orange-tinted badges and subtle highlights |
| Brand Accent Subtle | `#FFF7F2` | Very subtle accent backgrounds |

### 2.2 Neutral palette

| Token | Hex | Usage |
|---|---|---|
| Background Page | `#F3F6F6` | Default page background |
| Surface Default | `#FFFFFF` | Cards, forms, navbar, dialogs |
| Surface Subtle | `#EAF0F0` | Secondary sections and muted containers |
| Border Default | `#DDE4E5` | Card borders, separators, input borders |
| Border Strong | `#C9D4D5` | More visible form and component boundaries |
| Border Interactive | `#8DA6A8` | Hovered form fields and interactive outlines |
| Text Primary | `#14201F` | Headings, body text, important labels |
| Text Secondary | `#526365` | Descriptions, secondary labels, supporting information |
| Text Muted | `#718083` | Helper text, timestamps, low-emphasis metadata |
| Text On Dark | `#FFFFFF` | Text on sufficiently dark teal surfaces |
| Disabled Background | `#E6EAEB` | Disabled controls |
| Disabled Text | `#929B9D` | Disabled labels and icons |

Do not use `#DDE4E5` for normal body text on white. It is a border color, not a readable text color.

### 2.3 Semantic status colors

Status colors communicate meaning and must not replace the brand palette.

| Status | Foreground | Background | Border |
|---|---|---|---|
| Success | `#237A57` | `#E7F5EC` | `#B8E0C7` |
| Warning | `#8A4B08` | `#FFF4D6` | `#F0D99A` |
| Error | `#B42318` | `#FEECEB` | `#F5C2BE` |
| Information | `#176B87` | `#E8F4F8` | `#B8DCE8` |

Use both text and an appropriate icon or status label to communicate important states. Never rely on color alone.

Examples:

- Success: “Listing published successfully.”
- Warning: “This listing is missing required specifications.”
- Error: “We couldn't save your changes.”
- Information: “Your offer expires in 12 hours.”

Warnings must remain distinct from ordinary orange brand accents. Use the semantic warning palette for actual warnings.

### 2.4 Chart and visualization palette

Use the following palette for charts and data visualizations:

| Token | Hex |
|---|---|
| Chart Teal | `#0B5D63` |
| Chart Orange | `#FF6B2C` |
| Chart Dark | `#14201F` |
| Chart Muted Teal | `#6C9A9C` |
| Chart Gold | `#C9A227` |
| Chart Neutral | `#8A9698` |

Rules:

- Use color consistently across charts.
- Use labels, legends, markers, and patterns when necessary.
- Ensure distinguishability for color-vision deficiencies.
- Avoid using orange for every series.
- Use semantic status colors only when the data represents those statuses.
- Keep chart backgrounds white or very lightly tinted.
- Avoid unnecessary 3D charts and decorative gradients.

### 2.5 CSS custom properties

The frontend should expose canonical colors through centralized design tokens. Adapt the syntax to the existing styling system.

```css
:root {
  /* Brand */
  --color-brand-primary: #0B5D63;
  --color-brand-primary-hover: #08484D;
  --color-brand-primary-active: #063A3E;
  --color-brand-primary-light: #E2F0F0;
  --color-brand-primary-subtle: #F0F7F7;

  --color-brand-accent: #FF6B2C;
  --color-brand-accent-hover: #E85B20;
  --color-brand-accent-active: #CC4D19;
  --color-brand-accent-light: #FFF0E8;
  --color-brand-accent-subtle: #FFF7F2;

  /* Surfaces */
  --color-background: #F3F6F6;
  --color-surface: #FFFFFF;
  --color-surface-subtle: #EAF0F0;

  /* Borders */
  --color-border: #DDE4E5;
  --color-border-strong: #C9D4D5;
  --color-border-interactive: #8DA6A8;

  /* Text */
  --color-text-primary: #14201F;
  --color-text-secondary: #526365;
  --color-text-muted: #718083;
  --color-text-on-dark: #FFFFFF;

  /* Disabled */
  --color-disabled-background: #E6EAEB;
  --color-disabled-text: #929B9D;

  /* Status */
  --color-success: #237A57;
  --color-success-background: #E7F5EC;
  --color-success-border: #B8E0C7;

  --color-warning: #8A4B08;
  --color-warning-background: #FFF4D6;
  --color-warning-border: #F0D99A;

  --color-error: #B42318;
  --color-error-background: #FEECEB;
  --color-error-border: #F5C2BE;

  --color-info: #176B87;
  --color-info-background: #E8F4F8;
  --color-info-border: #B8DCE8;
}
```

All component styles should reference these tokens rather than duplicating hex codes throughout the application.

If Tailwind CSS is already configured, map these values into the existing Tailwind theme or CSS-variable approach. Do not create competing token systems.

---

## 3. Logo and Brand Asset Rules

### 3.0 Universal frontend logo asset

`CONFLUMIX_nav.png` is the mandatory logo for every logo placement in the web application, including navigation, headers, authentication screens, and shared application chrome. The source asset lives at the repository root and its deployable copy must remain at `apps/web/public/CONFLUMIX_nav.png`.

- Preserve the file's transparent background and intrinsic `990:185` aspect ratio.
- Do not add a white card, pill, shadow, border, or decorative container behind the logo.
- Do not stretch, crop, recolor, redraw, or replace it with text or another brand file.
- Size it responsively and reserve its dimensions to prevent layout shift.
- Keep sufficient clear space around the artwork and place it only where the original teal and orange artwork remains legible.

### 3.1 Official logo

The official CONFLUMIX logo consists of:

- An interlocking teal-and-orange symbol.
- The wordmark `CONFLUMIX`.
- `CONFLU` in Deep Teal.
- `MIX` in Signal Orange.
- A white background for the approved navbar presentation.

Use the supplied original logo asset whenever available. Do not redraw, approximate, distort, or replace the official mark with a generic infinity icon.

### 3.2 Navbar logo

- Use the horizontal logo lockup.
- Preserve the original aspect ratio.
- Do not add a tagline to the compact navbar logo.
- Do not stretch the image to fill a fixed-width and fixed-height box simultaneously.
- Keep enough space around the logo to avoid crowding navigation.
- Prefer a transparent-background production asset if one is available and approved; otherwise, retain the approved white-background asset.
- Do not create a different logo for each marketplace mode.

Recommended desktop logo height: approximately 38–46 px, adjusted to the actual asset proportions and navbar height.

Recommended compact mobile logo height: approximately 30–36 px.

### 3.3 Favicon

- Use the exact interlocking symbol from the official logo.
- Do not include the wordmark at favicon sizes.
- Prefer a square, centered symbol with enough internal whitespace to remain legible at 16 × 16 px.
- Use the approved teal and orange colors.
- Use a white background when following the approved white-background favicon variant.
- Generate the required favicon sizes from the actual source asset rather than approximating the logo manually.

Suggested outputs: `favicon.ico`, `favicon.svg` if a verified vector asset is available, and PNG sizes such as 16 × 16, 32 × 32, and 48 × 48.

Only generate or modify logo assets when the source file is available and the result can be verified.

> **Repository assets present at the time of writing (root directory):** `CONFLUMIX.jpeg`, `CONFLUMIX - brand.jpeg`, `CONFLUMIX - icon.jpeg`, `CONFLUMIX_nav.png` (navbar lockup), `CONFLUMIX_iden.png` (identity lockup), and `CONFLUMIX_fav.png` (favicon source). Treat these as the authoritative brand assets. When `apps/web/` is scaffolded, these should be moved into the frontend's `public/` (or equivalent static asset) directory rather than referenced from the repository root. Do not regenerate or approximate logos unless a verified source is available.

---

## 4. Typography System

### 4.1 Typography direction

Use **Neue Montreal** as the single primary typeface throughout CONFLUMIX.

Neue Montreal gives CONFLUMIX a distinctive, contemporary, confident, refined, and professional identity while remaining human, clean, and highly usable for a content-heavy multi-mode marketplace. Use it consistently across the product. Create hierarchy with Neue Montreal itself through size, weight, spacing, and composition rather than introducing another display or interface family.

**Do not add a second typeface.** Do not substitute a sans-serif for "clarity" in dense areas, and do not add a display or accent face for marketing surfaces. Hierarchy, density, and emphasis are solved with scale, weight, spacing, and layout.

The interface should feel:

- Refined
- Professional
- Distinctive
- Contemporary
- Confident
- Clean
- Human
- Marketplace-focused

Avoid making the interface look like a generic AI-generated SaaS website.

Specifically, do not use excessively large hero typography, unnecessary bold text, excessive uppercase text, exaggerated letter spacing, or too many different text sizes.

Maintain a clear hierarchy between page titles, section headings, card titles, body text, labels, metadata, and supporting information:

| Level | Purpose |
|---|---|
| Page title | One per page. |
| Section heading | Groups content within a page. |
| Card title | Product, task, donation, and metric card titles. |
| Body text | Descriptions, instructions, and long-form content. |
| Label | Form labels, table headers, filter names, button text. |
| Metadata | Timestamps, locations, counts, helper text. |

The typography must work with the actual content density of CONFLUMIX, especially product listings, task listings, donation listings, forms, dashboards, filters, tables, and analytics.

### 4.2 Where Neue Montreal is applied

Apply Neue Montreal to every typographic surface, including:

- Main page headings.
- Section headings.
- Product, reuse, task, and donation listing titles.
- Product prices and marketplace data.
- Navigation.
- Buttons.
- Search, filters, sorting controls, forms, input fields, and labels.
- Body text.
- Supporting text.
- Cards.
- Status badges, dashboard content, analytics, tables, dialogs, notifications, metadata, and other supporting interface text.

There are no typographic exceptions inside the product. Logos, icons, charts, and imagery are the only non-typographic elements.

### 4.3 Font availability, loading, and fallback

> **Repository note:** The frontend is scaffolded and configured to request Neue Montreal as its primary family. No licensed Neue Montreal font files are currently present in the repository. To guarantee identical rendering across platforms, obtain properly licensed WOFF2 files from the rights holder and serve them locally. Until those assets are supplied, the browser uses the declared neutral system sans-serif fallback without presenting it as Neue Montreal.

Implementation guidance:

- Use `next/font/local` with licensed Neue Montreal WOFF2 files when they are supplied. Do not replace Neue Montreal with a visually similar webfont or introduce a second branded family.
- Declare only the weights that exist: `400` (Regular), `500` (Medium), `600` (Semibold), `700` (Bold). Add italic files only if italic is used under the rules in §4.5.
- Set `display: "swap"` and preload the regular and semibold files.
- Do not synthesize bold or italic in the browser. If a weight is missing, use a real available weight instead of a faux one.
- Fallback stack for platforms without the font:

```css
--font-family-primary: "Neue Montreal", "Helvetica Neue", Arial, sans-serif;
```

- Expect the fallback to have different metrics. Avoid layouts that depend on exact glyph widths (for example, fixed-width buttons sized from their text) and verify wrapping in the fallback before release.
- In Figma, install the licensed Neue Montreal family for the design team, create shared library styles, and distribute those styles through the team library rather than as per-file copies.

### 4.4 Type scale

Neue Montreal has clear, contemporary proportions suited to dense interfaces. The scale below balances marketplace scanning, readable descriptions, compact controls, and confident headings without turning the product into an oversized landing-page composition.

| Style | Desktop | Tablet (768–1024) | Mobile (360–740) | Weight | Line height | Tracking |
|---|---:|---:|---:|---:|---:|---:|
| Display | 44–52 px | 40–46 px | 32–36 px | 600 | 1.15 | -0.01em |
| H1 — page title | 34–40 px | 32–36 px | 28–30 px | 600 | 1.2 | -0.01em |
| H2 — section heading | 26–30 px | 24–28 px | 22–26 px | 600 | 1.25 | 0 |
| H3 — card / subsection title | 21–23 px | 20–22 px | 19–21 px | 600 | 1.3 | 0 |
| H4 — label heading | 18–20 px | 18–20 px | 17–18 px | 600 | 1.35 | 0 |
| Body Large | 18–19 px | 18–19 px | 17–18 px | 400 | 1.6 | 0 |
| Body | 17 px | 17 px | 16–17 px | 400 | 1.6 | 0 |
| Body Small | 15–16 px | 15–16 px | 15 px | 400 | 1.55 | 0 |
| Caption / metadata | 13–14 px | 13–14 px | 13 px | 400 | 1.45 | 0.01em |
| Button | 16 px | 16 px | 15–16 px | 600 | 1.2 | 0.01em |
| Navigation | 16–17 px | 16–17 px | 15–16 px | 500 | 1.3 | 0.01em |
| Price | 22–26 px | 21–24 px | 20–22 px | 600 | 1.15 | 0 |
| Data / table cell | 15–16 px | 15–16 px | 15 px | 400 | 1.45 | 0 |

Rules for using the scale:

- These are guidelines, not a requirement to use every size on every page.
- Use a small, fixed subset of steps in any single view. Do not introduce one-off sizes.
- Display is reserved for sparse, low-density entry points such as a marketplace mode landing header. It must not be used on listing, form, dashboard, or table pages.
- Body text is never smaller than 16 px and metadata is never smaller than 13 px. Do not shrink copy to fit more content into a viewport.
- Small text still requires disciplined contrast and spacing. Prefer fewer, readable labels over dense micro-labels.

### 4.5 Weight, emphasis, and case

Use these available Neue Montreal weights intentionally. Only these roles may be used.

| Weight | Name | Use for |
|---:|---|---|
| 400 | Regular | Body text, descriptions, supporting information, metadata, table cells, and general UI content |
| 500 | Medium | Navigation, filters, input text, labels, tab labels, and moderate emphasis |
| 600 | Semibold | Buttons, card titles, prices, and important interface elements where needed |
| 700 | Bold | Major headings and high-emphasis content only |

Rules:

- Do not use weights below 400 or above 700, and never rely on faux bold.
- Use consistent font weights for equivalent heading levels across all four modes.
- Bold is the scarcest style in the system. If more than one element on a screen needs bold, the hierarchy is wrong. Reduce the number of weights rather than introducing another typeface or size.
- Keep italic limited to rare editorial notes, quotations, and legal or explanatory copy at 16 px and above. Do not use italic for labels, metadata, or compact interface text; use wording, spacing, color, or weight instead.
- Avoid all-uppercase body text and labels. Where a short uppercase overline is used (rare), set it at 12–13 px with modest tracking (`0.06em`), and do not use it for anything a user must read quickly.
- Keep letter spacing neutral. Tracking above `0.08em` is prohibited, and negative tracking is allowed only on Display, H1, and H2 at the values listed in §4.4.
- Use tabular figures for prices, statistics, dates, and any number that appears in columns. Keep proportional figures for running text.

### 4.6 Typography rules

- Use `#14201F` for headings and primary body text.
- Use `#526365` for supporting descriptions.
- Use `#718083` for secondary metadata where contrast remains adequate. At 13–14 px, prefer `#526365` whenever the lighter token does not meet the required contrast.
- Use consistent font weights for equivalent heading levels.
- Avoid all-uppercase body text.
- Reserve letter spacing for compact labels, small overlines, and the tracking values listed in §4.4.
- Use readable paragraph widths: roughly 60–75 characters per line for body text. Listings and cards may be narrower.
- Use tabular numerals for prices, statistics, and time-sensitive numeric information where helpful.
- Avoid excessively thin rendering of small text. If text looks faint against the background, increase the weight to 500 or darken the text color instead of switching typeface.
- Keep numerals, currency symbols, and units aligned in tables and price rows.
- Truncate long titles with an ellipsis rather than wrapping them onto three lines inside a card, and keep the full title available as an accessible name.
- Never use orange body text for lengthy paragraphs on white backgrounds.

### 4.7 Responsive typography

Typography must remain readable and visually balanced at every supported width while preserving the same Neue Montreal identity and hierarchy.

| Viewport | Reference | Typography behavior |
|---|---|---|
| Mobile | 360 × 740 px | H1 28–30 px; H2 22–26 px; body 16–17 px; metadata 13 px. Tighten heading line height rather than body line height. |
| Tablet | 768–1024 px | H1 32–36 px; H2 24–28 px; body 17 px; metadata 13–14 px. |
| Desktop | 1024 px and above | H1 34–40 px; H2 26–30 px; body 17 px; metadata 13–14 px. |

Rules:

- Scale type down, never below the floors in §4.4.
- Keep the same hierarchy order and the same weight assignments across breakpoints. Only size, line height, and spacing change.
- Reduce paragraph measure on wide screens instead of increasing body size.
- Keep body line height generous on small screens (1.55–1.65), where longer words wrap earlier.
- Never reduce metadata below 13 px to fit a filter row. Let the row wrap or scroll instead.
- Verify product listings, task listings, donation listings, forms, dashboards, filters, tables, and analytics screens at 360 px, 768 px, 1024 px, and 1440 px.

### 4.8 Reusable text styles

Create the following as reusable text styles in Figma and apply them consistently across all four CONFLUMIX modes. The same list becomes the source of truth for the frontend typography tokens.

| Figma text style | Maps to |
|---|---|
| `Display / Neue Montreal` | Display |
| `Heading / H1` – `Heading / H4` | H1–H4 |
| `Body / Large`, `Body / Default`, `Body / Small` | Body styles |
| `Label / Form`, `Label / Table Header`, `Label / Filter` | Label styles |
| `Meta / Caption` | Caption / metadata |
| `Action / Button`, `Action / Link` | Buttons and links |
| `Data / Price`, `Data / Table Cell` | Price and data styles |

Implementation guidance:

- Define typography as CSS custom properties in the token layer (§24, §25) so components never hardcode sizes or weights.

```css
:root {
  --font-family-primary: "Neue Montreal", "Helvetica Neue", Arial, sans-serif;

  --text-display-size: 48px;
  --text-display-line-height: 1.15;
  --text-display-weight: 600;

  --text-h1-size: 36px;
  --text-h1-line-height: 1.2;
  --text-h1-weight: 600;

  --text-h2-size: 28px;
  --text-h2-line-height: 1.25;
  --text-h2-weight: 600;

  --text-body-size: 17px;
  --text-body-line-height: 1.6;
  --text-body-weight: 400;

  --text-meta-size: 13px;
  --text-meta-line-height: 1.45;
  --text-meta-weight: 400;

  --text-button-size: 16px;
  --text-button-line-height: 1.2;
  --text-button-weight: 600;
}
```

- In Tailwind, expose the family as `theme.extend.fontFamily.sans` and map the size/weight pairs to the same style names so class names and Figma styles stay in sync.
- Do not introduce a competing typography token system. Keep one canonical set and reference it everywhere.

---

## 5. Spacing, Layout, and Grid

### 5.1 Spacing scale

Use a consistent 4 px base scale:

| Token | Value |
|---|---:|
| Space 1 | 4 px |
| Space 2 | 8 px |
| Space 3 | 12 px |
| Space 4 | 16 px |
| Space 5 | 20 px |
| Space 6 | 24 px |
| Space 8 | 32 px |
| Space 10 | 40 px |
| Space 12 | 48 px |
| Space 16 | 64 px |
| Space 20 | 80 px |
| Space 24 | 96 px |

Do not add arbitrary margins when an existing spacing token can be used.

### 5.2 Page layout

- Use a centered responsive content container.
- Use a maximum content width of approximately 1200–1280 px for typical application pages.
- Wider analytical tables may use more available space where necessary.
- Maintain consistent page gutters.
- Separate page titles, filters, content, and pagination into predictable sections.
- Keep cards aligned to a shared grid.
- Avoid overly narrow cards containing long text.
- Avoid edge-to-edge content on desktop unless the page design requires it.

Suggested horizontal gutters:

- Mobile: 16 px.
- Large mobile/small tablet: 20–24 px.
- Desktop: 32 px.
- Wide desktop: 40–48 px when the viewport allows.

### 5.3 Grid behavior

- Product grids: adapt the number of columns to available width.
- Desktop product grids: generally 3–4 columns.
- Tablet product grids: generally 2–3 columns.
- Mobile product grids: generally 1–2 columns depending on card complexity and available width.
- Dashboard metrics: use a responsive grid rather than fixed-width cards.
- Forms: use one column on mobile and only introduce multiple columns when fields are logically related.

Never force a desktop layout onto a narrow viewport.

---

## 6. Border Radius, Borders, and Shadows

### 6.1 Radius tokens

| Token | Value | Usage |
|---|---:|---|
| Radius XS | 4 px | Small indicators and compact elements |
| Radius SM | 6 px | Small inputs and compact controls |
| Radius MD | 10 px | Buttons, inputs, dropdowns |
| Radius LG | 14 px | Standard cards |
| Radius XL | 20 px | Large feature cards and dialogs where appropriate |
| Radius Pill | 9999 px | Pills and selected badge styles |

Use consistent radii. Do not randomly mix sharp rectangular cards and extremely rounded cards on the same page.

### 6.2 Borders

- Standard card border: `1px solid #DDE4E5`.
- Strong input boundary: `1px solid #C9D4D5`.
- Interactive hover boundary: `#8DA6A8`.
- Selected controls: use teal and/or a pale teal background.
- Dividers should be subtle and should not dominate the layout.

### 6.3 Shadows

Use shadows sparingly.

Recommended shadow tokens:

```css
:root {
  --shadow-xs: 0 1px 2px rgba(20, 32, 31, 0.05);
  --shadow-sm: 0 2px 6px rgba(20, 32, 31, 0.06);
  --shadow-md: 0 6px 16px rgba(20, 32, 31, 0.08);
  --shadow-lg: 0 12px 28px rgba(20, 32, 31, 0.12);
}
```

Use:

- XS for subtle controls where needed.
- SM for standard elevated cards.
- MD for dropdowns and popovers.
- LG for dialogs and prominent overlays.

Default cards should rely primarily on clean surfaces, spacing, and borders rather than heavy shadows.

Avoid glowing orange shadows, excessive blur, neumorphism, and permanent hover-like elevation.

---

## 7. Buttons

Buttons are one of the most important parts of the CONFLUMIX design system.

### 7.1 Primary button

Purpose: main action on a page or in a workflow.

Examples:

- Publish Listing
- Submit Offer
- Save Changes
- Confirm Donation
- Apply for Task
- Continue to Checkout

Specification:

- Background: `#0B5D63`.
- Text: `#FFFFFF`.
- Border: same as background.
- Hover background: `#08484D`.
- Active background: `#063A3E`.
- Border radius: 10 px.
- Font weight: 600.
- Transition: 160–200 ms.
- Focus: clearly visible teal-toned focus ring.
- Disabled background: `#E6EAEB`.
- Disabled text: `#929B9D`.

Primary buttons must be visually prominent but should not be unnecessarily oversized.

### 7.2 Orange accent button

Purpose: a particularly important call to action or highlighted conversion action.

Examples:

- Login / Sign Up
- Start Selling
- Donate Now
- A primary promotional action when appropriate

Specification:

- Background: `#FF6B2C`.
- Text: `#14201F` to preserve better contrast than white text on the standard orange.
- Border: same as background.
- Hover background: `#E85B20`.
- Active background: `#CC4D19`.
- Border radius: 10 px.
- Font weight: 600.
- Transition: 160–200 ms.

**Important:** Orange must not become the default color for every button. Use it selectively.

If white text is required for a specific orange button, verify the actual contrast ratio and choose an accessible darker orange variant where necessary.

### 7.3 Secondary button

Purpose: an alternative action with lower emphasis.

Specification:

- Background: `#FFFFFF`.
- Text: `#0B5D63`.
- Border: `1px solid #0B5D63`.
- Hover background: `#E2F0F0`.
- Active background: a slightly stronger teal-tinted surface.
- Transition: 160–200 ms.

Examples: Cancel, View Details, Compare, Back.

### 7.4 Tertiary and ghost buttons

Purpose: low-emphasis actions.

- Transparent background.
- Text: `#0B5D63`.
- No prominent border by default.
- Hover background: `#F0F7F7`.
- Active background: `#E2F0F0`.

Examples: Edit, View More, Clear Filters.

### 7.5 Destructive buttons

For irreversible or destructive actions:

- Use the error color `#B42318`.
- Use clear action wording.
- Use confirmation for destructive actions where appropriate.
- Never rely on color alone to communicate danger.

### 7.6 Button sizing

| Size | Height | Horizontal padding |
|---|---:|---:|
| Small | 32–36 px | 12 px |
| Medium | 40–44 px | 16–20 px |
| Large | 48–52 px | 20–24 px |

Use consistent sizes for buttons in the same context.

On mobile, prioritize touch targets of approximately 44 × 44 CSS pixels or larger. A visually compact control may use a larger invisible hit area when practical.

### 7.7 Button states

Every applicable button must define:

- Default
- Hover
- Focus-visible
- Active/pressed
- Disabled
- Loading

Loading buttons must prevent accidental duplicate submissions where appropriate. Keep their dimensions stable while loading and provide a meaningful accessible label.

Do not make buttons jump, scale dramatically, or shift surrounding content during interaction.

---

## 8. Navigation Bar

### 8.1 Overall style

The default navbar should use:

- White background: `#FFFFFF`.
- Deep Teal text and icons.
- Signal Orange for active navigation accents and selective calls to action.
- A subtle bottom border: `#DDE4E5`.
- The official horizontal CONFLUMIX logo.
- Consistent vertical alignment.
- Adequate spacing between navigation items and utility controls.

Do not use a dark teal navbar as the default unless a specific page or later approved design requires it.

### 8.2 Desktop navbar

The desktop navbar may include:

- Brand logo.
- Home.
- Marketplaces.
- About.
- Support.
- Search.
- Cart when relevant to the current user context.
- Notifications when relevant.
- Login / Sign Up or an authenticated user menu.

Navigation must use actual routes and real application behavior. Do not add nonfunctional controls just because they appear in a mockup.

### 8.3 Active navigation

- Text: `#0B5D63`.
- Indicator: `#FF6B2C`.
- Use a 2–3 px underline or a subtle background indicator.
- Transition: approximately 160–200 ms.
- Keep active-state styling consistent across all routes.

### 8.4 Hover and focus

- Hover: subtle pale teal background or teal text emphasis.
- Keyboard focus: visible focus ring or equivalent indicator.
- Dropdowns: use clear open/closed states and accessible keyboard behavior.
- Icons must have accessible labels when they do not have visible text.

### 8.5 Sticky behavior

If the navbar is sticky:

- Keep its height stable.
- Use a subtle border or shadow when separation from the content is needed.
- Avoid dramatic shrinking or animation while scrolling.
- Ensure it does not obscure anchor targets or focused controls.

### 8.6 Mobile navigation

- Use a compact logo.
- Use a menu button with an accessible name.
- Provide a clear expanded and collapsed state.
- Keep important navigation options easy to reach.
- Prevent horizontal overflow.
- Close the menu appropriately after navigation.
- Maintain keyboard access and visible focus.

---

## 9. Marketplace Mode Identity

CONFLUMIX has four modes, but all four must use the same global design system.

Do not create four separate applications or four competing visual identities.

### 9.1 New Product Marketplace

Purpose: buying and selling new products.

Use the shared brand palette for:

- Product cards.
- Product search and filters.
- Seller storefronts.
- Product detail pages.
- Cart and checkout.
- Order management.
- Promotions.
- Seller analytics.

Recommended presentation:

- White product cards.
- Clear product images.
- Teal action buttons.
- Orange accents for important promotions or selected highlights.
- Consistent price typography.
- Structured specifications and availability indicators.

Price reductions should not rely only on orange; use readable price labels and clear descriptions.

### 9.2 Reuse / Old Product Marketplace

Purpose: discovery and exchange of used, refurbished, and pre-owned products.

Use the same typography, buttons, cards, and navigation.

Provide clear visual treatment for:

- Product condition.
- Repair and refurbishment history.
- Price history.
- Seller offers.
- Reservation status.
- Inspection and handover steps.

Use neutral or pale teal condition labels where appropriate. Use semantic status colors only for meaningful status conditions.

Do not make used products look like a separate brand.

### 9.3 Task & Soft Skills Marketplace

Purpose: public remote digital tasks and problem-solving engagements.

Use the shared design system for:

- Task cards.
- Task details.
- Applications and proposals.
- Solver selection.
- Work submission.
- Completion states.
- Reviews and task management.

Present important task metadata clearly, such as budget, deadline, required skills, and task status.

Use consistent badges and cards. Do not introduce a separate visual theme for freelancers or task owners.

### 9.4 Donation & Social Impact Network

Purpose: structured in-kind donation and resource sharing.

Use the shared design system for:

- Donation listings.
- Identified needs.
- Claims and approvals.
- Organization profiles.
- Distribution and handover.
- Donation status.
- Impact analytics.

Use semantic success colors for genuinely successful completion states. Keep donation urgency and other warnings distinguishable from normal brand accents.

The design should feel respectful and trustworthy, not overly sentimental or visually dramatic.

### 9.5 Shared mode switching

If a mode switcher is present:

- Use clear labels and/or recognizable icons.
- Keep the current mode visually selected.
- Use a pale teal selection background or a teal indicator.
- Use orange only for selective emphasis.
- Preserve a consistent position and interaction pattern across applicable pages.

Do not create unrelated color systems for the four modes.

---

## 10. Cards and Content Containers

### 10.1 Standard card

- Background: `#FFFFFF`.
- Border: `1px solid #DDE4E5`.
- Radius: 14 px.
- Shadow: none or `--shadow-sm`.
- Padding: 16–24 px depending on content.
- Consistent internal spacing.

### 10.2 Interactive cards

For clickable cards:

- Default: clean surface and border.
- Hover: subtle shadow increase and/or border emphasis.
- Focus: visible focus ring if the card is keyboard interactive.
- Active: subtle visual feedback.
- Transition: 160–220 ms.

Do not apply hover lift effects to every card by default.

A card should not appear clickable if it has no interactive behavior.

### 10.3 Product cards

Recommended structure:

1. Product image.
2. Optional status or promotional badge.
3. Product title.
4. Price and optional previous price.
5. Relevant rating or seller information when available.
6. Location or delivery information where relevant.
7. One primary action or a clear route to details.

Rules:

- Maintain consistent image ratios within a grid.
- Use `object-fit: contain` for products that need their full shape visible.
- Use `object-fit: cover` for photography where cropping is acceptable.
- Prevent inconsistent card heights.
- Avoid excessive information density.
- Never invent ratings, availability, reviews, or seller verification states.

### 10.4 Task cards

Emphasize:

- Task title.
- Budget.
- Deadline.
- Required skills.
- Task status.
- A clear details or application action.

### 10.5 Donation cards

Emphasize:

- Item or need.
- Quantity where relevant.
- Condition or eligibility.
- Urgency when justified.
- Availability or claim status.
- Appropriate next action.

### 10.6 Dashboard cards

- Use consistent padding and heading hierarchy.
- Separate numeric values from explanatory labels.
- Avoid making every metric a different color.
- Use charts only when they improve understanding.
- Provide empty states for unavailable data.

---

## 11. Forms, Inputs, and Validation

### 11.1 Input appearance

Default input:

- Background: `#FFFFFF`.
- Text: `#14201F`.
- Placeholder: `#718083`.
- Border: `#C9D4D5`.
- Radius: 8–10 px.
- Minimum height: approximately 44 px for standard interactive fields.

### 11.2 Input states

| State | Specification |
|---|---|
| Default | White background, neutral border |
| Hover | Border `#8DA6A8` |
| Focus | Teal border and visible focus ring |
| Valid | Semantic success styling where appropriate |
| Invalid | Error border and clear error message |
| Disabled | Disabled background and text |
| Read-only | Clearly distinguish from editable fields |

### 11.3 Focus ring

Use a consistent, visible focus indicator. A recommended pattern is:

```css
:focus-visible {
  outline: 3px solid #9AD1D3;
  outline-offset: 2px;
}
```

The focus indicator must remain visible against the surrounding background and must not be removed without an accessible replacement.

### 11.4 Labels and help text

- Place labels consistently.
- Do not rely exclusively on placeholders.
- Explain required fields clearly.
- Use helper text for constraints and expected formats.
- Place validation messages close to the relevant field.
- Preserve user input after validation failures where practical.

### 11.5 Form validation

- Validate on the server as well as the client where applicable.
- Use clear, actionable error messages.
- Avoid showing errors before users have a reasonable opportunity to enter data.
- Associate error messages with their controls.
- Keep error text readable and accessible.
- Never communicate validation state using color alone.

### 11.6 Selects, checkboxes, and radios

- Use teal for checked or selected states.
- Keep selection indicators clearly visible.
- Provide large enough interactive hit areas.
- Maintain consistent spacing and alignment.
- Support keyboard interaction.
- Use native controls when they provide the best accessibility and behavior.

---

## 12. Dropdowns, Menus, Tabs, and Filters

### 12.1 Dropdown menus

- Background: white.
- Border: `#DDE4E5`.
- Radius: 10 px.
- Shadow: `--shadow-md`.
- Text: `#14201F`.
- Hovered item: `#F0F7F7`.
- Selected item: teal text and/or `#E2F0F0` background.

Dropdowns should open and close predictably, support keyboard use, and avoid being clipped by their parent containers.

### 12.2 Tabs

- Use teal for the active tab.
- Use orange as an optional active underline or small accent.
- Keep inactive tabs neutral.
- Maintain a visible keyboard focus state.
- Do not use different tab styles on every page.

### 12.3 Search and filters

- Keep search fields visually prominent but not oversized.
- Use clear labels and icons.
- Make active filters visible.
- Provide a clear method to remove filters.
- Use a consistent selected-filter style.
- On mobile, collapse complex filter panels when necessary while keeping them accessible.
- Preserve selected filter values when opening and closing filter panels.

---

## 13. Badges, Chips, and Status Indicators

Use semantic and brand colors appropriately.

| Purpose | Style |
|---|---|
| General label | Neutral background, dark text |
| Selected filter | Pale teal background, teal text |
| New product or featured item | Teal or pale teal |
| Promotion or sale | Pale orange background, dark text |
| Donation completed | Success background and text |
| Pending review | Information or warning palette according to meaning |
| Failed or rejected | Error background and text |
| Used-product condition | Neutral or pale teal treatment |
| Task status | Semantic status styling consistent across the application |

Rules:

- Keep badges compact.
- Use concise labels.
- Avoid making every badge brightly colored.
- Do not use color alone to distinguish different conditions.
- Ensure text remains readable.
- Do not add arbitrary badge colors for every category.

---

## 14. Icons and Imagery

### 14.1 Icon style

Use a consistent icon family throughout the application.

Prefer simple, clean outline icons with consistent stroke weight. If the repository already uses a library such as Lucide, continue using it instead of adding another icon library.

Suggested sizes:

- 16 px: compact inline icons.
- 18–20 px: standard buttons and navigation.
- 24 px: prominent controls.
- 32 px or larger: empty-state illustrations where appropriate.

> **Repository note:** No icon library is configured yet because the frontend is not scaffolded. Until an approved library is chosen, prefer **Lucide** (`lucide-react`) for its consistent outline style and React/Next.js compatibility. Do not add more than one icon library. Record the decision before installing.

### 14.2 Icon colors

- Standard: `#526365` or `#0B5D63`.
- Active: `#0B5D63`.
- Accent: `#FF6B2C` where meaningful.
- Disabled: `#929B9D`.
- Destructive: `#B42318`.

### 14.3 Imagery

- Prefer clear, relevant, high-quality images.
- Maintain consistent image ratios within the same content grid.
- Use appropriate object-fit behavior.
- Provide fallback states for missing images.
- Avoid decorative imagery that distracts from marketplace content.
- Do not distort product images.
- Do not invent product imagery or user-uploaded content.

---

## 15. Animation and Transition System

Animations must communicate feedback, hierarchy, and state changes. They must not delay ordinary tasks or make the marketplace feel like a promotional landing page.

### 15.1 Motion principles

- Keep motion purposeful.
- Prefer opacity, color, border, shadow, and small transform changes.
- Avoid large bounces, elastic effects, exaggerated parallax, and continuous decorative motion.
- Avoid animating large areas unnecessarily.
- Avoid animations that cause layout shifts.
- Keep important actions immediate.
- Never make a required workflow depend on animation completion.

### 15.2 Duration tokens

| Token | Duration | Usage |
|---|---:|---|
| Motion Instant | 100 ms | Very small visual feedback |
| Motion Fast | 150 ms | Buttons and icon states |
| Motion Standard | 200 ms | Cards, inputs, navigation |
| Motion Moderate | 250 ms | Dropdowns and small panels |
| Motion Slow | 300 ms | Dialogs and larger panel transitions |
| Motion Maximum | 400 ms | Only when a larger transition genuinely benefits |

Most routine interactions should use 150–220 ms.

### 15.3 Easing tokens

Recommended easing curves:

```css
:root {
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --ease-enter: cubic-bezier(0, 0, 0.2, 1);
  --ease-exit: cubic-bezier(0.4, 0, 1, 1);
}
```

Use consistent easing across related components.

### 15.4 Button hover

- Change background color.
- Optionally increase shadow slightly.
- Do not enlarge buttons dramatically.
- Do not move adjacent content.
- Duration: 150–200 ms.

### 15.5 Card hover

- Slight border emphasis and/or subtle shadow increase.
- Optional upward translation of approximately 1–2 px for selected clickable cards.
- Avoid applying transform effects to every content container.
- Duration: 180–220 ms.

### 15.6 Input focus

- Transition border color and focus-ring appearance.
- Avoid large glow effects.
- Duration: 120–180 ms.

### 15.7 Dropdown entrance

- Use a short opacity transition and, if helpful, a small vertical movement of approximately 4 px.
- Duration: 150–200 ms.
- Do not delay keyboard interaction.

### 15.8 Dialog entrance

- Use opacity and a subtle scale transition.
- Keep the scale change small.
- Use a backdrop that supports focus on the dialog.
- Ensure focus is managed correctly.
- Respect reduced-motion preferences.

### 15.9 Loading states

- Use a spinner, skeleton, or inline loading indicator where appropriate.
- Avoid skeleton animations that flash excessively.
- Do not use loading animations when an immediate static response is sufficient.
- Prevent duplicate form submissions where appropriate.
- Preserve layout dimensions to minimize content shifts.

### 15.10 Page transitions

Do not add global page transitions by default. Navigation should remain fast and predictable. If transitions already exist, keep them subtle and preserve route loading, accessibility, and browser navigation behavior.

### 15.11 Reduced motion

Support `prefers-reduced-motion: reduce`.

When reduced motion is enabled:

- Remove nonessential transforms and movement.
- Disable decorative animations.
- Minimize or eliminate transitions where appropriate.
- Preserve all interaction feedback through non-motion cues.
- Do not remove essential loading or status information.

Example:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Review this approach against the application's existing styles so it does not accidentally break essential behavior.

---

## 16. Hover, Focus, Active, Selected, and Disabled States

Every interactive component must have a consistent state model.

### 16.1 State definitions

- **Default:** normal appearance.
- **Hover:** pointer is over an interactive element.
- **Focus-visible:** keyboard focus is visible.
- **Active:** element is being pressed or activated.
- **Selected:** element is currently chosen.
- **Disabled:** element cannot be interacted with.
- **Loading:** action is in progress.
- **Error:** an operation failed or input is invalid.
- **Success:** an operation completed successfully.

### 16.2 State rules

- Do not use hover as the only way to reveal important content.
- Keep keyboard focus visible.
- Do not make disabled controls look identical to enabled controls.
- Avoid using opacity alone if it makes disabled text unreadable.
- Keep selected states distinct from hover states.
- Preserve a consistent state model across all four modes.

---

## 17. Tables, Pagination, and Data-Heavy Interfaces

CONFLUMIX includes dashboards, seller analytics, orders, applications, claims, listings, and other structured data.

### 17.1 Tables

- Use white or lightly tinted surfaces.
- Use clear column headings.
- Use consistent row heights.
- Use subtle horizontal dividers.
- Use teal or pale teal for selected rows.
- Use readable text and aligned numeric values.
- Keep actions consistent across rows.
- Avoid excessive gridlines.

### 17.2 Row states

- Default: white background.
- Hover: subtle pale teal background.
- Selected: `#E2F0F0` or an equivalent accessible selected treatment.
- Error/status states: semantic status labels where needed.

### 17.3 Pagination

- Use consistent button dimensions.
- Highlight the current page with teal.
- Keep disabled pagination controls distinguishable.
- Provide accessible names for previous and next controls.
- Preserve filters and sorting when changing pages.

### 17.4 Bulk operations

For operations that affect multiple listings or records:

- Show a clear selection count.
- Make selected records visually obvious.
- Display a preview when the operation could have substantial impact.
- Use a clear confirmation step for high-impact changes.
- Show success, failure, and skipped-record summaries.
- Keep destructive actions visually distinct.
- Do not use orange alone to communicate irreversible consequences.

---

## 18. Modals, Drawers, Toasts, and Notifications

### 18.1 Modals

- White background.
- Consistent radius, generally 14–20 px.
- Appropriate shadow.
- Clear title and description.
- Visible close button when dismissal is permitted.
- Clear primary and secondary actions.
- Focus management and keyboard support.

Do not use a modal for every small interaction.

### 18.2 Drawers

Use drawers for appropriate side panels, filters, contextual details, or multi-step interactions.

- Use consistent surface and border styles.
- Prevent background interaction when the drawer requires modal behavior.
- Make dismissal behavior clear.
- On mobile, consider full-width or bottom-sheet layouts when appropriate.

### 18.3 Toast notifications

- Use concise messages.
- Use semantic status styling.
- Keep text readable.
- Do not show multiple redundant toasts for the same operation.
- Do not rely solely on transient toasts for critical error details.
- Ensure status updates are available to assistive technology where appropriate.

### 18.4 Notification panels

- Use a clear read/unread distinction.
- Use consistent spacing and typography.
- Make each notification's purpose understandable.
- Use orange dots sparingly for unread or highlighted states.
- Do not display notification badges when no unread notifications exist.

---

## 19. Empty, Loading, Error, and Success States

Every major data-driven page should account for its different content states.

### 19.1 Empty states

Examples:

- No products found.
- No active offers.
- No tasks available.
- No donation claims.
- No orders yet.
- No analytics data available.

An empty state should explain the situation and provide a relevant next step where appropriate.

Avoid unnecessarily large decorative illustrations.

### 19.2 Loading states

- Use skeletons for complex layouts when they help communicate the expected structure.
- Use compact spinners for small operations.
- Keep layout dimensions stable.
- Avoid showing indefinite loading without explanation or recovery options.

### 19.3 Error states

- Explain what happened in plain language.
- Provide a retry or recovery action where appropriate.
- Preserve entered information when practical.
- Avoid exposing sensitive internal error details.
- Use the error palette and a clear message.

### 19.4 Success states

- Confirm what completed.
- Identify the affected resource where relevant.
- Provide the next appropriate action.
- Use success styling without excessive celebration animations.

---

## 20. Responsive Design

### 20.1 Breakpoints

Use the existing project breakpoints if they are already established. Otherwise, the following may be used as a starting point:

| Breakpoint | Width |
|---|---:|
| Small mobile | 360 px and above |
| Mobile | 480 px and above |
| Tablet | 768 px and above |
| Desktop | 1024 px and above |
| Wide desktop | 1280 px and above |

These are practical design references, not rigid limits. Components should respond to their available space.

> **Repository note:** Tailwind's default breakpoints (`sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536) align closely with the above. Use Tailwind's default breakpoints unless the team approves custom ones; do not maintain two competing breakpoint scales.

### 20.2 Mobile requirements

- No accidental horizontal overflow.
- Compact navigation.
- Responsive product and task grids.
- Adequate touch targets.
- Readable forms.
- Appropriate mobile filter panels.
- Responsive tables or alternative layouts for complex data.
- Stable image ratios.
- Clear primary actions.
- Dialogs that fit the viewport.
- Respect for device safe areas when applicable.

### 20.3 Tablet requirements

- Avoid layouts that merely shrink desktop content.
- Adjust card columns and sidebars.
- Keep navigation readable.
- Use available width efficiently.
- Prevent overcrowding in dashboards and tables.

### 20.4 Desktop requirements

- Maintain a clear content hierarchy.
- Avoid excessively wide text paragraphs.
- Use the full available width where it improves structured data workflows.
- Preserve consistent page gutters.
- Avoid oversized whitespace that makes important content difficult to reach.

### 20.5 Responsive verification

Review at minimum:

- 360 px.
- 390 px.
- 768 px.
- 1024 px.
- 1280 px.
- 1440 px.

Test real component behavior, not only whether the page technically fits the viewport.

---

## 21. Accessibility Requirements

Accessibility is part of the design system, not an optional enhancement.

### 21.1 Contrast

Target WCAG 2.2 AA contrast:

- At least 4.5:1 for normal text.
- At least 3:1 for large text.
- At least 3:1 for essential graphical objects and UI component boundaries where applicable.

Verify actual foreground/background combinations. Do not assume that every color in the palette is suitable for every text use.

In particular:

- Use dark text on standard Signal Orange backgrounds.
- Use white text on Deep Teal backgrounds only after confirming the pairing.
- Do not use pale border colors as body text.
- Do not rely on orange text against white for small or lengthy text.

### 21.2 Keyboard accessibility

- All interactive controls must be keyboard accessible.
- Maintain logical tab order.
- Provide visible focus.
- Support expected keyboard behavior for menus, dialogs, tabs, and controls.
- Do not create keyboard traps.
- Manage dialog focus correctly.
- Restore focus appropriately when a dialog closes.

### 21.3 Screen readers

- Use semantic HTML.
- Provide accessible labels for icon-only buttons.
- Associate form labels, instructions, and errors with their inputs.
- Use meaningful alternative text for informative images.
- Hide purely decorative icons from assistive technology where appropriate.
- Announce important asynchronous status updates appropriately.

### 21.4 Motion and touch

- Respect reduced-motion preferences.
- Do not communicate essential information through animation alone.
- Make touch targets sufficiently large.
- Avoid hover-only functionality.

### 21.5 Accessibility validation

Use automated accessibility checks where available, supplemented by manual keyboard and screen-reader testing. Automated tools do not prove complete accessibility.

---

## 22. Data Visualization and Analytics Pages

CONFLUMIX includes a shared Data Science and analytics layer.

Analytics screens should feel like part of the same product rather than a separate BI application.

### 22.1 Dashboard hierarchy

Use this order where applicable:

1. Page title and context.
2. Time range and filters.
3. Key performance indicators.
4. Main charts.
5. Supporting breakdowns.
6. Detailed tables.
7. Export or further-action controls.

### 22.2 Metric cards

- Use concise labels.
- Make the main number visually prominent.
- Include units and date ranges where relevant.
- Avoid unexplained percentage changes.
- Use semantic colors only when their meaning is clear.
- Do not invent analytics data.

### 22.3 Chart rules

- Use the approved chart palette.
- Use readable axes, labels, and legends.
- Avoid unnecessary decoration.
- Include empty and error states.
- Provide meaningful text summaries or tabular alternatives when appropriate.
- Ensure the chart remains understandable without relying exclusively on color.

---

## 23. Content and Microcopy

### 23.1 Writing style

Interface text should be:

- Clear.
- Concise.
- Human.
- Action-oriented.
- Consistent.
- Respectful.
- Free from unnecessary technical jargon.

### 23.2 Button labels

Prefer specific action verbs.

Good examples:

- Publish Listing
- Save Changes
- Submit Offer
- View Details
- Apply for Task
- Claim Donation
- Confirm Handover
- Retry

Avoid ambiguous labels such as “Proceed” or “Click Here” when a more descriptive label is possible.

### 23.3 Errors

Use messages that explain the problem and next step.

Example:

Instead of: “Error 400.”

Prefer: “We couldn't save your listing. Check the highlighted fields and try again.”

### 23.4 Confirmation

Use confirmation dialogs when an action is destructive, difficult to reverse, or has substantial impact.

Explain the consequence and label the final action clearly.

---

## 24. Design Tokens and Component Architecture

The implementation should have one shared design system.

### 24.1 Single source of truth

Centralize:

- Colors.
- Typography.
- Spacing.
- Radii.
- Shadows.
- Motion durations.
- Easing curves.
- Breakpoints where appropriate.
- Component sizing conventions.

Avoid duplicating the same values across many components.

### 24.2 Reusable components

Where appropriate for the existing architecture, establish reusable components for:

- Button.
- Input.
- Select.
- Checkbox.
- Radio.
- Badge.
- Card.
- Product card.
- Task card.
- Donation card.
- Modal.
- Drawer.
- Toast.
- Tabs.
- Dropdown.
- Pagination.
- Loading skeleton.
- Empty state.
- Error state.
- Status indicator.

Do not create unnecessary abstraction for every minor element. Reuse should improve consistency and maintainability.

### 24.3 Component variants

Use explicit variants rather than arbitrary styling on every page.

For example:

- Button: primary, accent, secondary, ghost, destructive.
- Button size: small, medium, large.
- Badge: neutral, brand, success, warning, error, information.
- Card: standard, interactive, metric, product, task, donation.

The names may be adapted to the existing codebase, but the visual rules must remain consistent.

### 24.4 Avoid style drift

- Do not introduce a new orange, teal, gray, or font without an approved reason.
- Do not override global component behavior independently on every route.
- Do not use inline colors for routine styling when tokens exist.
- Do not introduce unrelated component libraries.
- Do not create separate themes for each mode.
- Do not make a page visually inconsistent merely to make it look unique.

---

## 25. Suggested Tailwind/CSS Usage

If the project uses Tailwind CSS, integrate the palette with the existing configuration. Use CSS custom properties where they fit the project's architecture.

Example:

```css
:root {
  --color-brand-primary: #0B5D63;
  --color-brand-primary-hover: #08484D;
  --color-brand-accent: #FF6B2C;
  --color-brand-accent-hover: #E85B20;

  --color-background: #F3F6F6;
  --color-surface: #FFFFFF;
  --color-border: #DDE4E5;

  --color-text-primary: #14201F;
  --color-text-secondary: #526365;
  --color-text-muted: #718083;

  --radius-control: 10px;
  --radius-card: 14px;

  --transition-fast: 150ms;
  --transition-standard: 200ms;
}
```

Example button styling:

```css
.button-primary {
  background-color: var(--color-brand-primary);
  color: #FFFFFF;
  border: 1px solid var(--color-brand-primary);
  border-radius: var(--radius-control);
  transition:
    background-color var(--transition-fast) ease,
    border-color var(--transition-fast) ease,
    box-shadow var(--transition-fast) ease;
}

.button-primary:hover:not(:disabled) {
  background-color: #08484D;
  border-color: #08484D;
}

.button-primary:active:not(:disabled) {
  background-color: #063A3E;
}

.button-primary:focus-visible {
  outline: 3px solid #9AD1D3;
  outline-offset: 2px;
}

.button-primary:disabled {
  background-color: #E6EAEB;
  border-color: #E6EAEB;
  color: #929B9D;
  cursor: not-allowed;
}
```

This is a reference example. Adapt selectors and component conventions to the repository rather than introducing a parallel styling architecture.

> **Tailwind mapping note:** Expose the palette through `tailwind.config` `theme.extend.colors` using semantic names (`brand.primary`, `brand.accent`, `surface`, `border`, `text`, `success`, `warning`, `error`, `info`) or via CSS variables referenced by Tailwind. Configure `fontFamily.sans` to the Neue Montreal stack from §4, and `boxShadow`/`borderRadius` extensions to match the tokens in §6. Do not define colors in both a Tailwind theme and a separate parallel CSS system; choose one canonical source.

---

## 26. Performance and Visual Stability

The design system must not undermine frontend performance.

- Prefer CSS transitions over JavaScript for simple interactions.
- Avoid unnecessary animation dependencies.
- Avoid animating expensive layout properties.
- Prefer transform and opacity for motion when appropriate.
- Use responsive image sizes.
- Prevent cumulative layout shifts.
- Keep skeleton dimensions consistent with loaded content.
- Avoid rendering large decorative effects that reduce readability.
- Ensure interactive elements respond promptly.
- Preserve application loading and error handling behavior.

Do not sacrifice accessibility or functionality for a visual effect.

---

## 27. Anti-Patterns to Avoid

The following are prohibited unless a specific, justified requirement is approved:

- Using orange as the background for every primary button.
- Using white text on standard orange without checking contrast.
- Replacing the official logo with a generic infinity symbol.
- Stretching or recoloring the logo arbitrarily.
- Introducing a different color palette for each marketplace mode.
- Excessive gradients.
- Neon glows.
- Excessive glassmorphism.
- Heavy shadows on every card.
- Excessively rounded controls everywhere.
- Large hover animations.
- Continuous decorative animation.
- Low-contrast gray text.
- Introducing a second typeface alongside Neue Montreal.
- Setting body text below 16 px or metadata below 13 px to fit more content.
- Overly large hero typography, excessive uppercase text, or exaggerated letter spacing.
- Hover-only actions.
- Placeholder-only form labels.
- Inconsistent button sizes.
- Random border radii.
- Unnecessary skeleton loading.
- Fake statistics, ratings, products, or notification counts.
- Nonfunctional navigation controls.
- Modifying business logic merely to achieve a visual result.
- Adding new dependencies without a clear need.

---

## 28. Page-Level Design Checklist

Before considering any page visually complete, verify the following.

### Branding
- [ ] Official logo is used correctly.
- [ ] Brand colors match the approved palette.
- [ ] The shared CONFLUMIX identity is preserved.

### Layout
- [ ] Page hierarchy is clear.
- [ ] Spacing follows the design scale.
- [ ] Content aligns with the common grid.
- [ ] The layout adapts to supported viewport sizes.

### Components
- [ ] Buttons have the correct variants and states.
- [ ] Inputs have labels and validation states.
- [ ] Cards follow the standard surface and radius rules.
- [ ] Badges use appropriate semantic colors.
- [ ] Icons follow the shared icon style.

### Interaction
- [ ] Hover states are subtle.
- [ ] Keyboard focus is visible.
- [ ] Disabled states are distinguishable.
- [ ] Loading and error states are handled.
- [ ] Interactive elements behave correctly.

### Accessibility
- [ ] Contrast has been checked.
- [ ] Keyboard navigation works.
- [ ] Icon-only controls have accessible names.
- [ ] Reduced motion is supported.
- [ ] Color is not the only indicator of state.

### Quality
- [ ] No horizontal overflow at target viewport sizes.
- [ ] No unnecessary animations.
- [ ] No duplicated or conflicting design tokens.
- [ ] No invented data or nonfunctional controls.
- [ ] No unrelated business logic changes.

---

## 29. Definition of Done

`UI/UX_brief.md` is complete when:

1. All sections in this specification are included.
2. The exact official brand colors are documented.
3. Semantic status colors and their usage are documented.
4. Buttons, inputs, navigation, cards, badges, tables, and overlays have defined states.
5. Animation durations, easing, transitions, and reduced-motion behavior are documented.
6. Responsive design and accessibility rules are documented.
7. The four marketplace modes are described as parts of one unified visual system.
8. The official logo and favicon usage rules are included.
9. Design tokens are centralized and internally consistent.
10. Practical CSS examples are included.
11. No major section contains only vague generalities.
12. The file has been reviewed for contradictory color values, duplicate rules, and missing interaction states.

---

## 30. Repository-Specific Implementation Notes

This section records findings from inspecting the CONFLUMIX repository and reconciles this brief with the current state. These notes are **additive**; they do not change the approved brand palette, logo, or product architecture.

### 30.1 Current frontend state

- `apps/web/` is **not yet scaffolded** (contains only `.gitkeep`).
- No `package.json`, `tailwind.config`, or `tsconfig.json` exists in the repository yet.
- The documented, agreed stack is **Next.js, React, TypeScript, Tailwind CSS**, deployed to **Vercel** (`README.md`, `docs/structure.md`).
- **Recommendation:** when the frontend is initialized, apply this brief's tokens at that point. This document does not scaffold the app or install dependencies.

### 30.2 Brand assets in the repository root

The following real logo/icon assets exist at the repository root and should be treated as authoritative:

| Asset | Likely purpose |
|---|---|
| `CONFLUMIX.jpeg` | Primary logo / hero lockup |
| `CONFLUMIX - brand.jpeg` | Brand presentation variant |
| `CONFLUMIX - icon.jpeg` | Icon-only mark |
| `CONFLUMIX_nav.png` | Navbar horizontal lockup |
| `CONFLUMIX_iden.png` | Identity / wordmark lockup |
| `CONFLUMIX_fav.png` | Favicon source (interlocking symbol) |

- **Recommendation:** when `apps/web/` is scaffolded, relocate the production assets into the framework's static directory (e.g., `apps/web/public/`) and reference them from there. Do not reference repository-root image paths from application code.
- Prefer the navbar lockup (`CONFLUMIX_nav.png`) for the navbar and the icon/favicon source (`CONFLUMIX_fav.png` / `CONFLUMIX - icon.jpeg`) for the favicon and compact marks.
- Convert JPEG brand assets to PNG/SVG where an approved vector or lossless source becomes available; JPEG compression is not ideal for logos.
- **Do not** redraw or approximate the mark.

### 30.3 Mode naming discrepancy (document, do not silently resolve)

- The PRD (`docs/requirements/PRD.md`) uses the official name **“Task & Soft Skills Marketplace.”**
- This brief's source specification used the shorter **“Task & Skill Marketplace.”**
- **Resolution adopted here:** use the PRD's official name in headings and documentation; “Tasks” is acceptable only as a short navigational label.
- This is a **documentation/naming conflict, not a functional conflict.** It requires no code change.

### 30.4 No existing components to preserve yet

- Because no UI code exists, there are **no existing navbar, button, form, card, or token implementations** to reconcile or migrate.
- Therefore no conflicts between an existing implementation and this specification were found. Section 30.3 is the only documented discrepancy (naming only).

### 30.5 Remaining decisions that genuinely require clarification

| ID | Question | Why it matters |
|---|---|---|
| UI-DEC-001 | **Resolved:** the single typeface is **Neue Montreal** (§4). Remaining confirmation: delivery of licensed WOFF2 files for identical cross-platform rendering. | Affects font loading, licensing, and fallback rendering. |
| UI-DEC-002 | Which icon library is approved (Lucide recommended)? | Prevents adding multiple icon libraries. |
| UI-DEC-003 | Is a transparent-background logo asset available and approved? | Determines navbar/favicon asset choice. |
| UI-DEC-004 | Are vectored (SVG) logo sources available? | Affects favicon quality and scalability. |
| UI-DEC-005 | Confirm the preferred short UI label for the Task mode (“Tasks” vs. full name)? | Navigation labeling consistency. |
| UI-DEC-006 | Confirm whether the orange accent button uses dark text (`#14201F`) as specified, or requires a darker accessible orange for white text. | Contrast compliance. |
| UI-DEC-007 | Confirm canonical breakpoint scale (Tailwind defaults vs. custom). | Responsive consistency. |

---

*End of CONFLUMIX UI/UX Design System Brief.*
