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

## Permanent Frontend Brand and Responsive Rules

- Use `CONFLUMIX_nav.png` for every logo shown in navigation, headers, authentication screens, and shared application chrome. Keep the frontend copy at `apps/web/public/CONFLUMIX_nav.png`, render it with `next/image` or an HTML image, and preserve its intrinsic aspect ratio.
- On dark surfaces, place the official logo in an intentional white container with suitable padding and border radius. Do not replace it with text, CSS-drawn marks, generic symbols, or alternate brand files.
- Build frontend layouts mobile-first from a 360 px viewport, then enhance them at tablet and desktop breakpoints.
- Mobile pages must never create horizontal document scrolling. Main wrappers, forms, controls, media, and layout children must remain within `width: 100%` and `max-width: 100%`; flex and grid children must be allowed to shrink with `min-width: 0`.
- Long user-controlled text must wrap or truncate without changing the document width.
- Mobile interactive targets must be at least 44 × 44 CSS pixels.
- Images and dynamic regions must reserve their dimensions to avoid layout shifts.
- Frontend responsive verification must include browser checks at 360 × 740 and 390 × 844 before completion.

## Commands

No build, lint, or test tooling is configured yet (applications are not scaffolded). When tooling is added, record the exact commands here.

## Current Status

Initial documentation phase. Repository structure, PRD, and UI/UX brief exist. No application code, dependencies, or deployment configuration yet.
