// Subscription gating logic — the single rule that decides who may use the app.
//
// Access is granted when Stripe reports the subscription as "trialing" or
// "active". The webhook (app/api/stripe/webhook/route.ts) is the only writer
// of these fields, so billing state always matches Stripe, not local guesses.

export type SubscriptionState = {
  subscriptionStatus: string | null;
  trialEndsAt: Date | null;
};

const ACTIVE_STATUSES = new Set(["trialing", "active"]);

export function hasActiveAccess(user: SubscriptionState): boolean {
  return !!user.subscriptionStatus && ACTIVE_STATUSES.has(user.subscriptionStatus);
}

export function isTrialing(user: SubscriptionState): boolean {
  return user.subscriptionStatus === "trialing";
}
