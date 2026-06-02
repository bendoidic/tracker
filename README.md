# Team Tracker

Internal task tracker for Miki, Ben, Alex, and Isai. Single Supabase table, no auth, realtime burn-up wall.

## Setup

1. Install deps:
   ```bash
   npm install
   ```
2. Create a Supabase project (free tier is fine). In the SQL editor, paste and run [`supabase/schema.sql`](./supabase/schema.sql).
3. Copy env template and fill in your project URL + anon key (Settings → API):
   ```bash
   cp .env.local.example .env.local
   ```
4. Start dev server:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000.

## Pages

- `/` — task list with inline create, assignee/status filters, quick edit.
- `/bulk` — paste many tasks at once. Tokens: `@miki` `@ben` `@alex` `@isai` for assignee, `!2026-06-10` or `!2026-06-10 14:30` for deadline. Lines starting with `#` or blank are skipped.
- `/burnup` — fullscreen TV view. Auto-updates via Supabase realtime; falls back to a 60-second poll. Add `?target=2026-07-01` to show days remaining.

## Deploy

1. Push to GitHub.
2. Import the repo in Vercel.
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the Vercel project's env vars.
4. Deploy. Share the URL with the team.

## Identity

There is no login. First visit shows a name picker (Miki / Ben / Alex / Isai). Choice is stored in `localStorage` and used as `created_by` on every write.
