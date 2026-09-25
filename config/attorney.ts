// ---------------------------------------------------------------------------
// Attorney-review connection configuration.
//
// Violation Scout lets a subscriber send a contract draft to a Hawaiʻi
// real-estate attorney for review. The attorney is an independent referral:
// the app introduces the subscriber, the attorney bills the subscriber
// directly, and no referral fee changes hands (Hawaiʻi ethics rules forbid
// lawyers from paying non-lawyers for referrals).
//
// BEFORE LAUNCH: replace the placeholders below with the real attorney's
// name and email. Until you do, the "Request attorney review" button is
// disabled server-side (the API refuses to send to a placeholder address).
// Documented in README.md under "Attorney review".
// ---------------------------------------------------------------------------

export const ATTORNEY = {
  /** Display name shown in the app, e.g. "Jane Doe, Esq. — Doe Law LLC". */
  name: "Your Hawaiʻi Real Estate Attorney",

  /** Inbox that receives "request attorney review" emails from subscribers. */
  reviewEmail: "attorney@example.com",
} as const;

/** True when the owner has configured a real attorney address. */
export function isAttorneyConfigured(): boolean {
  const email = ATTORNEY.reviewEmail.trim().toLowerCase();
  return email !== "" && email !== "attorney@example.com" && email.includes("@");
}
