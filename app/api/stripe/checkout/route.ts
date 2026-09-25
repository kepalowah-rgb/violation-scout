// POST /api/stripe/checkout — creates a Stripe Checkout Session for the
// monthly subscription with the configured free trial, then returns the
// hosted checkout URL. The webhook completes the signup on success.

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
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

  // Don't let an already-paying user buy a second subscription.
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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // Return the user to the locale they checked out from (the checkout page
  // itself is locale-aware; Stripe redirects back to these URLs).
  const cookieLocale = (await cookies()).get("NEXT_LOCALE")?.value;
  const locale = (routing.locales as readonly string[]).includes(cookieLocale ?? "")
    ? cookieLocale!
    : routing.defaultLocale;

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [
      {
        price_data: {
          currency: PRICING.currency,
          unit_amount: MONTHLY_PRICE_CENTS,
          recurring: { interval: PRICING.interval },
          product_data: { name: PRICING.productName },
        },
        quantity: 1,
      },
    ],
    subscription_data: {
      trial_period_days: PRICING.trialDays,
      metadata: { userId: user.id },
    },
    success_url: `${appUrl}/${locale}/dashboard?welcome=1`,
    cancel_url: `${appUrl}/${locale}/billing?canceled=1`,
    metadata: { userId: user.id },
  });

  return NextResponse.json({ url: checkout.url });
}
