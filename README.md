# Bharat Inventory Manager AI (BIM AI)

> The Next Generation AI-Powered Inventory & Business Management Platform.

An open-source, cloud-based inventory management platform for Indian retail
businesses — grocery stores, medical stores, electronics shops, and more —
with batch/expiry tracking, supplier management, and (eventually) an
AI-powered assistant, customer app, and multi-store support. See
[`VISION.md`](./VISION.md) for the full long-term product vision.

This repository currently implements the **Owner Dashboard MVP**: an
authenticated, RLS-secured admin app for managing products, categories,
suppliers, and stock/expiry alerts.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, TypeScript)
- [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) (Base UI)
- [Supabase](https://supabase.com) — Postgres, Auth, Row-Level Security
- Deployed on [Vercel](https://vercel.com); CI via GitHub Actions

## Getting started

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Unauthenticated users are
redirected to `/login`; sign up at `/signup` to create an owner account.

### Environment variables

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project API URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable (anon) key — safe to expose client-side |

`.env.local.example` is pre-filled with the project's Supabase URL and
publishable key so `npm run dev` works out of the box. Rotate these if you
fork this project for your own deployment.

### Database schema

The `public` schema (in the connected Supabase project) has:

- `categories`, `suppliers`, `products` — core inventory tables, all RLS-scoped to `user_id`
- `notification_settings`, `notification_logs` — expiry reminder scaffolding
- `user_profiles` — profile data linked to `auth.users`

Regenerate TypeScript types after a schema change with the Supabase MCP
`generate_typescript_types` tool (or the Supabase CLI), and update
`src/lib/supabase/types.ts`.

## Project structure

```
src/
  app/
    login/, signup/          # Auth pages (Supabase Auth, email+password)
    dashboard/
      layout.tsx             # Sidebar shell, requires an authenticated user
      page.tsx               # Overview: stock/expiry stats
      products/               # Products CRUD
      categories/             # Categories CRUD
      suppliers/               # Suppliers CRUD
    auth-actions.ts           # signIn / signUp / signOut server actions
  components/
    app-sidebar.tsx           # Dashboard navigation
    ui/                       # shadcn/ui components
  lib/supabase/
    client.ts, server.ts      # Browser / server Supabase clients
    middleware.ts             # Session refresh + route protection
    types.ts                  # Generated Supabase types
  proxy.ts                    # Route protection (Next.js 16 proxy convention)
```

## Deployment

**Vercel** is the primary deployment target:

1. Import this repository into [Vercel](https://vercel.com/new).
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   as project environment variables (same values as `.env.local`).
3. Deploy — Vercel builds with `npm run build` automatically.

**GitHub Actions** (`.github/workflows/ci.yml`) runs lint + build on every
push and pull request against `main`. Add the two env vars above as repository
secrets (`Settings → Secrets and variables → Actions`) so the build step can
compile successfully in CI.

## Scripts

```bash
npm run dev     # Start the dev server
npm run build   # Production build
npm run start   # Run the production build
npm run lint    # ESLint
```
