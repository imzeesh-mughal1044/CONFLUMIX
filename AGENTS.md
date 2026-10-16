# AGENTS.md

Global guidance for AI coding agents working on **CONFLUMIX**.

## Project

CONFLUMIX — **The Multi-Mode Marketplace for Local Exchange.**
One unified platform, four marketplace modes, one shared data ecosystem.

Four finalized modes:
1. New Product Marketplace
2. Reuse / Old Product Marketplace
3. Task & Soft Skills Marketplace
4. Donation & Social Impact Network

## Agreed Stack

| Area | Technology |
| --- | --- |
| Frontend | Next.js, React, TypeScript, Tailwind CSS (deployed to Vercel) |
| Backend | C#, ASP.NET Core Web API |
| Database & Auth | Supabase PostgreSQL, Supabase Auth |
| Analytics | Python, FastAPI, Pandas, NumPy, Matplotlib, Seaborn |
| VCS | Git and GitHub |

Do not introduce technologies outside this stack without an explicit team decision.

## Repository Layout

```
apps/web            Next.js frontend (not yet scaffolded)
apps/api            ASP.NET Core Web API (not yet scaffolded)
services/analytics  Python FastAPI analytics service (not yet scaffolded)
docs                Project documentation
tests               Tests by component (frontend, backend, analytics)
scripts             Dev/maintenance scripts
.github             Issue templates and workflows (placeholders)
```

## Where Things Live

- Repository structure rules: `docs/structure.md`
- Product requirements: `docs/requirements/PRD.md`
- UI/UX design system: `docs/UI/UX_brief.md`
- Project context for agents: `docs/context.md`
- Technical requirements: `docs/TRD.md` (planned — not yet created)

## Rules

- Never commit secrets, credentials, API keys, or populated `.env` files.
- Preserve existing valid work; do not overwrite files blindly.
- Do not create the TRD, SRS, database schemas, or application code unless explicitly asked.
- Keep the four marketplace modes within one unified platform; never split them into separate apps.
- Keep the Python analytics service separate from the C# API.
- Do not claim unimplemented features are working.
- Requirements use stable IDs (`FR-*`, `NFR-*`, `DEC-*`). Follow existing conventions.
- Prefer CSS transitions over JavaScript animation libraries for the frontend.
- No comments in code unless requested.

## Commands

No build, lint, or test tooling is configured yet (applications are not scaffolded). When tooling is added, record the exact commands here.

## Current Status

Initial documentation phase. Repository structure, PRD, and UI/UX brief exist. No application code, dependencies, or deployment configuration yet.
