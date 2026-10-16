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

This concludes the structural specification for the CONFLUMIX repository.