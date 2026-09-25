# Violation Scout — SaaS

A multi-user, subscription-billed web app for real-estate wholesalers who drive for dollars in Hawaiʻi:

- **Map** — drop pins on an OpenStreetMap (no API key) to log distressed properties in the field. Starts centered on Oʻahu; pan and zoom anywhere in the world.
- **Lead log** — spreadsheet-style table: address, distress notes, suspected violations, status, priority, follow-ups, CSV export
- **Research workflow** — per-property checklist deep-linking official public records. Hawaiʻi preset by default (RPAD tax rolls for ownership, HNL Build via DPP for permits/violations); users anywhere can point it at their own county's sites in Dashboard → Settings
- **Contract generator** — wholesale assignment contract drafts with a template picker: Hawaiʻi (Hawaiʻi-appropriate disclosures) or Generic (state-neutral, for other states). Every draft is labeled DRAFT and requires attorney review before use.
- **Three languages** — English, Spanish, and Tagalog. Every route is locale-prefixed (`/es/dashboard`, `/tl/billing`); the language switcher in the navbar persists your choice for a year. Sign-in emails are localized too (from your language setting or browser language).
- **Remote evaluation** — per-property photo gallery (up to 12 photos, 8 MB each, stored in Vercel Blob), a virtual-tour link, and an 8-item condition report (roof, plumbing, electrical, …) for subscribers who can't visit a property in person.

**Business model:** 14-day free trial, then **$39/month**, billed by Stripe. Change both in one place: `config/pricing.ts`.

## Stack

| Piece | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript + Tailwind v4 |
| Auth | Auth.js v5 (NextAuth) — email magic links via Resend |
| Database | Postgres via Prisma (Neon or Supabase recommended) |
| Payments | Stripe Checkout + Customer Portal + webhooks |
| Map | Leaflet + OpenStreetMap (free, no key) |
| i18n | next-intl — `en` (default), `es`, `tl`; catalogs in `messages/*.json` |
| Photo storage | Vercel Blob (`BLOB_READ_WRITE_TOKEN`) |

## Run it locally

```bash
cd saas
npm install          # postinstall runs `prisma generate`
cp .env.example .env.local
# fill in .env.local (see below), then:
npx prisma migrate dev --name init   # creates tables in your database
npm run dev          # http://localhost:3000
```

> **Note:** `npm install` downloads a Prisma engine binary in a postinstall step. If your
> network interrupts it, re-run `npm install` — it resumes cleanly.

## Setup checklist (do these in order before your first paying subscriber)

### 1. Database — Postgres (5 min, free tier)
1. Create a free account at [Neon](https://neon.tech) (or Supabase).
2. Create a project + database, copy the connection string.
3. Put it in `.env.local` as `DATABASE_URL` (add `?sslmode=require` for Neon).
4. Run `npx prisma migrate dev --name init` locally once — this creates the tables.

### 2. Email — Resend (10 min, free tier)
1. Sign up at [resend.com](https://resend.com), verify your sending domain (or use their test domain while developing).
2. Create an API key → `AUTH_RESEND_KEY`.
3. Set `EMAIL_FROM` to a verified sender, e.g. `Your Product <noreply@yourdomain.com>`.

### 3. Auth secret (1 min)
```bash
npx auth secret   # writes AUTH_SECRET into .env.local
```

### 4. Stripe account (20–30 min)
1. Create your account at [stripe.com](https://stripe.com) and **activate it** (Stripe requires identity + bank details before you can take live payments — do this early, verification can take a day or two).
2. Start with **test mode** (toggle in the dashboard sidebar). Copy:
   - Secret key → `STRIPE_SECRET_KEY`
   - Publishable key → `STRIPE_PUBLISHABLE_KEY`
3. **Cardless free trial — how it works.** There is no Stripe Checkout in this app. When a subscriber clicks “Start free” on the Billing page, `POST /api/stripe/start-trial` creates the Stripe customer (if needed) and a subscription with a 14-day trial **directly via the Stripe API — no card collected**. The trial-ending logic:
   - ~3 days before trial end, Stripe fires `customer.subscription.trial_will_end` → the webhook emails the user a reminder to add a payment method (via the Billing page → “Manage billing” → Stripe Customer Portal).
   - If the user added a card, the trial converts to a paid $39/mo subscription automatically.
   - If no card is on file, the subscription is **auto-cancelled at trial end** (`trial_settings.end_behavior.missing_payment_method = "cancel"`) — no surprise charge, no `past_due` limbo. The webhook writes `canceled` and the dashboard gate removes access.
   - In the Stripe dashboard → Settings → Billing → Customer Portal, confirm **“Customers can update payment methods”** is enabled so trialing users can add a card.
4. **You do NOT create the product/price manually.** The app creates the $39/mo price on the fly in `start-trial` from `config/pricing.ts` — one source of truth. (If you later prefer a fixed Stripe Price ID, create the product once in test + live mode and wire its ID into `app/api/stripe/start-trial/route.ts`.)
5. **Webhook (test mode, for local dev):**
   ```bash
   stripe login
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   Copy the printed `whsec_...` secret → `STRIPE_WEBHOOK_SECRET`. Start a trial and confirm the user's status flips to `trialing` in the database.
6. **Webhook (production):** in the Stripe dashboard → Developers → Webhooks → Add endpoint:
   - URL: `https://<your-domain>/api/stripe/webhook`
   - Events: `customer.subscription.updated`, `customer.subscription.deleted`, `customer.subscription.trial_will_end`
   - Copy the signing secret → `STRIPE_WEBHOOK_SECRET` in your host's env vars.

### 5. Deploy to Vercel (10 min)
1. Push this folder to a GitHub repo.
2. Import it in [Vercel](https://vercel.com) → it auto-detects Next.js.
3. Add **all** `.env.local` variables in Vercel → Project → Settings → Environment Variables, with production values:
   - `AUTH_URL` and `NEXT_PUBLIC_APP_URL` = your production URL (e.g. `https://app.yourdomain.com`)
   - Live Stripe keys + live webhook secret (after flipping Stripe to live mode)
4. Deploy. Vercel runs `prisma generate` via postinstall automatically.
5. **Run migrations against production:** from your machine with `DATABASE_URL` pointed at production (or via `vercel env pull`), run:
   ```bash
   npx prisma migrate deploy
   ```

### 5b. Photo storage — Vercel Blob (5 min, free tier)
1. In Vercel → your project → **Storage** → create a **Blob** store, or get a
   token from your Blob store dashboard → `BLOB_READ_WRITE_TOKEN`.
2. Add it to `.env.local` and to Vercel's environment variables.
3. Without it, photo uploads are gracefully disabled (the Remote Evaluation
   panel shows a "photo storage unavailable" notice); virtual-tour links and
   condition reports still work.

### 6. Test the money path (test mode first!)
1. Sign up with your email → land on `/billing` (locale-prefixed, e.g. `/en/billing`) → click **Start free — no credit card required**.
2. Confirm you land in `/dashboard` (locale-prefixed) with full access — no card entered.
3. On the Billing page, confirm the amber “Add a payment method before {date}” call-to-action appears with your trial end date.
4. Trigger the trial-ending reminder: `stripe events trigger customer.subscription.trial_will_end` (or wait) → confirm the reminder email arrives.
5. Add Stripe's test card `4242 4242 4242 4242` (any future date, any CVC) via **Manage billing** (Customer Portal) → confirm it saves.
6. In the Stripe test dashboard, find the subscription and **cancel it** → webhook fires → confirm you're redirected back to `/billing` with access disabled.
7. Only then flip Stripe to **live mode** and repeat with a real card.

### 7. Change price or trial length
Edit `config/pricing.ts` — `monthlyPriceDollars` and `trialDays`. That's it: the pricing page, landing page, and billing copy all read from this file. Redeploy.

## Languages (English / Español / Tagalog)

- Supported locales: `en` (default), `es`, `tl` — defined once in `i18n/routing.ts`.
  **Every page URL is locale-prefixed** (`/es/dashboard`, `/tl/help`), and the
  navbar language switcher stores the choice in a one-year `NEXT_LOCALE` cookie.
- All UI copy lives in `messages/{en,es,tl}.json` (same key set in all three;
  `node scripts/check-i18n-parity.mjs` verifies parity). Keep database/API
  codes (lead status, condition keys, support topics) untranslated — labels are
  display-only.
- Auth.js session and Stripe subscription gating run in `proxy.ts` and
  `app/[locale]/dashboard/layout.tsx` and apply identically to every locale.
  API routes stay unprefixed under `app/api/`.
- The magic-link sign-in email is localized in `auth.ts` (`sendVerificationRequest`
  reads the `authEmail` catalog using the request's locale cookie/browser language).
- **Adding a language:** add `messages/<code>.json` with the full key set, add
  the code to `i18n/routing.ts`, add its catalog entry in `auth.ts`
  (`authEmailMessagesFor`) — no other code changes needed.
- Deliberately English-only: the generated contract document body
  (`components/ContractDocument.tsx` — legal text stays English by design; the
  builder UI around it is translated and the print view discloses the
  English-only document) and CSV export headers (machine-readable format).

## Region settings (Hawaiʻi-first, world-open)

The app is positioned for Hawaiʻi wholesalers but anyone in the world can
subscribe — there is no geo-blocking anywhere (signup, magic-link auth, and
Stripe Checkout all work globally; the price is a flat $39 USD).

- **Map:** starts centered on Oʻahu/Honolulu (`DEFAULT_CENTER` / `DEFAULT_ZOOM`
  in `lib/lead-types.ts`). Fully pannable and zoomable worldwide.
- **Research region:** every user has a region setting (default `"hawaii"`).
  On **Dashboard → Settings** they can switch to **Custom** and save their own
  county tax assessor URL and code-enforcement/violations URL (with labels).
  The research checklist for each newly added lead deep-links the user's
  configured lookups; existing leads keep the links they were created with.
  Region presets live in `config/research.ts` (`resolveRegion`,
  `buildResearchSteps`).
- **Contract templates:** the contract builder has a template picker —
  **Hawaiʻi** (Hawaiʻi-appropriate wholesaling/assignment disclosures) or
  **Generic** (state-neutral language, with an extra nudge to have a local
  real-estate attorney review for that state's rules). Both templates carry
  the prominent DRAFT — not legal advice banner. The choice is stored on the
  `ContractDraft.template` field.

## How access control works

- `proxy.ts` — redirects visitors without a session away from
  `/[locale]/dashboard/*` and `/[locale]/billing/*` (after next-intl's
  locale routing; API routes and static assets are excluded).
- `app/[locale]/dashboard/layout.tsx` — server-side gate: only users whose
  `subscriptionStatus` is `trialing` or `active` (per `lib/subscription.ts`) may enter; everyone else goes to `/[locale]/billing`.
- `app/api/stripe/webhook/route.ts` — the **only** writer of subscription fields. Stripe is the source of truth; the app never guesses.

## Remote property evaluation

For subscribers who can't visit a property in person. The panel appears under
each lead's research checklist on the dashboard:

- **Photos** — up to **12 per property**, **8 MB max per image**, image files
  only. Multi-file upload, captions (editable), gallery with lightbox
  navigation, per-photo deletion. Stored in **Vercel Blob** via `@vercel/blob`;
  deleting a property deletes its Blob objects too (best effort, logged).
  Set `BLOB_READ_WRITE_TOKEN` (see `.env.example`). Without it, uploads are
  gracefully disabled with an explanatory notice — the rest of the panel
  keeps working.
- **Virtual tour link** — a URL field on the property (validated as
  `http(s)://…`); rendered as an external link in the panel.
- **Condition report** — 8 fixed items (roof, exterior walls, foundation,
  plumbing, electrical, HVAC, interior, lot/landscaping), each rated
  `unchecked / good / fair / poor` with an optional note. Keys and statuses
  are stable English codes; only the labels translate. Saved per property via
  `PATCH /api/properties/[id]/conditions`.
- New Prisma tables: `PropertyPhoto`, `ConditionItem` (+ `Property.virtualTourUrl`).
  Apply with `npx prisma migrate deploy` (or `migrate dev` locally).

## Project layout

```
config/pricing.ts        ← price + trial (the business settings)
config/research.ts       ← region presets (Hawaiʻi default, custom) + checklist builder
config/support.ts        ← support topics (stable codes) + support email placeholder
prisma/schema.prisma     ← User/Account/Session + Property/ResearchItem/ContractDraft (+ User region fields, ContractDraft.template, PropertyPhoto, ConditionItem)
i18n/routing.ts          ← locales (en default, es, tl), locale prefix, NEXT_LOCALE cookie
messages/*.json          ← the entire UI copy in three languages (same key set)
auth.ts                  ← Auth.js config (Resend magic links incl. localized email, JWT sessions)
proxy.ts                 ← Next 16 session gate (replaces middleware.ts)
lib/db.ts                ← Prisma singleton
lib/stripe.ts            ← lazy Stripe client
lib/subscription.ts      ← hasActiveAccess() rule
lib/lead-types.ts        ← shared TS types + map/status constants (DEFAULT_CENTER = Oʻahu)
components/RemoteEvaluation.tsx ← photos gallery/lightbox + virtual tour + condition report
app/[locale]/page.tsx    ← landing page (features, pricing, FAQ)
app/[locale]/login, app/[locale]/signup ← magic-link auth
app/[locale]/dashboard   ← gated app: Map / Leads / Research / Contracts tabs
app/[locale]/dashboard/settings ← region settings page (Hawaiʻi preset vs custom county URLs)
app/[locale]/dashboard/contracts/[id]/print ← printable contract view (template-aware)
app/[locale]/billing     ← trial status, Stripe Checkout + Customer Portal
app/[locale]/help        ← Help Center (FAQ + troubleshooting + support form)
app/api/...              ← auth, stripe (checkout/portal/webhook), properties,
                           photos, conditions, research-items, contracts,
                           settings, support — all user-scoped
components/              ← MapInner/PropertyMap, PropertyForm, LeadTable,
                           ResearchChecklist, SettingsForm, ContractBuilder (+ template picker),
                           ContractDocument (Hawaiʻi + Generic templates)…
```

## Support inbox

The in-app Help Center (`/help`, linked in the navbar and footer) includes a
"Contact support" form. Submissions are delivered via Resend to the address in
`config/support.ts`:

```ts
supportEmail: "support@example.com", // <-- change this before launch
```

Set it to a real inbox you monitor (e.g. `support@yourdomain.com`) before
taking paying subscribers. No new env var is needed — sending reuses
`AUTH_RESEND_KEY` / `EMAIL_FROM`.

## Attorney review

Each contract draft has a **“Request attorney review”** button. On confirm,
the app emails the configured attorney (via Resend, reusing
`AUTH_RESEND_KEY` / `EMAIL_FROM`) with the subscriber's name/email, the deal
terms, and a link to the printable draft — as a request for engagement only.
The attorney bills the subscriber directly; the app takes no referral fee
(Hawaiʻi ethics rules forbid lawyers from paying non-lawyers for referrals).

Before launch, put your real attorney's details in `config/attorney.ts`:

```ts
export const ATTORNEY = {
  name: "Jane Doe, Esq. — Doe Law LLC", // <-- your Hawaiʻi real-estate attorney
  reviewEmail: "intake@doelaw.example",  // <-- their real inbox
};
```

Until you do, the API refuses to send (returns 503) so nothing ever goes to
the placeholder address. The attorney-client relationship begins only when
the attorney accepts the subscriber's request — the app's copy says this
explicitly and never claims the templates are "attorney-approved".

## Pre-launch legal review checklist

Real-world attorney steps — the code can't do these for you. Complete all
five before your first paying subscriber:

1. **Engage a Hawaiʻi real-estate attorney** who understands wholesaling and
   assignment contracts (not just closings).
2. **Have them review the Hawaiʻi contract template** rendered by
   `components/ContractDocument.tsx` (template `"hawaii"`). Only claim it is
   attorney-reviewed after they sign off on that exact text.
3. **Have them review the Guides articles** (`/[locale]/guides/*` — content in
   `messages/{en,es,tl}.json`, `guides` namespace). They're written as general
   educational explainers, but a local attorney should confirm nothing
   misstates Hawaiʻi law.
4. **Put the attorney's real name and email in `config/attorney.ts`**,
   replacing the placeholders.
5. **Test "Request attorney review" end-to-end** with the real address:
   request a review on a draft, confirm the email arrives with the right
   details and disclaimer language.

## Money-back guarantee & refunds

The landing page advertises a **30-day money-back guarantee, no questions
asked**, and the Billing page has a "Request a refund" button that routes to
the support form with the refund topic pre-selected. **Refunds are issued
manually by you in the Stripe dashboard** (Payments → select the payment →
Refund) — the app does not auto-refund. Typical turnaround: within
5 business days, back to the original payment method.

## Testimonials

`config/testimonials.ts` ships **empty** — the landing page shows a "be our
first success story" invitation until you add real entries. Never fabricate
testimonials: add an entry only with the subscriber's explicit permission,
using their real words. New support topic: "Share your success story".

## Public routes (no login required)

- `/[locale]/sample-contract` — the real contract template filled with
  clearly-labeled SAMPLE data, watermarked, printable. Linked from the
  landing pricing section as "See a sample contract".
- `/[locale]/guides` + `/[locale]/guides/[slug]` — the four Hawaiʻi
  wholesaling education guides. Linked in the footer.

## What YOU still own as the business operator

The code handles the product. These are yours:

- **Terms of Service + Privacy Policy** — required before charging anyone (Stripe asks for them during activation). Have them reviewed by a Hawaiʻi business attorney. Link them in the footer and signup flow.
- **Support** — set up a helpdesk (Intercom, Crisp, or Freshdesk), write an FAQ, and plan who answers tickets. Budget ~2–4 hrs/week at small scale.
- **The contract template** — it ships with wholesaling disclosures and a "draft only" banner, but it is **not** a substitute for an attorney-drafted agreement. Have a Hawaiʻi real-estate attorney bless it before your users rely on it.
- **Taxes & bookkeeping** — Stripe payouts are income; talk to a CPA about GET (Hawaiʻi general excise tax) on SaaS revenue.
- **Refunds/chargebacks** — decide your refund policy now and put it in the Terms (the research showed competitors get hammered on this — transparent policy is a selling point).
