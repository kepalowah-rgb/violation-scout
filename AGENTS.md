<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project lessons (Violation Scout)

- **next-intl v4 redirect:** `createNavigation`'s `redirect` requires
  `redirect({ href: "/dashboard", locale })`, not `redirect("/dashboard")`.
  In server components where TS null-narrowing matters, plain
  `next/navigation` `redirect(`/${locale}/login`)` is simpler and type-clean.
- **proxy.ts composition:** next-intl's middleware ALWAYS returns a response
  (redirect, rewrite, or `NextResponse.next()`). Only return early when it
  carries a `location` header (a real redirect); otherwise the Auth.js
  session gate below it never runs.
- **`cookies()`/`headers()` in the root layout makes the entire app dynamic.**
  Accepted here (auth + i18n already force it), but don't add either to the
  root layout expecting static pages to survive.
- **i18n parity:** `node scripts/check-i18n-parity.mjs` verifies
  messages/{en,es,tl}.json have identical key sets. Run after any catalog edit.
- **Adding a language** = new `messages/<code>.json` + entry in
  `i18n/routing.ts` + catalog entry in `auth.ts` (`authEmailMessagesFor`).
- **Prisma here:** no real DATABASE_URL in this workspace — validate/generate
  with a dummy URL, but migrations (`20260919*_init`,
  `20260919*_remote_evaluation`) can only be applied against a real Postgres
  (e.g. the user's Neon DB).
- **Vercel Blob is build-validated only** (no BLOB_READ_WRITE_TOKEN here).
  Photo upload/delete paths were never runtime-tested — test with a real
  token before launch.
