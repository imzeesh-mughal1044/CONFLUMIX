# CONFLUMIX — Product Requirements Document (PRD)

**The Multi-Mode Marketplace for Local Exchange.**

| Field | Value |
| --- | --- |
| Document | Product Requirements Document (PRD) |
| Product | CONFLUMIX |
| Version | 1.0 (Initial) |
| Status | Draft for academic review |
| Document Owner | CONFLUMIX Development Team (4 members) |
| Intended Audience | Development team, project manager, academic supervisors and evaluators, testers, documentation contributors |
| Related Documents | `docs/structure.md` (repository structure), `README.md` (project overview) |

> **Boundary note:** This PRD is product-focused. It defines *what* CONFLUMIX should do and *why*. It is **not** the Technical Requirements Document (TRD), Software Requirements Specification (SRS), database design, API contract, or implementation manual. Those artifacts are produced separately in later tasks.

---

## Table of Contents

1. [Document Purpose and Scope](#1-document-purpose-and-scope)
2. [Product Overview](#2-product-overview)
3. [Problem Statement](#3-problem-statement)
4. [Target Users and Stakeholders](#4-target-users-and-stakeholders)
5. [Proposed Solution](#5-proposed-solution)
6. [Product Goals and Non-Goals](#6-product-goals-and-non-goals)
7. [New Product Marketplace — Product Requirements](#7-new-product-marketplace--product-requirements)
8. [Reuse / Old Product Marketplace — Product Requirements](#8-reuse--old-product-marketplace--product-requirements)
9. [Task & Soft Skills Marketplace — Product Requirements](#9-task--soft-skills-marketplace--product-requirements)
10. [Donation & Social Impact Network — Product Requirements](#10-donation--social-impact-network--product-requirements)
11. [Shared Product Behaviors and Cross-Mode Integration](#11-shared-product-behaviors-and-cross-mode-integration)
12. [Data Science and Analytics Requirements](#12-data-science-and-analytics-requirements)
13. [Functional Requirements Catalogue](#13-functional-requirements-catalogue)
14. [Non-Functional Requirements](#14-non-functional-requirements)
15. [Business Rules and State Management](#15-business-rules-and-state-management)
16. [User Stories and Acceptance Scenarios](#16-user-stories-and-acceptance-scenarios)
17. [Success Metrics](#17-success-metrics)
18. [Assumptions, Constraints, Dependencies, and Risks](#18-assumptions-constraints-dependencies-and-risks)
19. [Scope and Release Boundaries](#19-scope-and-release-boundaries)
20. [Product Differentiation and Academic Defensibility](#20-product-differentiation-and-academic-defensibility)
21. [Requirements Traceability](#21-requirements-traceability)
22. [Open Questions and Decisions Required](#22-open-questions-and-decisions-required)
23. [Appendix A — Glossary and Requirement Conventions](#23-appendix-a--glossary-and-requirement-conventions)

---

## 1. Document Purpose and Scope

### 1.1 Purpose

This document specifies the product requirements for **CONFLUMIX**, a unified multi-mode marketplace for local exchange. It defines the product vision, the problem being addressed, the target users, the required product behaviors, the scope boundaries, and the criteria by which the academic project will be evaluated.

The PRD exists so that subsequent work — the SRS, TRD, design, implementation, and testing — has a single, authoritative description of intended product behavior to build against.

### 1.2 Intended Audience

- The four-member development team.
- The project manager.
- Academic supervisors and evaluators.
- Testers and documentation contributors.

### 1.3 Document Scope and Boundaries

**This PRD defines:**

- What CONFLUMIX is and why it is needed.
- Who it is for.
- What problems it addresses.
- What the proposed solution does.
- Which features and behaviors the product requires.
- What differentiates the proposed solution.
- What is included and excluded from the initial project.
- How success will be evaluated.
- What assumptions, dependencies, risks, and unresolved decisions remain.

**This PRD does not define:**

- Database schemas, tables, or migrations.
- API endpoints, contracts, or request/response models.
- Security implementation details.
- Specific algorithms (DSA or Data Science) beyond required analytical outcomes.
- Deployment configuration or infrastructure.
- Detailed test scripts.

Where a requirement is not sufficiently defined by the available source material, it is marked **TBD — To Be Decided**, with an explanation of the missing decision.

### 1.4 Source Material and Conflicts

The primary source material for this PRD is the official CONFLUMIX project definition and its detailed module specifications as supplied to the team. This PRD also reflects the repository structure documented in `docs/structure.md` and the project overview in `README.md`.

| Source | Status at time of writing |
| --- | --- |
| Project definition / task specification (all four modes) | Available — used as baseline |
| New Product Marketplace detailed specification | Represented in this PRD; no separate revised file present in repository |
| Reuse / Old Product Marketplace detailed specification | Represented in this PRD; no separate revised file present in repository |
| Task & Soft Skills Marketplace specification | Represented in this PRD |
| Donation & Social Impact Network specification | Represented in this PRD |
| `docs/structure.md` | Inspected |
| `README.md` | Inspected |

**Conflict register:** At the time of writing, **no separate authoritative revised module specification files were located in the repository**. Therefore, no source conflicts were detected. If revised specification files are later added, they take precedence over this document for their respective modules, and any resulting discrepancies must be reconciled and recorded here.

### 1.5 Requirement Identification and Priority Scheme

Functional requirements use stable identifiers grouped by module:

| Prefix | Module |
| --- | --- |
| `FR-COM` | Common / shared platform |
| `FR-NPM` | New Product Marketplace |
| `FR-RUS` | Reuse / Old Product Marketplace |
| `FR-TSM` | Task & Soft Skills Marketplace |
| `FR-DON` | Donation & Social Impact Network |
| `FR-DS` | Data Science and analytics |
| `FR-XMD` | Cross-mode integration |

Non-functional requirements use `NFR-<AREA>-<nnn>`. Open decisions use `DEC-<nnn>`.

**Priority levels:**

| Priority | Meaning |
| --- | --- |
| **Must Have** | Essential to the agreed academic product scope; the demonstrable product depends on it. |
| **Should Have** | Important, but the initial product can still be demonstrated without it. |
| **Could Have** | Optional enhancement if time and capacity allow. |
| **Out of Scope** | Explicitly excluded from the initial product. |

The team should aim for a coherent, demonstrable product rather than classifying everything as Must Have.

---

## 2. Product Overview

### 2.1 Product Name and Tagline

- **Name:** CONFLUMIX
- **Tagline:** The Multi-Mode Marketplace for Local Exchange.

### 2.2 Product Concept

CONFLUMIX is a unified, multi-mode marketplace designed to support different forms of local exchange through one shared platform and data ecosystem. Instead of treating new products, pre-owned products, short-term digital tasks, and donations as four unrelated applications, CONFLUMIX brings these activities together under a common platform.

The platform has **four finalized marketplace modes**:

1. **New Product Marketplace**
2. **Reuse / Old Product Marketplace**
3. **Task & Soft Skills Marketplace**
4. **Donation & Social Impact Network**

Each mode has its own users, business rules, workflows, listing information, and lifecycle. They share appropriate infrastructure and may exchange relevant information through explicitly defined cross-mode transitions.

A shared **local discovery and location capability** supports these modes. It is **not** a fifth marketplace mode.

**Core product principle:**

> **One platform, multiple forms of value exchange, one shared data ecosystem.**

The product should provide a coherent experience while preserving the distinct requirements of each mode.

### 2.3 Product Vision

Create a unified local-exchange platform where people, businesses, task owners, skilled individuals, donors, and community organizations can participate in different forms of exchange without requiring four disconnected systems.

The long-term vision is to improve the visibility, discoverability, suitability, and reuse of available products, skills, and resources while creating structured data that can support meaningful analysis and better marketplace decisions.

Revenue generation, SaaS expansion, and commercial reuse are **potential future opportunities**, not mandatory deliverables of the initial academic project.

### 2.4 Marketplace Modes at a Glance

| # | Mode | Exchange Type | Primary Differentiator |
| --- | --- | --- | --- |
| 1 | New Product Marketplace | Purchase of new goods | Requirement-aware purchase confidence and safe reversible bulk operations |
| 2 | Reuse / Old Product Marketplace | Resale of pre-owned/refurbished goods | Transparent repair/price history and data-supported price benchmarks |
| 3 | Task & Soft Skills Marketplace | Short-term digital tasks | Problem-first publishing and proposal-based selection |
| 4 | Donation & Social Impact Network | Donation of usable resources | Rule-based urgency matching and recorded social impact |

---

## 3. Problem Statement

### 3.1 Problem Context

Different forms of exchange commonly occur through different platforms, channels, and informal processes. A person looking for a new product may use a retail marketplace. Someone seeking a used item may search a resale platform. A person needing a small digital task completed may use a freelancing website or personal contacts. A community organization seeking surplus resources may depend on donation networks or manual coordination.

These activities have different requirements, but they share a broader pattern: **people have something available, need something, can provide a service, or want to transfer resources to someone who can use them.**

> **Evidence disclaimer:** This PRD does **not** present any percentage of affected users, exact economic losses, claims that existing platforms are universally ineffective, claims that no competing platform offers similar features, or claims that CONFLUMIX is the first of its kind. Such statements would require external market research, which is outside this task.

### 3.2 Core Problem Statement

People, businesses, task owners, skilled individuals, donors, and resource seekers use different channels to exchange products, skills, and useful resources. These activities involve different listing requirements, discovery methods, trust considerations, workflows, and lifecycle rules. CONFLUMIX aims to bring these distinct exchange activities into one coherent platform while preserving their specific business needs and using shared data to improve discovery, transparency, resource utilization, and decision-making.

### 3.3 Supporting Problems

| ID | Problem | Description |
| --- | --- | --- |
| Problem A | Fragmented exchange activities | New-product purchases, pre-owned transactions, short-term tasks, and donations require different workflows. A user may have to move between separate services. |
| Problem B | Insufficient item-specific purchasing information | Listings may not adequately help buyers evaluate compatibility, product requirements, listing completeness, seller context, stock freshness, and transaction terms. |
| Problem C | Limited transparency in pre-owned transactions | Used-item buyers may struggle to evaluate repair history, asking-price changes, condition, and suitability for inspection before handover. |
| Problem D | Difficulty discovering short-term task opportunities | People who can solve small digital problems need a way to discover temporary, clearly described opportunities without long-term freelancing commitments. |
| Problem E | Underutilized surplus resources | Usable items may remain unused or be discarded while another person or organization needs similar resources; donation coordination is hard when supply and demand are managed separately. |
| Problem F | Limited cross-mode continuity | An item may move through different stages of its useful life. A platform with shared data can represent these transitions more coherently than disconnected records. |
| Problem G | Limited actionable marketplace data | Marketplace activity can reveal demand, supply gaps, skill demand, unsatisfied requests, return causes, price patterns, and resource utilization — but only when collected, validated, and interpreted responsibly. |

These problems **motivate** the proposed solution; the PRD does not claim that every problem has already been validated through external research.

---

## 4. Target Users and Stakeholders

### 4.1 Individuals and General Consumers

People who want to: purchase new products; buy or sell pre-owned goods; find suitable products based on requirements; sell items they no longer need; offer or discover short-term digital task opportunities; donate usable resources; and request resources when they have a legitimate need.

One unified account should support participation in multiple marketplace modes, subject to the permissions and verification requirements of each activity. **A user is not required to create four unrelated accounts.**

### 4.2 New-Product Sellers

- Individual sellers.
- Local shops and businesses.
- Product sellers with storefronts or multiple listings.

Needs include listing creation, category-specific product information, listing management, bulk operations, order visibility, promotion management, and seller analytics.

### 4.3 Pre-Owned and Reuse Sellers

- Individuals selling used possessions.
- Local businesses and second-hand shops.
- Refurbishment and repair shops.
- Lot importers and secondary dealers.
- Used-vehicle and property dealers.

Needs include condition disclosure, repair history, price transparency, offers, temporary reservations, inspection support, and turnover analysis.

### 4.4 Task Owners

Individuals or organizations that have a short-term digital problem or task to be completed. They need to describe the problem, define the expected outcome, review proposals, select a solver, manage the task's status, review the submission, and record completion.

### 4.5 Task Solvers

People who want to earn additional income by completing short-term digital tasks. They need to discover suitable opportunities, review task requirements, submit proposals, complete accepted work, and receive feedback.

The task marketplace is **not** intended to become a comprehensive long-term freelancing or agency-management system.

### 4.6 Donation Participants

**Donors:** individuals donating usable possessions; businesses providing surplus stock or supplies; NGOs and community organizations transferring resources.

**Resource seekers and beneficiaries:** individuals seeking essential items; NGOs and non-profits serving beneficiaries; community centers, welfare shelters, and other eligible organizations.

The platform must support appropriate **manual or simulated** verification for the academic implementation. It does **not** claim integration with government verification systems.

### 4.7 Internal Project Stakeholders

- The four-person development team.
- The project manager.
- Academic supervisors and evaluators.
- Testers and documentation contributors.

Academic stakeholders need demonstrable requirements traceability, understandable design decisions, working features, and evidence that implementation matches documented scope.

---

## 5. Proposed Solution

CONFLUMIX will provide **one web platform** with four mode-specific experiences supported by common infrastructure.

### 5.1 Shared Platform Capabilities

The intended product includes the following shared capabilities, applied where appropriate:

- Unified user accounts.
- Context-appropriate user roles and permissions.
- Seller, donor, or organization profiles.
- Category-based listings and discovery.
- Local discovery and location-related information.
- Search, filtering, and sorting.
- Relevant transaction or exchange records.
- Status and lifecycle management.
- Reviews or feedback where appropriate.
- Activity history and validation.
- Shared data collection for analytics.
- Cross-mode transitions for eligible products and resources.

These capabilities must **not** be implemented identically in every mode if the underlying business rules differ.

### 5.2 New Product Marketplace

Supports the listing, discovery, evaluation, and purchase of new products. Distinguishing mechanisms: category-specific requirement checks, explainable purchase-confidence summaries, requirement-aware alternatives, safe reversible bulk operations, purchase-failure prevention, and a defined lifecycle for products that may later enter reuse or donation modes.

### 5.3 Reuse / Old Product Marketplace

Supports used, pre-owned, refurbished, and surplus products. Distinguishing mechanisms: repair-history disclosure, temporary reservation locks following accepted offers, price-history visualization, category-specific handover checklists, data-supported fair-market price benchmarks, turnover analysis, and transitions into donation when appropriate.

### 5.4 Task & Soft Skills Marketplace

Supports short-term digital tasks and problem-solving opportunities. Organized around **the problem or task being offered**, not around automatically ranking or assigning skilled workers. Task owners publish problems and select from proposals; solvers discover opportunities and apply.

### 5.5 Donation & Social Impact Network

Supports donations and resource requests, including surplus supplies, usable goods, and community needs. Supports donation listings, resource requests, verification states, claims, allocation, reservation, handover, urgency, and impact reporting. The initial project **does not** include real-money donations or a logistics fleet.

---

## 6. Product Goals and Non-Goals

### 6.1 Primary Goals

| # | Goal |
| --- | --- |
| G1 | Deliver one coherent platform containing four distinct marketplace modes. |
| G2 | Preserve mode-specific workflows and business rules. |
| G3 | Provide shared account, discovery, listing, and data capabilities where appropriate. |
| G4 | Improve product decision-making through structured information and explainable rules. |
| G5 | Improve transparency in pre-owned transactions. |
| G6 | Connect short-term digital problems with people who can propose solutions. |
| G7 | Support the transfer of usable resources to people or organizations that need them. |
| G8 | Represent meaningful product and resource lifecycle transitions across modes. |
| G9 | Use actual marketplace data for Python-based data cleaning, analysis, statistics, and visualization. |
| G10 | Demonstrate appropriate use of Software Engineering, DSA, Data Science, and Computer Networks concepts. |
| G11 | Produce a maintainable foundation that can be extended after the academic project. |

### 6.2 Non-Goals

The initial project is **not intended to be**:

- A full Amazon-scale e-commerce platform.
- A full Fiverr or Upwork replacement.
- A complete ERP, CRM, or inventory-management suite.
- A real banking, payment-processing, or escrow platform.
- A logistics fleet or delivery-routing system.
- A government identity or business-verification integration.
- An advanced machine-learning recommendation engine.
- A full social network with sophisticated messaging and content feeds.
- A complex warehouse, tax, or enterprise advertising system.
- A fully automated charity-audit or NGO compliance platform.
- A subscription and billing business with production financial integrations.

Commercial scalability and SaaS potential are **future opportunities**, not requirements for the first academic release.

---

## 7. New Product Marketplace — Product Requirements

The New Product Marketplace specification referenced by the team is treated as authoritative for this module. The requirements below preserve its intent.

### 7.1 Seller Profiles and Storefronts

The product should support seller profiles and applicable verification status, seller storefronts, product listing ownership, relevant seller and listing information, and seller dashboards and activity visibility. **No real external verification integration is assumed or invented.**

### 7.2 Product Listings

Support product creation and editing; categories and category-specific attributes; product variations where appropriate; listing status and lifecycle; listing completeness and quality checks; stock and availability information; product detail pages; and structured information necessary for buyer requirements.

### 7.3 Bulk Management and Safe Reversible Operations

Provide bulk listing management with:

- Preview before applying a bulk change.
- Before-and-after values for affected fields.
- A clear list of excluded items and exclusion reasons.
- Explicit confirmation before execution.
- Activity history.
- Controlled rollback for eligible changes.
- Validation of current item state before rollback.
- Skipping items changed after the original operation, with recorded reasons.
- Rollback history and a clear record of what was restored.

Rollback **must not** blindly overwrite subsequent legitimate edits.

### 7.4 Import and Export

Support CSV/Excel import and export where appropriate, including validation and preview; detection of invalid rows; detection of duplicate identifiers within the import; clear validation errors; appropriate batch-processing rules; and reporting of imported, rejected, and excluded records. The product does **not** claim support for every spreadsheet format or unlimited import sizes.

### 7.5 Discovery and Purchase Workflow

Support search, filtering, sorting, product detail views, cart and demo checkout, order records and status, basic cancellation and return workflows, and applicable listing and stock validation. Payment processing is **simulated or demonstrative**; the product does not represent it as real banking integration.

### 7.6 Category-Specific Requirement Check

Allow buyers to specify relevant requirements and compare them with structured product attributes.

Examples: **Electronics** — wattage, connector type, supported device model. **Furniture** — dimensions and available space. **Clothing** — size and other relevant attributes.

The system should compare known requirements against known product attributes, identify mismatches, display clear explanations, distinguish confirmed mismatches from missing information, and **avoid claiming compatibility when the required information is unavailable**. Use explainable, deterministic rules for the initial implementation.

### 7.7 Purchase Confidence Summary

Provide a transparent summary of relevant purchase considerations, potentially including listing completeness; seller verification status and available history; stock information freshness; delivery and return terms; match with the buyer's stated requirements; and relevant return-pattern warnings when sufficient data exists.

The summary must **explain its underlying evidence**. The product must **not** invent a confidence percentage or present an arbitrary score as a scientifically validated probability.

### 7.8 Requirement-Aware Alternatives

When buyers have entered product requirements: prioritize alternatives that satisfy the known requirements; identify important differences and mismatches; explain why an alternative is or is not suitable; and fall back to ordinary related-product discovery when requirements are not supplied. The product does **not** claim sophisticated AI recommendations.

### 7.9 Purchase Failure Prevention System

Support structured recording of return and purchase-failure reasons: wrong size; compatibility problem; description mismatch; wrong product; damaged product; quality issue; missing feature; changed mind; other.

Where enough reliable transaction data exists, calculate relevant rates, identify recurring patterns by product or category, and produce corrective seller alerts or evidence-based buyer warnings.

Requirements: distinguish recorded facts from inferred patterns; avoid misleading warnings from insufficient sample sizes; provide traceable reasons for alerts; allow sellers to identify recurring issues; and avoid unsupported claims about product quality. **Complex ML is not required.**

### 7.10 Seller Analytics

Include appropriate analytics for listings and product activity; sales and transaction trends; return rates and reasons; recurring product or category problems; and relevant alerts and corrective actions.

### 7.11 Promotion Conflict Checking

Support promotions or coupons and a deterministic conflict checker that detects overlapping discounts and warns about potential combined discounts. This must **not** expand into a sophisticated advertising or campaign-automation engine.

### 7.12 Cross-Mode Product Lifecycle

Represent the intended lifecycle:

> **New Product → Purchased → Owned → No Longer Needed → Reuse or Donation**

Transitions must preserve relevant product identity and history where appropriate and validate that the product is eligible for the target mode. The transition is **not** an automatic transfer of ownership without user action or necessary confirmation.

---

## 8. Reuse / Old Product Marketplace — Product Requirements

The Reuse / Old Product Marketplace specification referenced by the team is treated as authoritative for this module. The requirements below preserve its intent.

### 8.1 Seller Types and Profiles

Support the intended seller categories: **Individual**; **Local business or shop**; **Refurbishment or repair shop**; **Lot importer**; **Used-vehicle or property dealer**.

Relevant profile information may include contact details, neighborhood or location, product categories, handover methods, inspection arrangements, and return or exchange policies.

Verification must be **manual or simulated** for the initial release, with understandable states such as **Unverified**, **Basic Verified Citizen**, and **Local Business Verified**. These states must **not** imply an actual government verification integration.

### 8.2 Pre-Owned Listings

Support used, pre-owned, refurbished, and surplus goods; category-specific attributes for electronics, furniture, fashion, vehicles, property, and other agreed categories; condition grades; listing lifecycle; seller dashboards and storefronts; search, filters, and sorting; listing management; CSV/Excel import and export; safe reversible bulk operations; and appropriate deterministic batch rules. **Not every category requires identical attributes.**

### 8.3 Offers and Reservations

Support direct offers and counteroffers. After an offer is accepted, implement an **Auto-Expiring Offer & Reservation Lock**:

1. An accepted offer temporarily reserves the item.
2. The reservation prevents conflicting offers or orders according to the agreed reservation policy.
3. A deadline is established (for example, a configurable 24-hour period).
4. If the required checkout or handover scheduling step is not completed before expiration, the reservation is released.
5. The listing returns to the appropriate active state if still eligible.
6. State transitions are validated to prevent stale or conflicting operations.

The exact deadline and handling of edge cases remain configurable product decisions unless otherwise resolved by the revised specification (**see DEC-003**).

### 8.4 Repair and Refurbishment Disclosure

Provide a **Refurbishment & Repair Disclosure Logger** recording a chronological history of relevant repair or maintenance events. Potential fields: component; date; repair type; DIY / third-party / authorized repair classification; notes; and applicable parts warranty information. The product should communicate that records are **disclosures**, not independently verified proof of repair quality unless verification evidence exists.

### 8.5 Price History and Discount Visualization

Provide a **Price History Tracker & Discount Visualizer** showing available historical asking prices, dates, changes, and relevant percentage reductions. **Distinguish asking-price history from completed transaction prices.** The product must not imply that a listed discount necessarily represents a genuine market saving.

### 8.6 Category-Based In-Person Handover Checklist

Provide a checklist appropriate to the item's category to support inspection before the buyer and seller confirm handover. Examples: **Electronics** — screen, ports, connectivity, Wi-Fi, relevant device identifiers. **Vehicles** — engine, tires, visible leaks, registration information, chassis-related checks. **Furniture** — stability, joints, upholstery.

The checklist is a **decision-support mechanism**. It is not a professional inspection certificate or a guarantee against defects. No real escrow is introduced as a prerequisite.

### 8.7 Fair Market Price Benchmark

Provide a **Python-powered Fair Market Price Benchmark** using suitable historical completed transactions. The analysis should:

- Select comparable transactions by relevant category, model, and condition.
- Exclude unsuitable or invalid comparisons.
- Calculate a reasonable reference range using basic statistics.
- Use the **25th–75th percentile range** when sufficient comparable observations exist.
- Explain the limitations of the comparison data.
- Distinguish asking prices from completed transaction prices.

If there is insufficient comparable data, the system **must state that a reliable benchmark is unavailable instead of fabricating a price range**. The product must not promise predictive accuracy or claim that a statistical reference is a guaranteed fair price.

### 8.8 Turnover and Pricing Analytics

Support analysis of average days listed; offer conversion; category demand; available pricing guidance; and relevant listing and transaction activity. Definitions and denominators for these metrics must be clear.

### 8.9 Other Supported Workflows

Preserve the intended foundations for listing lifecycle management; demo checkout and order status; promotions and promotion-conflict warnings; seller analytics; bulk operations with previews, history, and controlled rollback; CSV/Excel imports and exports; and cross-mode transitions.

### 8.10 Reuse-to-Donation Transition

An eligible unsold or no-longer-needed used item may be transferred into the Donation & Social Impact Network through a guided handoff. The transition should preserve relevant item information while applying the target mode's own listing and allocation rules.

---

## 9. Task & Soft Skills Marketplace — Product Requirements

### 9.1 Purpose

Provide a public, **problem-first** marketplace for short-term digital tasks.

> **We are not building a skill-matching platform. We are building a problem-to-opportunity marketplace.**

The objective is to help people who need small digital problems solved connect with people interested in completing those tasks, including people seeking additional part-time income. This is not intended to reproduce a complete long-term freelancing platform.

### 9.2 User Roles

A unified account can act in different contexts: **Problem Owner** and **Problem Solver**. A separate account is not required for each context. A lightweight solver profile may be available, but **posting a problem must not require the user to build an extensive professional profile first.**

### 9.3 Task Publishing and Discovery

Support creating and publishing a task or problem; describing the problem and expected outcome; relevant categories; basic search and filters; viewing task details; submitting proposals or applications; reviewing proposals; selecting a solver; recording work progress; submitting the solution; and reviewing completion and providing feedback. The product does **not** claim that task completion is guaranteed by the platform.

### 9.4 Task Lifecycle

Intended lifecycle:

> **Draft → Published → Receiving Proposals → Under Review → Solver Selected → In Progress → Submitted → Revision → Completed → Closed**

Where appropriate, support additional terminal or exceptional states such as **Cancelled**, **Expired**, and **Disputed**. Transitions must be validated, and permitted actions should depend on the task's current state and the user's role. Not every task must use every state when the workflow does not require it.

### 9.5 Explicit Exclusions

The initial project excludes: automatic skill matching; automatic solver assignment; explainable matching engines; AI recommendations; skill assessments or certification verification; availability/workload optimization; complex milestone management; full project-management suites; built-in video conferencing; advanced escrow or real payment integrations; sophisticated dispute resolution; enterprise freelancing or agency management; and subscription billing. These are **not** implied requirements.

---

## 10. Donation & Social Impact Network — Product Requirements

### 10.1 Purpose

Connect available, usable resources with people or organizations that need them. The platform supports donations and resource requests from individuals, businesses, NGOs, community centers, welfare shelters, and other appropriate community participants.

Central workflow:

> **Resource or Supply → Identified Need → Matching or Allocation → Reservation → Handover → Recorded Impact**

### 10.2 Participant Contexts

Support appropriate contexts for: **Individual Donor**; **Corporate or Local Business Donor**; **Individual Receiver or Beneficiary**; **Registered NGO or Non-Profit**; and **Community Center or Welfare Shelter**. Verification may be manual or simulated. The product does **not** claim external registration or government verification integration.

### 10.3 Donation Listings and Resource Requests

Support creating donation listings; creating resource requests; titles, descriptions, and relevant photos; category and condition; quantity and availability; location and pickup information; relevant handling or safety conditions; intended use or need information where appropriate; urgency indicators; and listing lifecycle and activity history.

Potential categories include medical and mobility resources; food and essential supplies; books, educational materials, and laptops; clothing, bedding, and household items. **Category-specific attributes must reflect the item type** (for example, food may require expiry, packaging, and storage information).

### 10.4 Condition States

Intended condition vocabulary: **Brand New / Surplus**; **Like New**; **Good / Fully Functional**; **Minor Repair Needed**. Apply condition rules appropriate to the resource category. The product must not imply that every item in a category is safe or suitable for donation merely because it is listed.

### 10.5 Donation Lifecycle

Intended lifecycle:

> **Draft → Pending Review → Active → Claim Requested → Reserved/Approved → Handover Completed → Archived**

Support appropriate cancellation or rejection paths where needed, without inventing a complex dispute-management system.

### 10.6 Bulk Donation Management

Support bulk listing actions; relevant anti-resale locking; claim limit rules; activity history; CSV/Excel imports for suitable business or surplus inventories; import validation and error reporting; and required safety-related information. This is **not** an enterprise warehouse system.

### 10.7 Discovery and Allocation

Support discovery by appropriate factors such as category; condition; verification status; proximity or locality where location data is available; availability; urgency; and relevant sorting options.

Receivers can submit claims that explain their need and intended use. Donors can review claims and select recipients. Rule-based or manually controlled allocation may be used where appropriate. The product does **not** claim that automated allocation always identifies the most deserving recipient.

### 10.8 Handover

Support practical handover coordination including pickup or drop-off information; a scheduled time window; digital confirmation codes or QR-based confirmation if selected for the implementation; and completion records. The product does **not** include a real-time delivery fleet, complex route optimization, or a real payment/escrow system.

### 10.9 Urgency & Cause Match Checker

Support a rule-based mechanism that compares urgent resource needs (such as those reported by NGOs or during disaster relief) with relevant available donation listings. Where suitable matches exist, the platform may notify relevant donors or display an alert. The mechanism must:

- Compare relevant categories, quantities, locations, urgency, and availability where data exists.
- Explain why a resource and need are considered relevant.
- Avoid claiming a match when essential information is missing.
- Avoid guaranteeing successful fulfillment.

**Machine learning is not required.**

### 10.10 Anti-Resale and Claim Controls

Define product intent for preventing inappropriate resale of designated donations; applying claim limits where configured; avoiding duplicate or conflicting claims; and recording allocation and handover activity. The product must **not** claim these controls can prevent all off-platform resale or misuse.

### 10.11 Social-Impact Analytics

Support meaningful analytics such as estimated monetary value of donated resources; estimated weight diverted from landfill where weight data exists; number of beneficiaries or completed handovers; category-level response times; resource availability versus requests; and unmatched or urgent needs. **Distinguish recorded counts from estimates** and document assumptions for any derived impact metrics.

---

## 11. Shared Product Behaviors and Cross-Mode Integration

### 11.1 Unified Identity and Role-Aware Actions

The same account should participate in different modes without creating separate identities. Access to actions must depend on the current user context, ownership, verification state, and applicable business rules.

### 11.2 Local Marketplace and Discovery

Location is a **shared discovery capability, not a fifth marketplace mode**. The platform should use available location information to support local discovery and filtering. The product does **not** require precise GPS tracking or real-time location monitoring.

### 11.3 Listing and Lifecycle Consistency

Each mode must define its own listing lifecycle and allowed state transitions. Shared concepts must not erase mode-specific rules. For example:

- A new product's purchase lifecycle differs from a donation's claim lifecycle.
- An accepted reuse offer creates a temporary reservation.
- A task's completion depends on task submission and review.
- A donation's completion depends on the appropriate handover process.

### 11.4 Cross-Mode Transitions

Support the intended product lifecycle:

> **New Product → Purchased → Owned → No Longer Needed → Reuse or Donation**

Support reuse-to-donation handoff for eligible items. The product must avoid duplicate active listings or conflicting ownership/availability states when an item transitions between modes. This PRD describes these outcomes at the **product level** and does not define database schemas or API calls.

### 11.5 Shared Data Ecosystem

Relevant data may include users and profiles; businesses and sellers; product and reuse listings; tasks and proposals; donation listings and resource requests; locations; transactions and handovers; reviews and feedback; and activity and lifecycle events. Only collect data needed for legitimate product functions and agreed analytics. The product does **not** provide broad surveillance or tracking capability.

---

## 12. Data Science and Analytics Requirements

Data Science is a **core component** of CONFLUMIX, not merely a decorative dashboard. The platform should produce meaningful structured data that can be exported, validated, analyzed, and visualized using Python.

### 12.1 Analytics Workflow

> **Marketplace Activity → Data Collection → Validation → Cleaning → Transformation → Exploratory Data Analysis → Statistical Analysis → Visualization → Insights**

Planned stack: Python; Pandas; NumPy; Matplotlib; Seaborn; FastAPI for the separate analytics service; and CSV/Excel data for suitable workflows. This PRD expresses required analytical **outcomes** without prescribing implementation-level algorithms.

### 12.2 Data Quality

Analytics must consider missing values; duplicate records; inconsistent categories and capitalization; invalid prices or dates; abnormal values; inconsistent location information; insufficient sample sizes; and inconsistent or incomplete transaction records. Derived metrics must use **documented definitions** and suitable source data.

### 12.3 New Product Marketplace Analytics

Potential analyses: product demand and supply; category activity; sales and transaction trends; seller activity; return rates and reasons; recurring purchase-failure patterns; and relevant corrective alerts.

### 12.4 Reuse Marketplace Analytics

Potential analyses: category-level reuse activity; condition distribution; price patterns; completed-transaction price benchmarks; unsold items and demand; average listing duration; and offer conversion and turnover.

### 12.5 Task Marketplace Analytics

Potential analyses: requested task categories; skills referenced in tasks; published and completed tasks; proposal and completion activity; uncompleted tasks; and demand compared with available proposals or solvers. These are **analytical insights, not an automatic worker-matching engine**.

### 12.6 Donation Analytics

Potential analyses: available resources versus requested resources; unmatched needs; donation and claim activity; category-level demand; handover completion; response times; urgent resource needs; and estimated impact.

### 12.7 Cross-Mode Analytics

Where suitable data exists, analyze product-to-reuse transitions; reuse-to-donation transitions; local demand and supply patterns; shared category trends; and unmet demand across relevant modes. The product must **not** fabricate sample results and present them as actual platform insights.

### 12.8 Analytics Limitations

The product must communicate when data is insufficient, biased, stale, or unsuitable for a conclusion. The initial project does **not** require advanced machine learning. Basic statistics, deterministic rules, and transparent analytical methods are appropriate.

---

## 13. Functional Requirements Catalogue

Each requirement lists: **ID**, **Title**, **Description**, **Priority**, **Module**, **Acceptance Criteria**, and **Dependencies / Limitations**. Priorities: Must Have (MH), Should Have (SH), Could Have (CH), Out of Scope (OOS).

### 13.1 Common Platform Requirements (`FR-COM`)

| ID | Title | Priority | Module |
| --- | --- | --- | --- |
| FR-COM-001 | Unified user account | Must Have | Common |
| FR-COM-002 | Role-aware permissions | Must Have | Common |
| FR-COM-003 | User / seller / donor profiles | Must Have | Common |
| FR-COM-004 | Search, filtering, sorting | Must Have | Common |
| FR-COM-005 | Local discovery and location capability | Should Have | Common |
| FR-COM-006 | Listing lifecycle framework | Must Have | Common |
| FR-COM-007 | Reviews and feedback | Should Have | Common |
| FR-COM-008 | Activity history and audit trail | Should Have | Common |
| FR-COM-009 | Shared data collection for analytics | Must Have | Common |
| FR-COM-010 | Cross-mode transition framework | Must Have | Common |

**FR-COM-001 — Unified user account**

- *Description:* A single account allows a user to participate in any marketplace mode without creating separate accounts per mode.
- *Acceptance criteria:* A registered user can access all four modes with one login; no mode requires a duplicate account; account context is consistently identified across modes.
- *Dependencies/Limitations:* Depends on Supabase Auth configuration (later task).

**FR-COM-002 — Role-aware permissions**

- *Description:* Actions are restricted by the user's current context, ownership, verification state, and applicable business rules.
- *Acceptance criteria:* A user cannot perform an action their context disallows; unauthorized attempts are rejected with a clear message.
- *Dependencies/Limitations:* Role model details are TBD (**DEC-002**).

**FR-COM-003 — User / seller / donor profiles**

- *Description:* Users can maintain profile information appropriate to their participation (consumer, seller, donor, organization).
- *Acceptance criteria:* Profile data can be created and edited; mode-relevant fields are captured; profile information is displayed where relevant.
- *Dependencies/Limitations:* Verification states are manual/simulated.

**FR-COM-004 — Search, filtering, sorting**

- *Description:* Users can search, filter, and sort listings within each mode using mode-relevant criteria.
- *Acceptance criteria:* Search returns matching listings; filters narrow results; sorting changes order deterministically; empty results are indicated clearly.
- *Dependencies/Limitations:* Supported filter fields are TBD per mode (**DEC-005**).

**FR-COM-005 — Local discovery and location capability**

- *Description:* Available location information supports local discovery and filtering; it is a shared capability, not a mode.
- *Acceptance criteria:* Listings can be associated with location data; results can be filtered by locality where data exists; missing location is handled without error.
- *Dependencies/Limitations:* No precise GPS or real-time tracking required.

**FR-COM-006 — Listing lifecycle framework**

- *Description:* Listings across modes share a lifecycle framework while retaining mode-specific states and transitions.
- *Acceptance criteria:* Each mode defines its own states; invalid transitions are prevented; state is visible to the relevant user.
- *Dependencies/Limitations:* Mode-specific lifecycles defined in §7–§10.

**FR-COM-007 — Reviews and feedback**

- *Description:* Provide reviews/feedback where appropriate to a mode (for example, sellers, solvers, donors, receivers).
- *Acceptance criteria:* Feedback can be recorded after an eligible completed interaction; displayed feedback is attributable to a completed interaction.
- *Dependencies/Limitations:* Eligibility rules are TBD (**DEC-009**).

**FR-COM-008 — Activity history and audit trail**

- *Description:* Record relevant activity and lifecycle events for listings, transactions, and handovers.
- *Acceptance criteria:* Key actions (create, edit, status change, bulk operation, rollback, handover) are recorded with actor and timestamp.
- *Dependencies/Limitations:* Retention policy is TBD (**DEC-007**).

**FR-COM-009 — Shared data collection for analytics**

- *Description:* Capture only the structured data needed for legitimate product functions and agreed analytics.
- *Acceptance criteria:* Analytics-relevant events are recorded in a structured, exportable form; no unnecessary personal data is collected.
- *Dependencies/Limitations:* Data dictionary TBD (**DEC-006**).

**FR-COM-010 — Cross-mode transition framework**

- *Description:* Provide a product-level framework for eligible items to move between modes with continuity of identity and history.
- *Acceptance criteria:* Eligible items can transition; ineligible transitions are rejected with explanation; duplicate active listings are prevented.
- *Dependencies/Limitations:* See §11.4 and FR-XMD requirements.

### 13.2 New Product Marketplace (`FR-NPM`)

| ID | Title | Priority |
| --- | --- | --- |
| FR-NPM-001 | Seller profiles and storefronts | Should Have |
| FR-NPM-002 | Product listings with category attributes | Must Have |
| FR-NPM-003 | Listing completeness and quality checks | Should Have |
| FR-NPM-004 | Bulk operation preview | Must Have |
| FR-NPM-005 | Controlled rollback of bulk operations | Must Have |
| FR-NPM-006 | CSV/Excel import with validation | Should Have |
| FR-NPM-007 | CSV/Excel export | Should Have |
| FR-NPM-008 | Product search, filter, sort | Must Have |
| FR-NPM-009 | Cart and demo checkout | Must Have |
| FR-NPM-010 | Order records and status | Must Have |
| FR-NPM-011 | Cancellation and return workflow | Should Have |
| FR-NPM-012 | Category-Specific Requirement Check | Must Have |
| FR-NPM-013 | Purchase Confidence Summary | Should Have |
| FR-NPM-014 | Requirement-Aware Alternatives | Should Have |
| FR-NPM-015 | Purchase-failure reason recording | Should Have |
| FR-NPM-016 | Recurring issue analysis and evidence-based warnings | Could Have |
| FR-NPM-017 | Seller analytics | Should Have |
| FR-NPM-018 | Promotion conflict checking | Should Have |
| FR-NPM-019 | Cross-mode lifecycle (New → Reuse/Donation) | Should Have |

**FR-NPM-001 — Seller profiles and storefronts**

- *Description:* Sellers can present a profile and storefront with their listings and relevant information.
- *Acceptance criteria:* A seller storefront lists that seller's listings; seller status is displayed; listing ownership is attributable to the seller.
- *Dependencies/Limitations:* No external verification integration.

**FR-NPM-002 — Product listings with category attributes**

- *Description:* Sellers can create and edit product listings with category-specific structured attributes, variations where appropriate, stock/availability, and lifecycle status.
- *Acceptance criteria:* Listings can be created in supported categories; category attributes are captured; listing status can change; detail pages display structured information.
- *Dependencies/Limitations:* Supported categories/attributes are TBD (**DEC-004**).

**FR-NPM-003 — Listing completeness and quality checks**

- *Description:* The system evaluates listing completeness and quality against category expectations.
- *Acceptance criteria:* Incomplete listings are flagged; the missing fields are identified; the seller can resolve flagged issues.

**FR-NPM-004 — Bulk operation preview**

- *Description:* Before applying a bulk change, the system shows affected items, before/after values, and excluded items with reasons.
- *Acceptance criteria:* A preview is shown before execution; before/after values are displayed; excluded items and reasons are listed; explicit confirmation is required.
- *Dependencies/Limitations:* Batch size limits are TBD (**DEC-010**).

**FR-NPM-005 — Controlled rollback of bulk operations**

- *Description:* Eligible bulk operations can be rolled back safely.
- *Acceptance criteria:* Rollback validates current item state; items edited after the operation are skipped with recorded reasons; rollback history is recorded; subsequent legitimate edits are not overwritten.

**FR-NPM-006 — CSV/Excel import with validation**

- *Description:* Import listings, validating rows and detecting duplicates within the import.
- *Acceptance criteria:* Import preview is shown; invalid rows are reported with errors; duplicate identifiers within the import are detected; imported/rejected/excluded counts are reported.
- *Dependencies/Limitations:* Not all formats/sizes supported.

**FR-NPM-007 — CSV/Excel export**

- *Description:* Export listing and relevant data to CSV/Excel.
- *Acceptance criteria:* Export produces a valid file; exported columns match agreed fields; empty datasets export cleanly.

**FR-NPM-008 — Product search, filter, sort**

- *Description:* Buyers can search, filter, and sort new products.
- *Acceptance criteria:* Results match query; filters apply; sorting is deterministic.

**FR-NPM-009 — Cart and demo checkout**

- *Description:* Buyers can add items to a cart and complete a simulated checkout.
- *Acceptance criteria:* Cart persists selected items; checkout validates listing and stock; a simulated order is created; the process is clearly demonstrative, not real payment.

**FR-NPM-010 — Order records and status**

- *Description:* Orders are recorded with status visible to buyer and seller.
- *Acceptance criteria:* An order is created on checkout; status can progress through defined states; each party sees relevant status.

**FR-NPM-011 — Cancellation and return workflow**

- *Description:* Support basic cancellation and return flows with reasons.
- *Acceptance criteria:* Eligible orders can be cancelled/returned; a reason can be recorded; status reflects the outcome.

**FR-NPM-012 — Category-Specific Requirement Check**

- *Description:* The system allows a buyer to provide relevant product requirements and compares them with the product's available structured attributes using deterministic rules.
- *Acceptance criteria:* The buyer can enter requirements for a supported category; the system identifies known mismatches; missing product information is distinguished from a confirmed mismatch; the displayed result explains the comparison; the system does not claim confirmed compatibility when necessary information is unavailable.
- *Dependencies/Limitations:* Requires structured attributes (FR-NPM-002); supported requirements per category are TBD (**DEC-004**).

**FR-NPM-013 — Purchase Confidence Summary**

- *Description:* Provide an explainable summary of relevant purchase considerations based on available evidence.
- *Acceptance criteria:* The summary lists the evidence considered; each factor is explained; insufficient evidence is stated rather than scored; no arbitrary confidence percentage is presented.
- *Dependencies/Limitations:* Warns only when sufficient data exists (FR-NPM-016).

**FR-NPM-014 — Requirement-Aware Alternatives**

- *Description:* When requirements are provided, prioritize alternatives that satisfy them and explain differences; otherwise fall back to ordinary related-product discovery.
- *Acceptance criteria:* Alternatives satisfiable against requirements are prioritized; differences/mismatches are explained; fallback occurs when no requirements are supplied.

**FR-NPM-015 — Purchase-failure reason recording**

- *Description:* Record structured return/purchase-failure reasons from the agreed list.
- *Acceptance criteria:* Reasons are selectable from the defined set (plus "Other"); recorded reasons are attributable to a transaction; data is available for analysis.

**FR-NPM-016 — Recurring issue analysis and evidence-based warnings**

- *Description:* When sufficient reliable data exists, identify recurring patterns by product/category and produce traceable seller alerts or buyer warnings.
- *Acceptance criteria:* Patterns are computed only above the minimum sample threshold; recorded facts are distinguished from inferred patterns; each alert states its traceable reasons; no warnings are shown below threshold.
- *Dependencies/Limitations:* Minimum sample size TBD (**DEC-005**).

**FR-NPM-017 — Seller analytics**

- *Description:* Provide new-product seller analytics on listings, sales, returns, and recurring problems.
- *Acceptance criteria:* Analytics are derived from actual recorded data; metric definitions are documented; empty/insufficient data is indicated.

**FR-NPM-018 — Promotion conflict checking**

- *Description:* Deterministic detection of overlapping discounts and warnings about combined discounts.
- *Acceptance criteria:* Overlapping promotions are detected; a warning explains the conflict; behavior is deterministic.

**FR-NPM-019 — Cross-mode lifecycle (New → Reuse/Donation)**

- *Description:* Eligible purchased products can transition into the Reuse or Donation mode with continuity of identity and history.
- *Acceptance criteria:* Only eligible products can transition; identity/history is preserved; ownership transfer requires user action and confirmation; no duplicate active listing results.
- *Dependencies/Limitations:* See FR-XMD-001.

### 13.3 Reuse / Old Product Marketplace (`FR-RUS`)

| ID | Title | Priority |
| --- | --- | --- |
| FR-RUS-001 | Reuse seller types and profiles | Should Have |
| FR-RUS-002 | Manual/simulated verification states | Must Have |
| FR-RUS-003 | Pre-owned listings with condition grades | Must Have |
| FR-RUS-004 | Offers and counteroffers | Must Have |
| FR-RUS-005 | Auto-Expiring Offer & Reservation Lock | Must Have |
| FR-RUS-006 | Refurbishment & Repair Disclosure Logger | Must Have |
| FR-RUS-007 | Price History Tracker & Discount Visualizer | Should Have |
| FR-RUS-008 | Category-based handover checklist | Should Have |
| FR-RUS-009 | Python-powered Fair Market Price Benchmark | Should Have |
| FR-RUS-010 | Turnover and pricing analytics | Should Have |
| FR-RUS-011 | Reuse search, filter, sort | Must Have |
| FR-RUS-012 | CSV/Excel import and export | Should Have |
| FR-RUS-013 | Bulk operations with preview and controlled rollback | Should Have |
| FR-RUS-014 | Promotions and conflict warnings | Could Have |
| FR-RUS-015 | Reuse-to-donation transition | Should Have |
| FR-RUS-016 | Demo checkout and order status | Must Have |

**FR-RUS-001 — Reuse seller types and profiles**

- *Description:* Support the intended seller categories with relevant profile information.
- *Acceptance criteria:* Sellers can select a type; relevant profile fields are captured and displayed.
- *Dependencies/Limitations:* Category-specific fields are TBD (**DEC-004**).

**FR-RUS-002 — Manual/simulated verification states**

- *Description:* Represent verification states (Unverified, Basic Verified Citizen, Local Business Verified) via manual/simulated review.
- *Acceptance criteria:* A seller's verification state is visible; states are set through a manual/simulated process; the UI does not imply government verification.

**FR-RUS-003 — Pre-owned listings with condition grades**

- *Description:* Sellers can list used/refurbished/surplus goods with condition grades and category attributes.
- *Acceptance criteria:* Listings capture condition; category attributes are captured; lifecycle status is managed; detail pages display condition and disclosed information.

**FR-RUS-004 — Offers and counteroffers**

- *Description:* Buyers can make offers and sellers can counter.
- *Acceptance criteria:* An offer can be submitted; a counteroffer can be issued; offer/counter history is visible; states are validated.

**FR-RUS-005 — Auto-Expiring Offer & Reservation Lock**

- *Description:* An accepted offer temporarily reserves the item until a deadline; failure to complete the next required step releases the reservation.
- *Acceptance criteria:* Acceptance creates a reservation; conflicting offers/orders are prevented per policy; a deadline is set; expiration releases the reservation and restores the listing if eligible; stale/conflicting operations are rejected.
- *Dependencies/Limitations:* Deadline default and edge cases are TBD (**DEC-003**).

**FR-RUS-006 — Refurbishment & Repair Disclosure Logger**

- *Description:* Record a chronological repair/maintenance history with classification and notes.
- *Acceptance criteria:* Entries can be added with component, date, type, classification, and notes; history is chronological; the UI states records are disclosures, not verified proof.

**FR-RUS-007 — Price History Tracker & Discount Visualizer**

- *Description:* Display available asking-price history and percentage changes.
- *Acceptance criteria:* Asking-price changes are shown with dates; percentage reductions are computed; asking prices are distinguished from completed transaction prices; no claim that a discount is a genuine market saving.

**FR-RUS-008 — Category-based handover checklist**

- *Description:* Provide an item-category checklist to support inspection before handover confirmation.
- *Acceptance criteria:* The checklist matches the item's category; items can be marked checked/unchecked; the checklist is labeled as decision support, not an inspection certificate.

**FR-RUS-009 — Python-powered Fair Market Price Benchmark**

- *Description:* Produce a reference price range from sufficiently comparable completed transactions using basic statistics.
- *Acceptance criteria:* Comparables are selected by category/model/condition; invalid comparisons are excluded; a 25th–75th percentile range is produced when sufficient data exists; limitations are stated; when data is insufficient, the system states no reliable benchmark is available; asking and completed prices are distinguished.
- *Dependencies/Limitations:* Minimum comparable count is TBD (**DEC-005**); depends on recorded completed transactions.

**FR-RUS-010 — Turnover and pricing analytics**

- *Description:* Provide reuse analytics on listing duration, offer conversion, category demand, and pricing guidance.
- *Acceptance criteria:* Metrics are computed from recorded data; definitions and denominators are documented; insufficient data is indicated.

**FR-RUS-011 — Reuse search, filter, sort**

- *Description:* Buyers can search, filter, and sort reuse listings.
- *Acceptance criteria:* Results match query; filters (condition, category, location) apply; sorting is deterministic.

**FR-RUS-012 — CSV/Excel import and export**

- *Description:* Import and export reuse listings with validation.
- *Acceptance criteria:* Import preview and validation errors are shown; duplicates within the import are detected; export produces a valid file.

**FR-RUS-013 — Bulk operations with preview and controlled rollback**

- *Description:* Bulk actions on reuse listings with preview, history, and controlled rollback consistent with FR-NPM-004/005.
- *Acceptance criteria:* Preview shows affected/excluded items; confirmation is required; rollback validates state and skips changed items; history is recorded.

**FR-RUS-014 — Promotions and conflict warnings**

- *Description:* Optional promotions with deterministic conflict warnings.
- *Acceptance criteria:* Overlapping promotions are detected and explained.

**FR-RUS-015 — Reuse-to-donation transition**

- *Description:* An eligible unsold/no-longer-needed item can be handed off to the Donation mode via a guided flow.
- *Acceptance criteria:* Only eligible items can transition; relevant item info is preserved; donation-mode rules apply; no duplicate active listing results.

**FR-RUS-016 — Demo checkout and order status**

- *Description:* Support a demonstrative checkout and order status for reuse transactions.
- *Acceptance criteria:* A simulated order can be created after an accepted offer; status is visible; process is clearly demonstrative.

### 13.4 Task & Soft Skills Marketplace (`FR-TSM`)

| ID | Title | Priority |
| --- | --- | --- |
| FR-TSM-001 | Publish a task/problem | Must Have |
| FR-TSM-002 | Task discovery (search/filter) | Must Have |
| FR-TSM-003 | Submit proposals/applications | Must Have |
| FR-TSM-004 | Review proposals and select solver | Must Have |
| FR-TSM-005 | Task progress and solution submission | Must Have |
| FR-TSM-006 | Completion review and feedback | Should Have |
| FR-TSM-007 | Task lifecycle state validation | Must Have |
| FR-TSM-008 | Lightweight solver profile | Should Have |

**FR-TSM-001 — Publish a task/problem**

- *Description:* A problem owner can draft and publish a task describing the problem, expected outcome, and category without an extensive profile.
- *Acceptance criteria:* A task can be drafted and published; the problem and expected outcome are required; publishing does not require a full professional profile.

**FR-TSM-002 — Task discovery (search/filter)**

- *Description:* Solvers can discover published tasks via search and filters.
- *Acceptance criteria:* Published tasks are discoverable; search/filter narrow results; task detail shows the problem and expected outcome.

**FR-TSM-003 — Submit proposals/applications**

- *Description:* Solvers can submit proposals/applications for a published task.
- *Acceptance criteria:* A proposal can be submitted for an open task; proposals are visible to the task owner; duplicate proposals are handled per rule.

**FR-TSM-004 — Review proposals and select solver**

- *Description:* The task owner can review proposals and select a solver.
- *Acceptance criteria:* The owner sees submitted proposals; a solver can be selected; selection moves the task to the appropriate state.

**FR-TSM-005 — Task progress and solution submission**

- *Description:* The selected solver can mark progress and submit the solution for review.
- *Acceptance criteria:* The task can move to In Progress and then Submitted; the submission is visible to the owner.

**FR-TSM-006 — Completion review and feedback**

- *Description:* The owner reviews the submission and provides feedback; completion can be recorded.
- *Acceptance criteria:* A submission can be reviewed; revision can be requested or completion recorded; feedback can be attached.
- *Dependencies/Limitations:* The platform does not guarantee task completion.

**FR-TSM-007 — Task lifecycle state validation**

- *Description:* Enforce the defined task lifecycle and prevent invalid transitions.
- *Acceptance criteria:* States match §9.4; invalid transitions are rejected; permitted actions depend on state and role.

**FR-TSM-008 — Lightweight solver profile**

- *Description:* Provide a minimal solver profile without requiring professional-profile building.
- *Acceptance criteria:* A solver can participate with minimal profile data; posting tasks does not depend on solver profile completeness.

### 13.5 Donation & Social Impact Network (`FR-DON`)

| ID | Title | Priority |
| --- | --- | --- |
| FR-DON-001 | Donation listings | Must Have |
| FR-DON-002 | Resource requests | Must Have |
| FR-DON-003 | Category-specific attributes | Should Have |
| FR-DON-004 | Condition vocabulary and category rules | Must Have |
| FR-DON-005 | Donation lifecycle | Must Have |
| FR-DON-006 | Bulk donation management and anti-resale locking | Should Have |
| FR-DON-007 | Claim limits and duplicate prevention | Should Have |
| FR-DON-008 | Discovery and filtering | Must Have |
| FR-DON-009 | Claim submission and donor selection | Must Have |
| FR-DON-010 | Handover coordination and confirmation | Must Have |
| FR-DON-011 | Urgency & Cause Match Checker | Should Have |
| FR-DON-012 | Social-impact analytics | Should Have |

**FR-DON-001 — Donation listings**

- *Description:* Donors can create donation listings with description, category, condition, quantity, location/pickup information, and urgency.
- *Acceptance criteria:* A donation listing can be created and edited; required fields are captured; the listing appears in discovery once active.

**FR-DON-002 — Resource requests**

- *Description:* Receivers/NGOs can create resource requests describing the need and intended use.
- *Acceptance criteria:* A request can be created with need details; requests are discoverable to donors; urgency can be indicated.

**FR-DON-003 — Category-specific attributes**

- *Description:* Category attributes reflect the item type (e.g., food requires expiry, packaging, storage information).
- *Acceptance criteria:* Supported categories capture their relevant attributes; missing required category information is flagged.

**FR-DON-004 — Condition vocabulary and category rules**

- *Description:* Apply the agreed condition vocabulary and category-appropriate condition rules.
- *Acceptance criteria:* Condition is recorded from the defined vocabulary; category rules apply; the product does not imply suitability merely from listing.

**FR-DON-005 — Donation lifecycle**

- *Description:* Enforce the donation lifecycle states and transitions.
- *Acceptance criteria:* States match §10.5; invalid transitions are rejected; cancellation/rejection paths exist where needed.

**FR-DON-006 — Bulk donation management and anti-resale locking**

- *Description:* Bulk listing actions with anti-resale locking, claim-limit rules, history, and validated CSV/Excel imports.
- *Acceptance criteria:* Bulk actions show preview and history; designated donations are locked against resale listing; imports validate and report errors; safety-related information is required where applicable.

**FR-DON-007 — Claim limits and duplicate prevention**

- *Description:* Apply configured claim limits and prevent duplicate/conflicting claims.
- *Acceptance criteria:* Claim limits are enforced where configured; duplicate/conflicting claims are prevented; allocation/handover activity is recorded.
- *Dependencies/Limitations:* Claim-limit policy is TBD (**DEC-008**).

**FR-DON-008 — Discovery and filtering**

- *Description:* Discovery by category, condition, verification status, locality, availability, urgency, and sorting.
- *Acceptance criteria:* Filters apply where data exists; results are sortable; missing data does not break discovery.

**FR-DON-009 — Claim submission and donor selection**

- *Description:* Receivers can submit claims explaining need and intended use; donors can review and select recipients.
- *Acceptance criteria:* A claim can be submitted with need/intended use; the donor sees claims; a recipient can be selected; selection moves to Reserved/Approved.

**FR-DON-010 — Handover coordination and confirmation**

- *Description:* Coordinate pickup/drop-off with a time window and confirmation (codes/QR if selected) and record completion.
- *Acceptance criteria:* Handover details can be recorded; confirmation completes the handover; the donation moves to Archived; no real delivery fleet or escrow is used.

**FR-DON-011 — Urgency & Cause Match Checker**

- *Description:* Rule-based comparison between urgent needs and available donation listings with explainable relevance.
- *Acceptance criteria:* Relevant needs and resources are compared on category, quantity, location, urgency, and availability where data exists; each match explains relevance; no match is claimed when essential info is missing; fulfillment is not guaranteed.

**FR-DON-012 — Social-impact analytics**

- *Description:* Provide impact analytics, distinguishing recorded counts from estimates.
- *Acceptance criteria:* Recorded counts (e.g., handovers, beneficiaries) are reported as recorded; estimates (e.g., value, weight diverted) are labeled as estimates with documented assumptions; insufficient data is indicated.
- *Dependencies/Limitations:* Weight/monetary data availability is TBD (**DEC-006**).

### 13.6 Data Science and Analytics (`FR-DS`)

| ID | Title | Priority |
| --- | --- | --- |
| FR-DS-001 | Structured data export for analytics | Must Have |
| FR-DS-002 | Data validation and cleaning | Must Have |
| FR-DS-003 | Exploratory data analysis workflow | Must Have |
| FR-DS-004 | New Product analytics | Should Have |
| FR-DS-005 | Reuse analytics | Should Have |
| FR-DS-006 | Task analytics | Should Have |
| FR-DS-007 | Donation analytics | Should Have |
| FR-DS-008 | Cross-mode analytics | Could Have |
| FR-DS-009 | Analytics service (FastAPI) | Should Have |
| FR-DS-010 | Analytics limitations reporting | Must Have |

**FR-DS-001 — Structured data export for analytics**

- *Description:* Provide structured, exportable marketplace data suitable for Python analysis.
- *Acceptance criteria:* Relevant datasets can be exported in CSV/Excel; fields are documented; exports contain only necessary data.

**FR-DS-002 — Data validation and cleaning**

- *Description:* Validate and clean data, handling the quality issues listed in §12.2.
- *Acceptance criteria:* Duplicates, missing values, inconsistent categories/casing, invalid prices/dates, and abnormal values are addressed with documented rules; cleaning steps are reproducible.

**FR-DS-003 — Exploratory data analysis workflow**

- *Description:* Support EDA and statistical analysis producing documented insights.
- *Acceptance criteria:* Analyses run on real (or clearly labeled test) data; results are reproducible; visuals accompany key findings.

**FR-DS-004 — New Product analytics**

- *Description:* Analytics for demand/supply, category activity, sales trends, seller activity, returns, and recurring failures.
- *Acceptance criteria:* Metrics use documented definitions; results derive from recorded data; empty data is reported as insufficient.

**FR-DS-005 — Reuse analytics**

- *Description:* Analytics for reuse activity, condition distribution, price patterns, benchmarks, unsold items, listing duration, and turnover.
- *Acceptance criteria:* Metrics use documented definitions; benchmark availability depends on comparable data.

**FR-DS-006 — Task analytics**

- *Description:* Analytics for requested categories, referenced skills, published/completed tasks, proposals, and unmet demand.
- *Acceptance criteria:* Insights are descriptive, not automated matching; definitions are documented.

**FR-DS-007 — Donation analytics**

- *Description:* Analytics for resources vs. requests, unmatched needs, claims, handovers, response times, urgent needs, and impact.
- *Acceptance criteria:* Estimates are distinguished from recorded counts; assumptions documented.

**FR-DS-008 — Cross-mode analytics**

- *Description:* Where data exists, analyze transitions and cross-mode demand/supply patterns.
- *Acceptance criteria:* Analyses run only on suitable data; no fabricated insights.

**FR-DS-009 — Analytics service (FastAPI)**

- *Description:* Provide analytical outcomes through the separate Python FastAPI service, consumed by the backend.
- *Acceptance criteria:* The analytics service returns analytical results; the frontend does not call it directly; it remains separate from the C# API.
- *Dependencies/Limitations:* Integration via backend (planned, not yet implemented).

**FR-DS-010 — Analytics limitations reporting**

- *Description:* Communicate when data is insufficient, biased, stale, or unsuitable.
- *Acceptance criteria:* Each analytical result indicates data adequacy; insufficient data suppresses misleading conclusions.

### 13.7 Cross-Mode Integration (`FR-XMD`)

| ID | Title | Priority |
| --- | --- | --- |
| FR-XMD-001 | Product lifecycle transition (New → Owned → Reuse/Donation) | Must Have |
| FR-XMD-002 | Reuse-to-donation handoff | Should Have |
| FR-XMD-003 | Duplicate/conflict prevention on transition | Must Have |
| FR-XMD-004 | Shared identity across modes | Must Have |

**FR-XMD-001 — Product lifecycle transition**

- *Description:* Represent the New → Purchased → Owned → No Longer Needed → Reuse/Donation lifecycle at the product level.
- *Acceptance criteria:* Eligible products can be transitioned by user action; history/identity is preserved; transition is not automatic without confirmation.

**FR-XMD-002 — Reuse-to-donation handoff**

- *Description:* Eligible reuse items can be handed off to donation through a guided flow.
- *Acceptance criteria:* Only eligible items transition; item information is preserved; donation rules apply.

**FR-XMD-003 — Duplicate/conflict prevention on transition**

- *Description:* Prevent duplicate active listings and conflicting ownership/availability states when items transition.
- *Acceptance criteria:* A transition does not leave an item active in two modes simultaneously; conflicting states are rejected.

**FR-XMD-004 — Shared identity across modes**

- *Description:* One account participates across modes without separate identities.
- *Acceptance criteria:* The same user identity is used across modes; mode context affects only permissions and views, not identity.

---

## 14. Non-Functional Requirements

### 14.1 Security and Access Control

| ID | Requirement | Priority |
| --- | --- | --- |
| NFR-SEC-001 | Users can only perform actions permitted by their roles and business rules. | Must Have |
| NFR-SEC-002 | Sensitive credentials are never exposed in the frontend or the repository. | Must Have |
| NFR-SEC-003 | Privileged database operations are not exposed directly to browser clients; the backend mediates all privileged access. | Must Have |
| NFR-SEC-004 | Sensitive actions require relevant input validation and access checks. | Must Have |
| NFR-SEC-005 | Verification states are represented honestly and do not imply external verification. | Must Have |

### 14.2 Privacy

| ID | Requirement | Priority |
| --- | --- | --- |
| NFR-PRV-001 | Collect only information necessary for legitimate product functions. | Must Have |
| NFR-PRV-002 | Avoid unnecessary exposure of contact and personal information. | Must Have |
| NFR-PRV-003 | Do not assume consent to public display of sensitive information. | Must Have |
| NFR-PRV-004 | Retention and deletion policies are defined as TBD if not established. | TBD |

### 14.3 Reliability and Data Integrity

| ID | Requirement | Priority |
| --- | --- | --- |
| NFR-REL-001 | Listing and transaction lifecycle transitions are validated. | Must Have |
| NFR-REL-002 | Conflicting reservations or duplicate actions are prevented where relevant. | Must Have |
| NFR-REL-003 | Bulk operations report affected and excluded records. | Must Have |
| NFR-REL-004 | Rollback does not blindly overwrite later legitimate changes. | Must Have |
| NFR-REL-005 | Cross-mode transitions preserve item identity and state consistency. | Must Have |

### 14.4 Usability

| ID | Requirement | Priority |
| --- | --- | --- |
| NFR-USA-001 | Provide understandable navigation across the four modes. | Must Have |
| NFR-USA-002 | Use clear status labels and validation messages. | Must Have |
| NFR-USA-003 | Explain important warnings and analytical results. | Must Have |
| NFR-USA-004 | Distinguish unavailable information from negative findings. | Must Have |

### 14.5 Maintainability

| ID | Requirement | Priority |
| --- | --- | --- |
| NFR-MNT-001 | Keep product modes logically separated within the unified platform. | Must Have |
| NFR-MNT-002 | Keep shared capabilities reusable where appropriate. | Should Have |
| NFR-MNT-003 | Keep the analytics service separate from the C# backend. | Must Have |
| NFR-MNT-004 | Ensure requirements and tests can be traced to relevant features. | Should Have |

### 14.6 Performance and Scalability

| ID | Requirement | Priority |
| --- | --- | --- |
| NFR-PRF-001 | The product should provide a responsive experience for typical academic demonstration workloads. | Should Have |
| NFR-PRF-002 | Specific throughput, latency, availability, capacity, and uptime targets are TBD — the team has not established them. | TBD |

> The PRD deliberately avoids inventing unsupported performance guarantees.

### 14.7 Compatibility and Accessibility

| ID | Requirement | Priority |
| --- | --- | --- |
| NFR-CMP-001 | Provide a usable responsive web experience across common desktop and mobile viewport sizes. | Should Have |
| NFR-CMP-002 | Follow reasonable accessibility practices; no full certification or universal browser-compatibility is claimed without validation. | Should Have |

---

## 15. Business Rules and State Management

Product-level business rules. Where a rule requires a business decision not yet established, it is recorded as **TBD** and cross-referenced to §22.

| ID | Rule | Notes |
| --- | --- | --- |
| BR-001 | Actions are permitted only according to role, ownership, verification state, and business rules. | Role detail **DEC-002**. |
| BR-002 | A listing must be in an eligible state before it can be edited, published, claimed, or transitioned. | Mode lifecycles in §7–§10. |
| BR-003 | Stock and availability are validated at checkout/claim time. | — |
| BR-004 | Bulk operations require preview and explicit confirmation; rollback validates current state and skips items changed afterward. | FR-NPM-005 / FR-RUS-013. |
| BR-005 | An accepted reuse offer reserves the item until the deadline; failure to complete the next step releases the reservation. | Deadline **DEC-003**. |
| BR-006 | Requirement comparison distinguishes confirmed mismatches from missing information and never claims compatibility from missing data. | — |
| BR-007 | Purchase-confidence warnings and recurring-issue alerts are shown only when the minimum evidence threshold is met. | Threshold **DEC-005**. |
| BR-008 | A price benchmark is shown only when sufficient comparable completed transactions exist; otherwise the system states none is available. | Threshold **DEC-005**. |
| BR-009 | Task proposal and completion transitions follow the defined lifecycle and role permissions. | — |
| BR-010 | Donation claims are subject to configured limits; duplicate/conflicting claims are prevented. | Limits **DEC-008**. |
| BR-011 | Donation handover completes only after the appropriate confirmation step. | — |
| BR-012 | Cross-mode transitions preserve identity/history, require user confirmation, and must not create duplicate active listings. | — |
| BR-013 | Imports validate rows and detect duplicates within the import before applying changes. | — |
| BR-014 | Duplicate or conflicting actions are rejected with a clear reason. | — |
| BR-015 | Estimated metrics are clearly labeled as estimates, distinct from recorded counts. | — |
| BR-016 | A reliable benchmark, warning, or match is never fabricated when data is missing or insufficient. | — |

> No complete financial, dispute-resolution, or legal policy is defined here. Those are outside the product scope.

---

## 16. User Stories and Acceptance Scenarios

### 16.1 Representative User Stories

| ID | Story |
| --- | --- |
| US-01 | As a **buyer**, I want to check product compatibility before purchasing, so that I avoid buying an incompatible item. |
| US-02 | As a **seller**, I want to preview and safely roll back a bulk listing change, so that mistakes are reversible without harming later edits. |
| US-03 | As a **used-item buyer**, I want to inspect a disclosed repair history and price history, so that I can judge an item's value and condition. |
| US-04 | As a **seller and buyer**, we want a temporary reservation after an accepted offer, so that the item is held while we complete the exchange. |
| US-05 | As a **used-item seller/buyer**, I want a fair-price benchmark when sufficient data exists, so that I can price or evaluate an item reasonably. |
| US-06 | As a **task owner**, I want to publish a short-term digital problem and review proposals, so that I can choose who solves it. |
| US-07 | As a **solver**, I want to discover and apply for a suitable short-term task, so that I can earn additional income. |
| US-08 | As a **donor**, I want to list surplus resources, so that usable items reach people who need them. |
| US-09 | As a **beneficiary**, I want to request a resource and complete a handover, so that I receive essential items. |
| US-10 | As an **NGO**, I want to identify a relevant resource for an urgent need, so that I can respond to a pressing situation. |
| US-11 | As a **user**, I want to transfer an eligible no-longer-needed item into reuse or donation, so that it can continue to be used. |
| US-12 | As a **data analyst**, I want to examine cleaned marketplace data, so that I can produce meaningful insights. |

### 16.2 Acceptance Scenarios (Concise)

1. **Compatibility check (US-01):** Given a supported category with structured attributes, when a buyer enters requirements and a mismatch exists, the system identifies the mismatch and explains it; when information is missing, the system states it cannot confirm compatibility.
2. **Bulk rollback (US-02):** Given a completed bulk change, when rollback is requested, items unchanged since the operation are restored, items changed afterward are skipped with recorded reasons, and the history records what was restored.
3. **Repair/price history (US-03):** Given a listing with disclosure and price entries, when viewed, the chronological history is shown and asking prices are distinguished from completed prices.
4. **Reservation (US-04):** Given an accepted offer, when the reservation is created and the next step is not completed before the deadline, the reservation is released and the listing returns to an active state if eligible.
5. **Fair-price benchmark (US-05):** Given sufficient comparable completed transactions, a 25th–75th percentile range is shown with stated limitations; given insufficient data, the system states no reliable benchmark is available.
6. **Task publishing (US-06):** Given a problem owner without an extensive profile, when they publish a task, it becomes discoverable and proposals can be reviewed and a solver selected.
7. **Task application (US-07):** Given a published task, when a solver applies, the proposal is visible to the owner and the task state reflects receipt of proposals.
8. **Donation listing (US-08):** Given a donor, when they create a donation listing with required fields, it appears in discovery when active.
9. **Claim and handover (US-09):** Given an active donation, when a receiver claims it and the donor approves, handover is coordinated and completion is recorded after confirmation.
10. **Urgent match (US-10):** Given an urgent need and available listings, when the checker runs, it explains why a resource is relevant and does not claim a match when essential information is missing.
11. **Cross-mode transition (US-11):** Given an eligible owned item, when the user confirms a reuse or donation transition, history is preserved and no duplicate active listing is created.
12. **Data analysis (US-12):** Given exported marketplace data, when cleaning and analysis are performed, documented metrics are produced and insufficient data is reported as such.

> No code, database queries, API endpoints, or test scripts are included here.

---

## 17. Success Metrics

Metrics are grouped into **product outcome** and **development progress** measures. Numerical targets not yet agreed are stated as **TBD**.

### 17.1 Product Outcome Metrics

| ID | Metric | Target |
| --- | --- | --- |
| SM-PO-01 | Number of functional marketplace modes delivered | 4 |
| SM-PO-02 | Listing creation and discovery flows working per mode | Demonstrated per mode |
| SM-PO-03 | Representative transaction, task, and donation workflows completed end-to-end | Demonstrated |
| SM-PO-04 | Correct identification of known category-specific mismatches | Correct on defined test cases |
| SM-PO-05 | Correct behavior of bulk-operation rollback under defined conditions | Correct on defined test cases |
| SM-PO-06 | Reservation expiration and release correctness | Correct on defined test cases |
| SM-PO-07 | Availability of fair-price estimates when suitable data exists | Correct availability logic |
| SM-PO-08 | Cross-mode lifecycle transitions succeed without duplicate listings | Demonstrated |
| SM-PO-09 | Donation handovers completed and resource matches represented | Demonstrated |
| SM-PO-10 | Analytics workflow completes; selected metrics correct vs. known examples | Correct on test examples |

### 17.2 Development Progress Metrics

| ID | Metric | Target |
| --- | --- | --- |
| SM-DP-01 | Percentage of Must Have requirements implemented and validated | TBD |
| SM-DP-02 | Requirements with corresponding acceptance tests/validation evidence | TBD |
| SM-DP-03 | Data-cleaning and analytical workflow completion | Demonstrated |

> Targets such as percentage completion and coverage are **TBD** until the team agrees a baseline. The PRD does not fabricate percentages.

---

## 18. Assumptions, Constraints, Dependencies, and Risks

### 18.1 Assumptions

| ID | Assumption |
| --- | --- |
| AS-01 | The product is a web application. |
| AS-02 | The team consists of four third-semester students. |
| AS-03 | The initial release is an academic demonstration rather than a production marketplace. |
| AS-04 | Payments are simulated where needed. |
| AS-05 | Verification is manual or simulated. |
| AS-06 | Rule-based mechanisms and statistical analysis are sufficient for the initial scope. |
| AS-07 | Analytics depend on the availability and quality of recorded data. |
| AS-08 | The agreed technology stack (Next.js/React/TypeScript/Tailwind, ASP.NET Core, Supabase PostgreSQL/Auth, Python FastAPI/Pandas/NumPy/Matplotlib/Seaborn) is fixed for the project. |

### 18.2 Constraints

| ID | Constraint |
| --- | --- |
| CO-01 | Limited student-team time and resources. |
| CO-02 | Four concurrent academic subject requirements (Software Engineering, DSA, Data Science, Computer Networks). |
| CO-03 | The selected technology stack. |
| CO-04 | Certain analytical features depend on sufficient sample data. |
| CO-05 | Limited ability to validate real-world market outcomes during the academic project. |

### 18.3 Dependencies

| ID | Dependency |
| --- | --- |
| DP-01 | Existing repository structure (`docs/structure.md`). |
| DP-02 | Framework setup and development environments (not yet initialized). |
| DP-03 | Database and authentication configuration (Supabase — not yet configured). |
| DP-04 | Availability of structured marketplace data for analytics. |
| DP-05 | Agreed business rules and category definitions. |
| DP-06 | Testing and validation setup. |
| DP-07 | Team coordination and integration of the three components. |

> None of the above integrations are claimed to be configured; they are planned future work.

### 18.4 Risks

| ID | Risk | Mitigation (product-planning level) |
| --- | --- | --- |
| RK-01 | Excessive scope for a four-person team. | Prioritize Must Have end-to-end flows; defer Should/Could Have items in §19. |
| RK-02 | Overlap between standard marketplace features and differentiators. | Keep the differentiators (§20) clearly defined and demonstrable; do not rely on standard features as the novelty. |
| RK-03 | Inconsistent data limiting analytics. | Enforce data validation/cleaning (FR-DS-002) and documented definitions. |
| RK-04 | Misleading benchmarks from insufficient comparable transactions. | Apply minimum-sample rules (BR-008); state unavailability instead of fabricating. |
| RK-05 | Incorrect handling of reservations and lifecycle transitions. | Validate all transitions (BR-002, NFR-REL-001) and test edge cases. |
| RK-06 | Conflicting requirements across modes. | Maintain per-mode lifecycles and shared-capability rules (§11); resolve conflicts via §22. |
| RK-07 | Unrealistic expectations around verification, payment, and trust. | State manual/simulated verification and simulated payment clearly (NFR-SEC-005, §7.5). |
| RK-08 | Unvalidated claims about market novelty. | Present differentiators as proposed, not proven (§20); keep external validation as separate research. |
| RK-09 | Features documented but not demonstrably implemented. | Maintain traceability (§21) and validation evidence. |

---

## 19. Scope and Release Boundaries

### 19.1 Initial Academic Release (Must Have)

The minimum coherent set needed to demonstrate the unified platform and all four modes, prioritizing end-to-end flows over page count:

- **Common:** FR-COM-001, 002, 003, 004, 006, 009, 010.
- **New Product:** FR-NPM-002, 004, 005, 008, 009, 010, 012.
- **Reuse:** FR-RUS-002, 003, 004, 005, 006, 011, 016.
- **Task:** FR-TSM-001, 002, 003, 004, 005, 007.
- **Donation:** FR-DON-001, 002, 004, 005, 008, 009, 010.
- **Data Science:** FR-DS-001, 002, 003, 010.
- **Cross-mode:** FR-XMD-001, 003, 004.

### 19.2 Additional Enhancements

**Should Have:** FR-COM-005, 007, 008; FR-NPM-001, 003, 006, 007, 011, 013, 014, 015, 017, 018, 019; FR-RUS-001, 007, 008, 009, 010, 012, 013, 015; FR-TSM-006, 008; FR-DON-003, 006, 007, 011, 012; FR-DS-004, 005, 006, 009; FR-XMD-002.

**Could Have:** FR-NPM-016; FR-RUS-014; FR-DS-008.

> Should Have and Could Have items must not be silently promoted into the initial release.

### 19.3 Explicitly Excluded Features (Out of Scope)

- Real banking or payment processing.
- Real escrow.
- Government identity or registration integrations.
- Complex tax and enterprise financial systems.
- Full logistics fleets and route optimization.
- Warehouse and ERP functionality.
- Advanced ML-based recommendations or defect detection.
- Full-scale freelancing and agency-management systems.
- Advanced social networking.
- Sophisticated subscription billing.
- Complex advertising automation.
- Production-grade NGO audits.
- Automatic skill matching, automatic solver assignment, explainable matching engines, AI recommendations.
- Skill assessments/certification verification, availability/workload optimization, complex milestone management.
- Built-in video conferencing, sophisticated dispute resolution.

---

## 20. Product Differentiation and Academic Defensibility

This section responds to feedback questioning what is new, given that marketplaces, resale platforms, freelancing services, and donation platforms already exist. The PRD does **not** claim the whole concept is unprecedented. Instead it distinguishes standard foundations from **proposed differentiators** (not proven market-first innovations; external competitive validation remains a separate research task).

### 20.1 Standard Marketplace Foundations (not the primary novelty)

User profiles; listings; search and filters; shopping carts; orders; offers; task publishing; donation claims; reviews; dashboards. These are useful foundations but are not, by themselves, the project's primary differentiators.

### 20.2 Proposed Differentiating Mechanisms

| # | Mechanism | User Problem | Intended Behavior | User Benefit | How Success Is Evaluated | Dependencies & Limitations |
| --- | --- | --- | --- | --- | --- | --- |
| D1 | **Safe Reversible Bulk Operations** | Bulk edits risk irrecoverable mistakes on many listings. | Preview, before/after values, exclusions, controlled rollback, state validation, history. | Mistakes are recoverable without harming later edits. | Rollback restores unchanged items and skips changed ones (SM-PO-05). | Requires activity history; batch rules TBD (DEC-010). |
| D2 | **Category-Specific Requirement Check** | Buyers struggle to know if a product fits their needs. | Deterministic comparison of buyer requirements vs. structured attributes. | Fewer incompatible purchases. | Known mismatches correctly identified; missing info not treated as compatibility (SM-PO-04). | Needs structured attributes; categories TBD (DEC-004). |
| D3 | **Purchase Confidence Summary** | Purchase decisions lack transparent evidence. | Explainable presentation of relevant evidence, not a numeric score. | Better-informed decisions. | Each factor explained; no arbitrary percentage. | Requires enough data for some factors; threshold TBD (DEC-005). |
| D4 | **Requirement-Aware Alternatives** | Generic recommendations ignore stated needs. | Prioritize products satisfying supplied requirements; explain differences. | Better-matched alternatives. | Alternatives align with requirements; fallback works. | Depends on D2 attributes. |
| D5 | **Purchase Failure Prevention** | Return causes recur without correction. | Structured reasons, recurring-issue analysis, evidence-based warnings. | Reduced repeat failures; seller feedback. | Patterns only above threshold; reasons traceable (SM-PO-04). | Needs sufficient reliable transactions; threshold TBD (DEC-005). |
| D6 | **Refurbishment & Repair Disclosure Logger** | Repair history is opaque. | Chronological disclosure with classification and notes. | Greater trust and transparency. | Entries captured and displayed chronologically. | Disclosures are not verified proof unless evidence exists. |
| D7 | **Auto-Expiring Offer & Reservation Lock** | Accepted offers are not honored; items double-sold. | Temporary reservation with validated expiration and release. | Predictable, fair exchange. | Expiration/release correctness (SM-PO-06). | Deadline/edge cases TBD (DEC-003). |
| D8 | **Price History Tracker & Discount Visualizer** | Asking-price history is hidden; discounts may mislead. | Transparent display of asking-price changes. | Clearer pricing context. | Asking prices distinguished from completed prices. | Only available data can be shown. |
| D9 | **Category-Based In-Person Handover Checklist** | Buyers miss defects at handover. | Item-specific inspection checklist. | More confident in-person checks. | Checklist matches category; labeled as decision support. | Not an inspection certificate. |
| D10 | **Python-Powered Fair Market Price Benchmark** | Sellers/buyers lack price reference. | Reference range from comparable completed transactions (25th–75th percentile). | Reasonable, data-supported pricing. | Range shown only with sufficient data (SM-PO-07). | Needs comparables; count TBD (DEC-005). |
| D11 | **Task-First Opportunity Workflow** | Short-term problems are hard to match. | Problem publishing and proposal-based selection (no auto-matching). | Access to short-term work/solutions. | End-to-end task flow works. | Explicitly excludes automatic matching. |
| D12 | **Donation Urgency & Cause Match Checker** | Urgent needs miss available resources. | Rule-based, explainable comparison of needs vs. listings. | Faster, relevant response. | Matches explained; no match without essential info. | Depends on data completeness. |
| D13 | **Cross-Mode Lifecycle Transitions** | Items lose continuity across stages. | New → Owned → Reuse/Donation continuity with identity preserved. | Items continue to be used. | Transitions occur without duplicate listings (SM-PO-08). | Requires eligibility rules. |
| D14 | **Shared Analytics Ecosystem** | Marketplace data is underused. | Analysis of supply, demand, returns, price patterns, tasks, resources, transitions. | Better decisions and insights. | Analytics workflow completes; metrics correct (SM-PO-10). | Depends on data quality/volume. |

> Analytical success is evaluated on defined test examples; **no fabricated results** are presented as platform insights.

---

## 21. Requirements Traceability

A concise matrix connecting goals, users, modes, requirements, and success criteria. All four modes are represented.

| Goal | Target User | Mode | Requirement IDs | Acceptance / Success Metric | Academic Subject Link |
| --- | --- | --- | --- | --- | --- |
| G1, G3 | All users | Common | FR-COM-001, 002, 003, 010 | SM-PO-01 | Software Engineering |
| G3, G4 | Buyers | New Product | FR-COM-004, FR-NPM-008 | SM-PO-02 | DSA (search/sort) |
| G4 | Buyers | New Product | FR-NPM-012, 013, 014 | SM-PO-04 | Software Engineering / Data Science |
| G4 | Sellers | New Product | FR-NPM-004, 005, 017 | SM-PO-05 | Software Engineering |
| G5 | Reuse buyers | Reuse | FR-RUS-006, 007, 008 | SM-PO-06 | Software Engineering |
| G5 | Reuse buyers/sellers | Reuse | FR-RUS-004, 005 | SM-PO-06 | Software Engineering |
| G9 | Sellers/buyers | Reuse | FR-RUS-009, FR-DS-005 | SM-PO-07 | Data Science |
| G6 | Task owners/solvers | Task | FR-TSM-001–007 | SM-PO-03 | Software Engineering |
| G7 | Donors/receivers | Donation | FR-DON-001, 002, 005, 009, 010 | SM-PO-09 | Software Engineering |
| G7 | NGOs | Donation | FR-DON-011 | SM-PO-09 | Software Engineering / DSA (matching) |
| G8 | All users | Cross-mode | FR-XMD-001–004 | SM-PO-08 | Software Engineering |
| G9 | Data analyst | All | FR-DS-001–010 | SM-PO-10 | Data Science |
| G10 | Team | All | NFR-MNT-001–004, FR-COM-009 | Requirements-to-tests traceability | Software Engineering / Networks |
| G2 | All users | All | FR-COM-006, FR-TSM-007, FR-DON-005 | Lifecycle correctness | Software Engineering |

**Multi-subject highlights:** Search and sorting (DSA) — FR-COM-004, FR-NPM-008, FR-RUS-011. Cross-mode data collection (Data Science) — FR-COM-009, FR-DS-001–008. API communication and service boundaries (Computer Networks) — the planned Next.js → ASP.NET Core → Supabase/FastAPI flow documented in `docs/structure.md`. Requirements traceability and validation (Software Engineering) — this section and §16.

---

## 22. Open Questions and Decisions Required

Only unresolved decisions that materially affect product behavior. If a decision is already resolved by authoritative source material, it is not reintroduced here.

| ID | Decision | Why It Matters | Status |
| --- | --- | --- | --- |
| DEC-001 | Exact MVP requirement set and release priorities. | Determines what the academic demo must contain vs. defer. | Open |
| DEC-002 | Role/permission model details (roles, ownership, verification effects). | Drives access control (FR-COM-002, BR-001). | Open |
| DEC-003 | Reservation deadline default and expiration edge cases. | Affects fairness and lifecycle correctness (FR-RUS-005). | Open |
| DEC-004 | Supported product categories and their attributes per mode. | Underpins listing structure, requirement checks, checklists (FR-NPM-002, FR-RUS-001, FR-DON-003). | Open |
| DEC-005 | Minimum sample size for price benchmarks and warning generation; benchmark definition details. | Prevents misleading outputs (BR-007, BR-008). | Open |
| DEC-006 | Data dictionary and definitions of key analytics metrics; availability of weight/monetary data. | Required for consistent analytics (FR-DS, FR-DON-012). | Open |
| DEC-007 | Privacy, retention, and deletion policies. | Required before collecting personal data at scale (NFR-PRV-004). | Open |
| DEC-008 | Donation claim limits and allocation rules. | Affects fairness and duplicate prevention (FR-DON-007). | Open |
| DEC-009 | Review/feedback eligibility rules per mode. | Determines when feedback can be recorded (FR-COM-007). | Open |
| DEC-010 | Expected test-data volume and import batch limits. | Affects analytics feasibility and import design (FR-NPM-006, FR-RUS-012). | Open |
| DEC-011 | Which optional mechanisms can realistically be completed within the academic schedule. | Ties scope to capacity (RK-01). | Open |
| DEC-012 | Specific acceptance targets where numerical values would help. | Converts TBD targets into measurable goals (SM-DP-01, SM-DP-02, NFR-PRF-002). | Open |
| DEC-013 | Whether QR/digital confirmation codes are selected for donation handover. | Affects handover implementation (FR-DON-010). | Open |

---

## 23. Appendix A — Glossary and Requirement Conventions

| Term | Meaning |
| --- | --- |
| Mode | One of the four marketplace business modules within the unified platform. |
| Listing | A publication of a product, reuse item, task, or donation/resource request. |
| Reservation Lock | A temporary hold applied to a reuse item after an accepted offer. |
| Benchmark | A reference price range derived statistically from comparable completed transactions. |
| Requirement Check | Deterministic comparison of buyer requirements against structured product attributes. |
| Urgency Match | Rule-based comparison of urgent needs against available donation listings. |
| Recorded Count | A directly observed metric (e.g., number of handovers). |
| Estimate | A derived metric with documented assumptions (e.g., weight diverted from landfill). |
| Cross-mode Transition | A guided movement of an eligible item between modes. |
| TBD | To Be Decided — an unresolved point that should not be treated as settled. |

**Requirement conventions:** functional requirements use `FR-<MODULE>-<nnn>`; non-functional requirements use `NFR-<AREA>-<nnn>`; business rules use `BR-<nnn>`; decisions use `DEC-<nnn>`; success metrics use `SM-<group>-<nn>`; risks use `RK-<nn>`; assumptions use `AS-<nn>`; constraints `CO-<nn>`; dependencies `DP-<nn>`; user stories `US-<nn>`.

---

*End of CONFLUMIX Product Requirements Document (Version 1.0 — Draft for academic review).*
