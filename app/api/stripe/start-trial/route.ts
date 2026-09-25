// POST /api/stripe/start-trial — cardless free trial.
//
// Creates the Stripe customer (if needed) and a subscription with a
// 14-day trial DIRECTLY via the Stripe API — no Checkout, no payment method
// collected. The user returns straight to the dashboard.
//
// At trial end Stripe auto-cancels the subscription when no payment method
// is on file (trial_settings.end_behavior.missing_payment_method = "cancel"),
// so access ends cleanly with no surprise charge. The webhook's
// `customer.subscription.trial_will_end` handler emails a reminder 3 days
// before the trial ends. The subscriber adds a card any time via the
// Stripe Customer Portal (/api/stripe/portal).

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Stripe from "stripe";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { PRICING, MONTHLY_PRICE_CENTS } from "@/config/pricing";
import { routing } from "@/i18n/routing";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 401 });

  // Don't let an already-entitled user start a second trial.
  if (user.subscriptionStatus === "trialing" || user.subscriptionStatus === "active") {
    return NextResponse.json({ error: "Subscription already active" }, { status: 400 });
  }

  const stripe = getStripe();

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name ?? undefined,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await db.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
  }

  // Inline price_data on subscription items doesn't accept product_data in
  // this SDK version, so create the Price explicitly first. (If you later
  // prefer one fixed Stripe Price, create it once in the dashboard and use
  // its ID here instead.)
  const price = await stripe.prices.create({
    currency: PRICING.currency,
    unit_amount: MONTHLY_PRICE_CENTS,
    recurring: { interval: PRICING.interval },
    product_data: { name: PRICING.productName },
    metadata: { userId: user.id },
  });

  const sub = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: price.id, quantity: 1 }],
    trial_period_days: PRICING.trialDays,
    // No card on file at trial end → cancel cleanly instead of a failed
    // charge + past_due limbo. The webhook writes the "canceled" status and
    // the dashboard gate removes access.
    trial_settings: { end_behavior: { missing_payment_method: "cancel" } },
    metadata: { userId: user.id },
  });

  await db.user.update({
    where: { id: user.id },
    data: {
      stripeSubscriptionId: sub.id,
      subscriptionStatus: sub.status,
      trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
      currentPeriodEnd: periodEndOf(sub),
    },
  });

  // Return the user to the locale they started the trial from.
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const cookieLocale = (await cookies()).get("NEXT_LOCALE")?.value;
  const locale = (routing.locales as readonly string[]).includes(cookieLocale ?? "")
    ? cookieLocale!
    : routing.defaultLocale;

  return NextResponse.json({ url: `${appUrl}/${locale}/dashboard?welcome=1` });
}

/** Best-effort read of the current billing period end across Stripe API shapes. */
function periodEndOf(sub: Stripe.Subscription): Date | null {
  const item = sub.items?.data?.[0] as { current_period_end?: number } | undefined;
  const ts = item?.current_period_end;
  return typeof ts === "number" ? new Date(ts * 1000) : null;
}
