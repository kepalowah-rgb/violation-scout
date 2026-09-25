// POST /api/stripe/portal — creates a Stripe Customer Portal session so the
// subscriber can update their card, view invoices, or cancel, without us
// handling any card data.

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { routing } from "@/i18n/routing";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: "No Stripe customer yet" }, { status: 400 });
  }

  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const cookieLocale = (await cookies()).get("NEXT_LOCALE")?.value;
  const locale = (routing.locales as readonly string[]).includes(cookieLocale ?? "")
    ? cookieLocale!
    : routing.defaultLocale;

  const portal = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${appUrl}/${locale}/billing`,
  });

  return NextResponse.json({ url: portal.url });
}
