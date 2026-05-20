# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Arcade Vault — an online gaming platform where users compete for the highest score. Uses **Spec Driven Design** via `/spec` and `/spec-impl` skills.

## Commands

```bash
npm run dev      # start dev server (Turbopack)
npm run build    # production build
npm run lint     # ESLint
npm run start    # run production build
```

No test runner is configured yet.

## Stack

- **Next.js 16.2.6** — App Router only (`app/` directory). This version has breaking changes vs earlier releases; read `node_modules/next/dist/docs/` before writing code.
- **React 19.2.4**
- **Tailwind CSS v4** — uses `@import "tailwindcss"` in CSS (not the v3 `@tailwind` directives). Theme tokens are defined with `@theme inline {}`.
- **TypeScript** (strict mode). Path alias `@/*` resolves to the repo root.

## Key Next.js 16 differences

- `params` and `searchParams` props in pages and layouts are **Promises** — always `await` them before accessing values.
- Server Components are the default; add `'use client'` only when you need state, event handlers, or browser APIs.
- Caching uses `'use cache'` directive and `cacheLife`/`cacheTag` APIs — not the old `fetch` cache options.
- For instant client navigations, export `unstable_instant` from the route and wrap uncached data in `<Suspense>`. Read `node_modules/next/dist/docs/01-app/02-guides/instant-navigation.md` before touching navigation performance.
- API routes live in `app/**/route.ts` (not `pages/api/`).

## Architecture

```
app/
  layout.tsx   # root layout — sets fonts (Geist), html/body structure
  page.tsx     # home route "/"
  globals.css  # Tailwind v4 import + CSS theme variables
public/        # static assets served at root
```

The `@/*` alias points to the repo root, so components should be colocated under `app/` or a top-level `components/` / `lib/` directory (neither exists yet — create them as needed).
