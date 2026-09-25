// Lazy Stripe client. Constructed on first use (not at import time) so that
// `next build` and pages that don't touch billing never require the secret key.

import Stripe from "stripe";

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error(
        "STRIPE_SECRET_KEY is not set. Copy .env.example to .env.local and add your Stripe keys."
      );
    }
    stripe = new Stripe(key);
  }
  return stripe;
}
