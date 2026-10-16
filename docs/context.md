# CONFLUMIX — Project Context

Shared context for humans and AI agents working on CONFLUMIX. Read this first, then follow the linked documents.

## What This Project Is

**CONFLUMIX** — *The Multi-Mode Marketplace for Local Exchange.*
One unified platform, four marketplace modes, one shared data ecosystem.

## The Four Modes

1. **New Product Marketplace**
2. **Reuse / Old Product Marketplace**
3. **Task & Soft Skills Marketplace**
4. **Donation & Social Impact Network**

These are business modules within one platform — not four separate applications.

## Agreed Stack

| Area | Technology |
| --- | --- |
| Frontend | Next.js, React, TypeScript, Tailwind CSS (Vercel) |
| Backend | C#, ASP.NET Core Web API |
| Database & Auth | Supabase PostgreSQL, Supabase Auth |
| Analytics | Python, FastAPI, Pandas, NumPy, Matplotlib, Seaborn |
| VCS | Git and GitHub |

## Documentation Index

| Document | Purpose |
| --- | --- |
| `docs/structure.md` | Repository structure and directory responsibilities. |
| `docs/requirements/PRD.md` | Product Requirements Document — product scope, requirements, priorities, decisions. |
| `docs/UI/UX_brief.md` | UI/UX design system — colors, tokens, components, states, accessibility. |
| `docs/TRD.md` | Technical Requirements Document. **Planned — not yet created.** |
| `AGENTS.md` | Global rules and instructions for AI coding agents. |
| `docs/context.md` | This file — shared project context. |

## Repository Layout

```
apps/web            Next.js frontend (not yet scaffolded)
apps/api            ASP.NET Core Web API (not yet scaffolded)
services/analytics  Python FastAPI analytics service (not yet scaffolded)
docs                Documentation (structure, requirements, UI/UX, and more)
tests               Tests: frontend, backend, analytics
scripts             Development and maintenance scripts
.github             Issue templates and workflows (placeholders)
```

## Current Status

- Phase: **initial documentation**.
- Existing: repository structure, `README.md`, PRD, UI/UX brief, `AGENTS.md`, this context file.
- Not yet created: application code, TRD, database schemas, API contracts, dependencies, CI workflows, deployment configuration.

## Conventions

- Requirements IDs: `FR-*` (functional), `NFR-*` (non-functional), `DEC-*` (decisions), `BR-*` (business rules).
- Keep documentation under `docs/`.
- Keep tests under the matching `tests/` component folder.
- Never commit secrets or populated `.env` files.
- Do not introduce technologies outside the agreed stack without a team decision.

## Working Agreements

- Preserve existing valid work; do not overwrite files blindly.
- Do not claim unimplemented features work.
- Do not create application code, schemas, or configuration unless explicitly asked.
- Keep the four modes unified; keep the Python analytics service separate from the C# API.
