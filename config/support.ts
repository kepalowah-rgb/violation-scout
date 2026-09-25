// ---------------------------------------------------------------------------
// Support configuration.
//
// SUPPORT_EMAIL is where "Contact support" form submissions are delivered.
// Change this to the real support inbox before launch (e.g.
// "support@violationscout.com"). It must be able to RECEIVE mail — it does
// not need to be the Resend-verified sender (EMAIL_FROM is used to send).
// Documented in README.md under "Support inbox".
// ---------------------------------------------------------------------------

export const SUPPORT = {
  /** Inbox that receives contact-support form submissions. */
  supportEmail: "support@example.com",

  /** Displayed response-time promise on the help page. Keep honest. */
  responsePromise: "We aim to reply within 2 business days.",
} as const;

/** Stable topic codes submitted by the support form (validated server-side).
 * Display labels are translated in the UI (messages: "supportForm.topics.<code>"). */
export const SUPPORT_TOPICS = [
  "getting-started",
  "map-logging",
  "lead-log",
  "research",
  "contracts",
  "billing",
  "refund",
  "success-story",
  "account",
  "bug",
  "other",
] as const;

/** English display labels for the support inbox email subject. */
export const SUPPORT_TOPIC_LABELS: Record<string, string> = {
  "getting-started": "Getting started",
  "map-logging": "Map & property logging",
  "lead-log": "Lead log",
  research: "Research workflow",
  contracts: "Contracts",
  billing: "Billing & subscription",
  refund: "Refund request",
  "success-story": "Success story submission",
  account: "Account & sign-in",
  bug: "Bug report",
  other: "Something else",
};
