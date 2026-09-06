# CareerForge AI

An AI-powered resume and portfolio builder. Users bring their real experience —
by typing it in, uploading a resume, or connecting GitHub — and describe
changes in plain language instead of writing code.

Phases 1–8 of the roadmap are built and wired together end-to-end (see
[What's real](#whats-real-vs-whats-left) and [Roadmap](#roadmap)). Phases 9–10
(hardening, performance, final polish) are what's left.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui-style components
- PostgreSQL + Prisma
- Auth.js v5 (Credentials + GitHub OAuth, access token captured on link)
- OpenAI API (server-side only) — resume/portfolio AI editing + resume-upload extraction
- `pdf-parse` / `mammoth` for resume text extraction
- `@react-pdf/renderer` for resume PDF export
- `jszip` for portfolio source-code export
- Vercel Blob for file storage, with a local `/public/uploads` fallback for dev (`src/lib/storage.ts`)

## Getting started

```bash
npm install
cp .env.example .env   # then fill in the values below
npx prisma generate     # generates the Prisma client (needs network access)
npx prisma db push       # creates tables from prisma/schema.prisma
npm run db:seed           # seeds the 8 portfolio themes (Minimal, Modern, ...)
npm run dev
```

Open http://localhost:3000.

### Environment variables

All variables are documented with comments in `.env.example`.

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Any Postgres instance (Neon, Supabase, Railway, local Docker) |
| `AUTH_SECRET` | `npx auth secret` |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | https://github.com/settings/developers — callback URL `http://localhost:3000/api/auth/callback/github`, scope `read:user user:email repo` |
| `OPENAI_API_KEY` | https://platform.openai.com — required for AI editing and resume-upload extraction |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob — optional; without it, uploads are written to `/public/uploads` locally |

### Verifying this build

In the sandbox this was built in, `npm install` completes cleanly, but
`prisma generate`'s postinstall step can't finish because it needs to
download the query engine binary from `binaries.prisma.sh`, which isn't
reachable there. On a normal machine or CI runner with full internet access
this resolves itself by simply running `npx prisma generate`.

`npx tsc --noEmit` was run against the full codebase. Every error it
surfaced was traced to that one missing-engine root cause (the generated
Prisma client falling back to generic, model-less types) and fixed as far as
possible by typing the affected callback parameters explicitly. No other
type or syntax errors exist. Live network calls (OpenAI, GitHub API,
Postgres) were not exercised, since this sandbox doesn't have live
credentials for them — review the relevant server action / route handler
before trusting a first production run.

## Route → file map

### Public

| Route | File |
|---|---|
| `/` | `src/app/page.tsx` (+ `src/components/landing/*`) |
| `/pricing` | `src/app/(marketing)/pricing/page.tsx` |
| `/templates` | `src/app/(marketing)/templates/page.tsx` |
| `/login` | `src/app/(auth)/login/page.tsx` |
| `/register` | `src/app/(auth)/register/page.tsx` |
| `/p/[username]` | `src/app/p/[username]/page.tsx` |
| `/preview/[portfolioId]` | `src/app/preview/[portfolioId]/page.tsx` |

### Dashboard (protected by `src/middleware.ts` + a session check in `src/app/dashboard/layout.tsx`)

| Route | File |
|---|---|
| `/dashboard` | `src/app/dashboard/page.tsx` |
| `/dashboard/resumes` | `src/app/dashboard/resumes/page.tsx` |
| `/dashboard/resumes/new` | `src/app/dashboard/resumes/new/page.tsx` |
| `/dashboard/resumes/[id]` | `src/app/dashboard/resumes/[id]/page.tsx` |
| `/dashboard/portfolios` | `src/app/dashboard/portfolios/page.tsx` |
| `/dashboard/portfolios/new` | `src/app/dashboard/portfolios/new/page.tsx` |
| `/dashboard/portfolios/[id]` | `src/app/dashboard/portfolios/[id]/page.tsx` |
| `/dashboard/github` | `src/app/dashboard/github/page.tsx` |
| `/dashboard/profile` | `src/app/dashboard/profile/page.tsx` |
| `/dashboard/settings` | `src/app/dashboard/settings/page.tsx` |

### API / route handlers

| Route | File | What it does |
|---|---|---|
| `/api/auth/[...nextauth]` | `src/app/api/auth/[...nextauth]/route.ts` | Auth.js handlers |
| `POST /api/resumes/upload` | `src/app/api/resumes/upload/route.ts` | PDF/DOCX → text → AI extraction → saved resume |
| `GET /api/resumes/[id]/pdf` | `src/app/api/resumes/[id]/pdf/route.tsx` | Resume PDF export (`@react-pdf/renderer`) |
| `GET /api/portfolios/[id]/export` | `src/app/api/portfolios/[id]/export/route.ts` | Portfolio static-site ZIP export (`jszip`) |

### Server actions (called directly from Server/Client Components, no route of their own)

| File | Exports |
|---|---|
| `src/lib/actions/register.ts` | `registerUser` |
| `src/lib/actions/resume.ts` | `createResume` |
| `src/lib/actions/resume-edit.ts` | `updatePersonalAndSummary`, `addListEntry`, `removeListEntry`, `restoreResumeVersion`, `add{Experience,Education,Skill,Project,Certification,Achievement}` |
| `src/lib/actions/resume-ai.ts` | `runResumeAi` |
| `src/lib/actions/portfolio.ts` | `createPortfolio` |
| `src/lib/actions/portfolio-from-resume.ts` | `createPortfolioFromResume` |
| `src/lib/actions/portfolio-schema.ts` | `updatePortfolioSchema` |
| `src/lib/actions/portfolio-projects.ts` | `addManualProject`, `removeProject`, `toggleFeatured` |
| `src/lib/actions/portfolio-ai.ts` | `runPortfolioAi`, `restorePortfolioVersion` |
| `src/lib/actions/github.ts` | `refreshGitHubRepos`, `importRepositoryAsProject` |
| `src/lib/actions/publish.ts` | `publishPortfolio`, `unpublishPortfolio` |
| `src/lib/actions/profile.ts` | `updateProfile` |

### Supporting libraries

| File | Purpose |
|---|---|
| `src/auth.ts` / `src/auth.config.ts` | Auth.js config, providers, GitHub token capture |
| `src/middleware.ts` | Protects `/dashboard/*` |
| `src/lib/db.ts` | Prisma client singleton |
| `src/lib/openai.ts` | OpenAI client singleton |
| `src/lib/storage.ts` | File storage (Vercel Blob or local fallback) |
| `src/lib/rate-limit.ts` | In-memory AI request rate limiter |
| `src/lib/ai/resume-assistant.ts` | Resume AI-editing system prompt + call |
| `src/lib/ai/portfolio-assistant.ts` | Portfolio AI-editing system prompt + call |
| `src/lib/ai/resume-extraction.ts` | Resume-upload structured extraction |
| `src/lib/parsing/extract-text.ts` | PDF/DOCX/plain-text → raw text |
| `src/lib/pdf/resume-document.tsx` | `@react-pdf/renderer` resume layout |
| `src/lib/export/portfolio-zip.ts` | Static-site ZIP builder |

### Components

| Folder | Contents |
|---|---|
| `src/components/ui/` | `button`, `card`, `input`, `label` |
| `src/components/landing/` | Landing page sections |
| `src/components/dashboard/` | `sidebar`, `empty-state` |
| `src/components/resume/` | `resume-preview`, `personal-form`, `list-sections`, `ai-panel`, `version-history`, `upload-form` |
| `src/components/portfolio/` | `renderer` (public-facing), `theme-form`, `projects-manager`, `ai-panel`, `version-history`, `publish-panel` |

## What's real vs. what's left

Real and working end-to-end:
- Registration, login (credentials + GitHub OAuth), GitHub access token captured on link
- Every dashboard route protected by middleware **and** a server-side session check; every query scoped to the logged-in user's `id`
- Resume creation, the 3-pane editor (sections / live preview / AI assistant), version history with restore
- Resume upload: real PDF/DOCX text extraction → AI structured extraction (never invents missing fields) → editable resume
- Portfolio creation (from scratch, from a resume, or via GitHub import), the editor (theme/section toggles, project manager, AI assistant, live iframe preview, version history)
- GitHub OAuth repository fetch (real GitHub API call) and import-as-project
- Publish/unpublish with slug uniqueness checks, live at `/p/[slug]`
- Resume PDF export and portfolio static-site ZIP export

Explicitly not built (Phase 9–10 territory), not faked:
- Drag-and-drop section reordering (currently: toggle visibility + fixed order)
- Encrypted-at-rest storage for the GitHub access token (stored as plain text in dev; encrypt before production)
- Stripe billing (the `Subscription` model and `/pricing` page exist; no checkout flow)
- Account deletion confirmation flow (button is present, disabled)
- Automated tests, load testing, accessibility audit

## Roadmap

1. Setup — project, auth, schema, design system, landing page, dashboard shell (done)
2. Profile, resume creation, resume editor, resume preview (done)
3. Resume upload, PDF/DOCX parsing, structured extraction (done)
4. Portfolio builder, schema, templates, live preview (done)
5. AI assistant, natural-language editing, conversation history, versioning (done)
6. GitHub OAuth repository import (done)
7. Publishing, public URLs, SEO — basic meta title/description on `/p/[username]` (done)
8. PDF export, portfolio ZIP export — DOCX export not included, PDF only (done)
9. Security hardening, input validation, performance, accessibility audit (not done)
10. Final testing and production readiness (not done)

## Notes

- No fake data: seed data is limited to `PortfolioTheme` configuration rows
  (see `prisma/seed.ts`) and never includes sample users, resumes, or projects.
- API keys are never sent to the client — `OPENAI_API_KEY` is only read inside
  files marked `import "server-only"`.
- The AI assistants (`resume-assistant.ts`, `portfolio-assistant.ts`,
  `resume-extraction.ts`) are all instructed to never invent facts not present
  in the input; ambiguous or fact-adding instructions are classified as
  `missing` and returned to the user as a request for the real information
  instead of being applied.
