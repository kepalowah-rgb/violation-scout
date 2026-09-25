// POST /api/stripe/webhook — the ONLY writer of subscription state.
//
// Stripe signs every event; we verify the signature with STRIPE_WEBHOOK_SECRET
// before trusting anything. Configure the endpoint in the Stripe dashboard:
//   https://<your-app>/api/stripe/webhook
// Listen for: customer.subscription.updated, customer.subscription.deleted,
// customer.subscription.trial_will_end.
//
// Trials are cardless (see /api/stripe/start-trial): at trial end Stripe
// auto-cancels subscriptions with no payment method on file, so access ends
// cleanly with no surprise charge. Three days before the trial ends Stripe
// sends customer.subscription.trial_will_end and we email the user a reminder
// to add a payment method via the Billing page.

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { PRICING } from "@/config/pricing";

export async function POST(req: Request) {
  const stripe = getStripe();
  const signature = (await headers()).get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return new NextResponse("Webhook not configured", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(await req.text(), signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return new NextResponse(`Webhook signature verification failed: ${message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.trial_will_end": {
        const sub = event.data.object as Stripe.Subscription;
        const user = await findUserFor(sub);
        if (user?.email) {
          await sendTrialEndingEmail(user.email, user.name, sub.trial_end);
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const user = await findUserFor(sub);
        if (user) {
          await db.user.update({
            where: { id: user.id },
            data: {
              subscriptionStatus:
                event.type === "customer.subscription.deleted" ? "canceled" : sub.status,
              trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
              currentPeriodEnd: periodEndOf(sub),
            },
          });
        }
        break;
      }

      default:
        // Ignore other event types (invoices, payment intents, etc.).
        break;
    }
  } catch (err) {
    console.error("Stripe webhook handler failed:", err);
    return new NextResponse("Webhook handler failed", { status: 500 });
  }

  return NextResponse.json({ received: true });
}

/** Find the app user for a Stripe subscription: prefer the stored
 *  subscription id, fall back to the customer id. */
async function findUserFor(sub: Stripe.Subscription) {
  return (
    (await db.user.findFirst({ where: { stripeSubscriptionId: sub.id } })) ??
    (typeof sub.customer === "string"
      ? await db.user.findFirst({ where: { stripeCustomerId: sub.customer } })
      : null)
  );
}

/** Best-effort read of the current billing period end across Stripe API shapes. */
function periodEndOf(sub: Stripe.Subscription): Date | null {
  const item = sub.items?.data?.[0] as { current_period_end?: number } | undefined;
  const ts = item?.current_period_end;
  return typeof ts === "number" ? new Date(ts * 1000) : null;
}

/**
 * Trial-ending reminder (sent ~3 days before trial end by Stripe's
 * trial_will_end event). Reuses the Resend REST pattern from the support
 * route — no new dependencies. English-only for now: the webhook has no
 * locale context. If Resend isn't configured we log and move on — this must
 * never fail the webhook.
 */
async function sendTrialEndingEmail(
  email: string,
  name: string | null,
  trialEnd: number | null
): Promise<void> {
  const resendKey = process.env.AUTH_RESEND_KEY;
  const from = process.env.EMAIL_FROM;
  if (!resendKey || !from) {
    console.error("[webhook] trial_will_end: missing AUTH_RESEND_KEY or EMAIL_FROM");
    return;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const endDate = trialEnd
    ? new Date(trialEnd * 1000).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "soon";
  const greeting = name ? `Hi ${name},` : "Hi,";
  const subject = `Your ${PRICING.productName} trial ends in 3 days`;
  const text = [
    greeting,
    ``,
    `Your ${PRICING.productName} free trial ends on ${endDate}.`,
    ``,
    `To keep full access, add a payment method before then: open the Billing page and click “Manage billing” to add your card securely through Stripe. You'll only be charged $${PRICING.monthlyPriceDollars}/mo after the trial ends — cancel any time and you pay nothing.`,
    ``,
    `Billing page: ${appUrl}/en/billing`,
    ``,
    `If you do nothing, your access ends automatically when the trial expires and you will never be charged.`,
  ].join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [email], subject, text }),
  });

  if (!res.ok) {
    console.error("[webhook] trial_will_end email failed:", res.status, await res.text().catch(() => ""));
  }
}
