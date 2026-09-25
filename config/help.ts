// ---------------------------------------------------------------------------
// Help Center content: FAQ topics and troubleshooting guides.
//
// SUPERSEDED — no longer rendered. Help content now lives in the i18n
// catalogs (messages/{en,es,tl}.json, `help` namespace) and is rendered by
// app/[locale]/help/page.tsx. This file is kept as the canonical English
// source text so a human can diff translations against it, but changing it
// does NOT change the UI. Prices and trial length are interpolated from
// config/pricing.ts so there is still one source of truth for business
// settings.
// ---------------------------------------------------------------------------

import { PRICING, PRICE_LABEL, TRIAL_LABEL } from "./pricing";

export interface FaqItem {
  q: string;
  a: string;
}

export interface FaqTopic {
  id: string;
  title: string;
  blurb: string;
  items: FaqItem[];
}

export interface TroubleshootGuide {
  id: string;
  title: string;
  symptoms: string[];
  causes: string[];
  steps: string[];
  contactWhen: string;
}

export const FAQ_TOPICS: FaqTopic[] = [
  {
    id: "getting-started",
    title: "Getting started",
    blurb: "What Violation Scout is and how to begin.",
    items: [
      {
        q: "What is Violation Scout?",
        a: "Violation Scout is a driving-for-dollars lead tool for real-estate wholesalers: pin distressed properties on a map, log suspected code violations, research owners through official public records, and generate wholesale assignment contract drafts — all in one place. It's Hawaiʻi-first (the research workflow and contract template default to Honolulu records and Hawaiʻi disclosures), but anyone in the world can subscribe and use it.",
      },
      {
        q: "How do I start my free trial?",
        a: `Sign up with your email address, click the magic sign-in link we email you, then go to the Billing page and click "Start ${TRIAL_LABEL}". Stripe Checkout collects your card but you are not charged until the trial ends. Cancel any time during the trial and you pay nothing.`,
      },
      {
        q: "Do I need to install an app?",
        a: "No. Violation Scout runs in any modern web browser and is designed to be phone-friendly, so you can log properties from the field on your phone without installing anything.",
      },
      {
        q: "Does it work outside Hawaiʻi?",
        a: "Yes. The map, lead logging, and contracts work anywhere in the world — the map starts on Oʻahu but you can pan and zoom to any market. The research checklist defaults to City & County of Honolulu public records, but in Dashboard → Settings you can switch to a Custom region and point the checklist at your own county's tax assessor and code-enforcement sites. The contract generator also offers a Generic template with state-neutral language for use outside Hawaiʻi.",
      },
      {
        q: "Is using this app the same as getting legal advice?",
        a: "No. Violation Scout provides general information and document templates for educational purposes. Wholesaling rules vary by state. In Hawaiʻi, market your contractual/equitable interest (not a property you don't own), use assignable contracts with clear disclosure, and have a licensed Hawaiʻi attorney review any contract before anyone signs it.",
      },
    ],
  },
  {
    id: "map-logging",
    title: "Map & logging properties",
    blurb: "Dropping pins and capturing leads in the field.",
    items: [
      {
        q: "How do I log a property from the map?",
        a: "Open the Map tab and click (or tap) anywhere on the map to drop a pin. A form opens — enter the address, your distress notes, any suspected violations, and a priority, then save. The pin appears on the map and the lead is added to your log.",
      },
      {
        q: "Do I need a Google Maps API key?",
        a: "No. The map uses free OpenStreetMap tiles through Leaflet, so there is nothing to configure and no key to pay for.",
      },
      {
        q: "What do the pin colors mean?",
        a: "Pin colors follow the lead status: New (amber), Researching (blue), Contacted (purple), Offer made (orange), Under contract (green), Assigned (dark green), Dead (gray). Change a lead's status in the Lead log and its pin color updates automatically.",
      },
      {
        q: "Can I use the map on my phone while driving for dollars?",
        a: "Yes — the map and logging form are built for phones. For safety, have a passenger log properties or pull over before tapping the map.",
      },
      {
        q: "The map is blank or the tiles won't load. What do I do?",
        a: "See the troubleshooting guide “Map tiles not loading” below — it walks through the usual causes (connection, ad blockers, cached tiles) step by step.",
      },
    ],
  },
  {
    id: "lead-log",
    title: "Lead log",
    blurb: "Managing, sorting, and exporting your leads.",
    items: [
      {
        q: "What do the lead statuses mean?",
        a: "New lead (just logged) → Researching (working the checklist) → Contacted (owner reached) → Offer made → Under contract → Assigned (contract wholesaled to a buyer). Mark a lead Dead when it's no longer worth pursuing. Statuses drive pin colors on the map.",
      },
      {
        q: "How should I use priorities?",
        a: "Priorities (low / medium / high) are yours to define — for example, high for visibly vacant or heavily distressed properties you want to research first. They don't change app behavior; they help you sort your attention.",
      },
      {
        q: "Can I export my leads to a spreadsheet?",
        a: "Yes. On the Leads tab, click “Export CSV” to download all your leads as a CSV file, which opens in Excel or Google Sheets.",
      },
      {
        q: "Can I edit or delete a lead?",
        a: "Yes — use the Edit and Delete actions in the lead log. Deleting is permanent and can't be undone, so the app asks for confirmation first.",
      },
      {
        q: "I saved a lead but it isn't showing up.",
        a: "See the troubleshooting guide “Logged data not appearing” below.",
      },
    ],
  },
  {
    id: "research",
    title: "Research workflow",
    blurb: "Finding owners and checking violations through official records.",
    items: [
      {
        q: "How do I find who owns a property?",
        a: "Open the Research tab, select the lead, and work the checklist. The first steps link to the official lookups for your configured region — Honolulu's Real Property Assessment Division (RPAD) by default. Search by address or TMK and record the owner name and mailing address exactly as shown, then cross-check on the second source.",
      },
      {
        q: "Can I use the research checklist outside Hawaiʻi?",
        a: "Yes. Go to Dashboard → Settings and switch your region to Custom, then enter your own county tax assessor's lookup URL and code-enforcement/violations URL. Checklists for leads you add from then on will deep-link your county's sites instead of Honolulu's. Existing leads keep their original links.",
      },
      {
        q: "Why can't the app look up owners automatically?",
        a: "Honolulu offers no public API for ownership or violation data, so no app can pull it with one click. The checklist deep-links you to the official lookup pages instead, and tracks what you've confirmed.",
      },
      {
        q: "What's the difference between suspected and confirmed violations?",
        a: "Suspected is your field observation (e.g. “junk vehicles in yard, possible violation”). Confirmed means you've seen it in an official record, such as a notice of violation or permit status in HNL Build. Keep the two separate — the research checklist has a dedicated step for confirming with evidence.",
      },
      {
        q: "HNL Build won't show me full violation details. Why?",
        a: "The City restricts detailed violation records to the applicant. The app's checklist links to the DPP records page, where you can search HNL Build by address or TMK first; for records beyond the listing, submit a request to the Data Access and Imaging Branch (dppdaib@honolulu.gov).",
      },
      {
        q: "Should I skip-trace inside the app?",
        a: "The checklist includes a skip-tracing step, but you'll use your own skip-tracing service for phone and email lookup. Log the source and date of anything you find — never guess contact info.",
      },
    ],
  },
  {
    id: "contracts",
    title: "Contracts",
    blurb: "Generating wholesale assignment contract drafts.",
    items: [
      {
        q: "What does the contract generator create?",
        a: "A wholesale assignment contract draft pre-filled with the property, seller, price, earnest money, assignment fee, and closing details you enter. You pick a template when creating the draft: Hawaiʻi (with Hawaiʻi-appropriate disclosures such as your intent to assign the contract for a fee) or Generic, with state-neutral language for properties in other states. Every draft is watermarked DRAFT ONLY.",
      },
      {
        q: "Can the seller sign inside the app?",
        a: "No — the app doesn't collect e-signatures. Generate the draft, print it (or save as PDF), and collect signatures on paper or with your own e-signature tool.",
      },
      {
        q: "How do I print or save a contract as PDF?",
        a: "On the Contracts tab, click “Preview & print” on the draft. In the print view, use your browser's print dialog (Ctrl/Cmd + P) and choose “Save as PDF” as the destination. If the layout looks off, see the troubleshooting guide “Contract not printing correctly.”",
      },
      {
        q: "Is the generated contract ready to use as-is?",
        a: "No. It is a starting draft, not a substitute for an attorney-drafted agreement. Hawaiʻi-template drafts need review by a licensed Hawaiʻi real-estate attorney; Generic-template drafts need review by a licensed real-estate attorney in the state where the property is located, since wholesaling rules vary by state. Nobody should rely on or sign it before that review.",
      },
      {
        q: "What is attorney review?",
        a: "On any contract draft, click “Request attorney review.” We email your draft details to our Hawaiʻi real-estate attorney partner and introduce you as a potential client. The attorney contacts you directly about reviewing it — the app never shares your data with anyone else.",
      },
      {
        q: "What does attorney review cost?",
        a: "The attorney bills you separately and directly — review fees are not part of your Violation Scout subscription. Confirm the attorney's fee with them before they begin work.",
      },
      {
        q: "Does requesting a review make the attorney my lawyer?",
        a: "No. Your request is an introduction only. An attorney-client relationship begins only when the attorney accepts your engagement under their own terms.",
      },
      {
        q: "Can I request review again after changing the draft?",
        a: "Yes. Once requested, the button becomes a “Review requested” badge. If you revise the draft, use the re-send option to email the updated version to the attorney.",
      },
    ],
  },
  {
    id: "billing",
    title: "Billing & subscription",
    blurb: `Trial, pricing (${PRICE_LABEL} after a ${TRIAL_LABEL}), and cancellations.`,
    items: [
      {
        q: `How much does Violation Scout cost?`,
        a: `After your ${TRIAL_LABEL}, the subscription is ${PRICE_LABEL}, billed monthly through Stripe. There are no per-lead fees, credit packs, or add-ons.`,
      },
      {
        q: "How do I cancel my subscription?",
        a: "Go to the Billing page and click “Manage subscription” to open the Stripe Customer Portal, then cancel there. Your access continues until the end of the current billing period, and you won't be charged again.",
      },
      {
        q: "What happens when my trial ends?",
        a: `On day ${PRICING.trialDays + 1} your card is charged ${PRICE_LABEL} for the first month and your subscription becomes active. Cancel any time during the trial from the Billing page to avoid being charged.`,
      },
      {
        q: "My payment failed. What should I do?",
        a: "Open the Billing page → “Manage subscription” and update your payment method in the Stripe Customer Portal. If a payment stays unresolved, your dashboard access is paused until billing is current — it restores automatically once payment succeeds.",
      },
      {
        q: "Do you offer refunds?",
        a: "Refund requests are handled case by case — contact support using the form below. Our full refund policy is in the Terms of Service.",
      },
      {
        q: `I completed Stripe checkout but my subscription still shows as inactive.`,
        a: "See the troubleshooting guide “Subscription status not updating after checkout” below.",
      },
    ],
  },
  {
    id: "account",
    title: "Account & sign-in",
    blurb: "Magic links, email changes, and your data.",
    items: [
      {
        q: "How do I sign in? I never set a password.",
        a: "Violation Scout uses passwordless sign-in. Enter your email on the sign-in page and we'll email you a magic link — click it and you're signed in. No passwords to remember or reset.",
      },
      {
        q: "I didn't receive my magic link email.",
        a: "See the troubleshooting guide “Magic-link email not arriving” below.",
      },
      {
        q: "Can I change the email address on my account?",
        a: "Not self-service yet — contact support with your current and new email address and we'll move your account and leads over.",
      },
      {
        q: "How do I delete my account and data?",
        a: "Contact support and ask for account deletion. We'll permanently delete your user record and all associated leads, research items, and contract drafts.",
      },
      {
        q: "Where do I change my research region?",
        a: "Go to Dashboard → Settings. Choose Hawaiʻi (the default, using Honolulu's RPAD and HNL Build lookups) or Custom, where you enter your own county's tax assessor and code-enforcement lookup URLs. The change applies to research checklists for leads you add afterward; existing leads keep their original links.",
      },
      {
        q: "Is my lead data private?",
        a: "Yes. All properties, research notes, and contract drafts are scoped to your account — other subscribers can't see them. See the Privacy Policy for details.",
      },
    ],
  },
];

export const TROUBLESHOOTING: TroubleshootGuide[] = [
  {
    id: "map-tiles",
    title: "Map tiles not loading",
    symptoms: [
      "The map area is gray, blank, or shows a “tiles unavailable” message.",
      "Streets and satellite imagery never appear, even after waiting.",
    ],
    causes: [
      "No internet connection or a very slow connection (common in the field).",
      "An ad blocker, privacy extension, or VPN blocking the tile server.",
      "Stale cached tiles or a stuck map session.",
    ],
    steps: [
      "Check your connection: load any other website. If you're in the field with weak signal, move somewhere with better reception and reload.",
      "Hard-refresh the page (Ctrl/Cmd + Shift + R).",
      "Temporarily disable ad blockers or privacy extensions for this site, then reload.",
      "If you're on a VPN, disconnect it and try again — some VPN exits are rate-limited by tile providers.",
      "Clear your browser cache for this site, or try a private/incognito window.",
      "Try a different network (e.g. switch from Wi-Fi to mobile data) to rule out a network-level block.",
    ],
    contactWhen:
      "If tiles still won't load on two different networks with extensions disabled, contact support and tell us your device, browser, and whether the rest of the app works.",
  },
  {
    id: "magic-link",
    title: "Magic-link email not arriving",
    symptoms: [
      "You requested a sign-in link but no email arrives within a few minutes.",
      "The sign-in page says the link was sent, but your inbox is empty.",
    ],
    causes: [
      "The email landed in spam/junk or a Promotions tab.",
      "A typo in the email address you entered.",
      "Corporate or school email filters quarantining automated mail.",
      "Requesting several links in a row — only the newest link works, and rapid repeats can look like abuse to filters.",
    ],
    steps: [
      "Wait 5 minutes — email delivery is occasionally slow.",
      "Check spam/junk and any Promotions or Updates tabs, and search for the sender address.",
      "Confirm you typed your email correctly, then request one fresh link and use the newest email only.",
      "If you use a work or school address, try a personal address instead — corporate filters often block automated mail.",
      "Add the sender address to your contacts and request another link.",
    ],
    contactWhen:
      "If no link arrives after 15 minutes across two different email addresses, contact support with the email address you're trying to use (don't paste any link codes).",
  },
  {
    id: "subscription-status",
    title: "Subscription status not updating after checkout",
    symptoms: [
      "You completed Stripe checkout but the Billing page still shows no active subscription.",
      "You're redirected back to the Billing page when opening the dashboard.",
    ],
    causes: [
      "Stripe's confirmation webhook hasn't reached the app yet (usually seconds, occasionally minutes).",
      "The checkout was closed or canceled before payment completed.",
      "You checked out with a different email than your account.",
    ],
    steps: [
      "Wait 2–3 minutes, then reload the Billing page.",
      "Confirm the checkout actually completed: check for a Stripe email receipt.",
      "Make sure the email on the Stripe receipt matches the email you use to sign in here. If they differ, sign in with the checkout email.",
      "Sign out and sign back in to refresh your session, then revisit the Billing page.",
    ],
    contactWhen:
      "If you have a Stripe receipt and the Billing page still shows no subscription after 15 minutes, contact support with the email address on the receipt — do NOT send card numbers.",
  },
  {
    id: "checkout-errors",
    title: "Checkout errors",
    symptoms: [
      "Stripe Checkout shows an error or your card is declined.",
      "The checkout window closes or goes blank unexpectedly.",
    ],
    causes: [
      "Card declined by your bank (insufficient funds, fraud hold, international block).",
      "Expired card or mistyped card details.",
      "Browser extensions interfering with the Stripe popup.",
    ],
    steps: [
      "Double-check the card number, expiry, and CVC, and confirm the billing ZIP matches your bank's records.",
      "Try a different card, or call the number on the back of your card — banks often just need you to approve the charge.",
      "Disable ad blockers for the checkout page and try again in a private/incognito window.",
      "If the window goes blank, allow popups for this site and retry.",
    ],
    contactWhen:
      "If two different valid cards fail and your bank says nothing is blocked, contact support with the exact error message Stripe shows (never send full card numbers).",
  },
  {
    id: "data-missing",
    title: "Logged data not appearing",
    symptoms: [
      "You saved a property, research note, or contract but it doesn't show in the list.",
      "The app showed an error or “Save failed” message.",
    ],
    causes: [
      "The save actually failed (e.g. connection dropped) — the app shows an alert in that case.",
      "You're signed in with a different email than the one you used to create the data.",
      "A stale page is showing cached content.",
    ],
    steps: [
      "Reload the page — the dashboard re-fetches your data on load.",
      "Check whether an error alert appeared when you saved. If it said “Save failed,” your connection likely dropped; retry on a stable connection.",
      "Confirm you're signed in with the same email you used originally (leads are private to each account).",
      "For a missing map pin, check the Leads tab — the lead may have saved without coordinates.",
    ],
    contactWhen:
      "If the data still doesn't appear after reloading on a good connection, contact support with the address or contract name and roughly when you saved it.",
  },
  {
    id: "contract-print",
    title: "Contract not printing correctly",
    symptoms: [
      "The printed contract is cut off, missing pages, or the layout looks broken.",
      "“Save as PDF” produces a blank or partial document.",
    ],
    causes: [
      "Browser print scaling or margins clipping the document.",
      "Background graphics disabled, hiding shaded sections.",
      "Printing from the dashboard instead of the dedicated print view.",
    ],
    steps: [
      "Always print from the dedicated print view: Contracts tab → “Preview & print.” Don't print the dashboard page itself.",
      "In the print dialog, set Destination to “Save as PDF” (or your printer), and set Margins to “Default.”",
      "Enable “Background graphics” in the print dialog's options — the draft banner and shaded blocks need it.",
      "If content is cut off, try a different scale (e.g. 90%) or switch between Portrait and Landscape.",
      "Try a different browser (Chrome's print-to-PDF is the most reliable).",
    ],
    contactWhen:
      "If the print view itself looks broken on screen (not just on paper), contact support with your browser and a description of what's wrong — the draft is still safe in your Contracts tab.",
  },
];

export const HELP_SEARCH_PLACEHOLDER = "Search the help center — e.g. “cancel subscription”, “magic link”, “print contract”…";
