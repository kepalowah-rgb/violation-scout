// ---------------------------------------------------------------------------
// Pricing & trial configuration — THE business settings live here.
//
// To change the price or trial length, edit the two values below. Everything
// else (Stripe Checkout, the landing-page pricing section, the billing page)
// reads from this file, so there is exactly one place to change.
// ---------------------------------------------------------------------------

export const PRICING = {
  /** Public product name shown on the landing page, checkout and emails. */
  productName: "Violation Scout",

  /** Monthly subscription price in whole dollars. Stripe is billed in cents. */
  monthlyPriceDollars: 39,

  /** Free trial length in days. Stripe handles the trial; no card charge until it ends. */
  trialDays: 14,

  currency: "usd" as const,
  interval: "month" as const,
} as const;

/** Price in the smallest currency unit, as Stripe expects. */
export const MONTHLY_PRICE_CENTS = PRICING.monthlyPriceDollars * 100;

/** Human-readable price label, e.g. "$39/mo". */
export const PRICE_LABEL = `$${PRICING.monthlyPriceDollars}/mo`;

/** Human-readable trial label, e.g. "14-day free trial". */
export const TRIAL_LABEL = `${PRICING.trialDays}-day free trial`;
