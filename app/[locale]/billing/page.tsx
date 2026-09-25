// Billing page: shows trial/subscription status for the cardless-trial flow.
//
// Trials start with one click (no card, no Stripe Checkout) via
// /api/stripe/start-trial. Trialing users are urged to add a payment method
// through the Stripe Customer Portal before the trial ends; without one the
// subscription auto-cancels at trial end. Users with no active subscription
// land here from the dashboard gate to start their trial.

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { hasActiveAccess, isTrialing } from "@/lib/subscription";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PRICING } from "@/config/pricing";
import BillingActions from "@/components/BillingActions";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const t = await getTranslations("meta");
  return { title: t("billingTitle") };
}

export default async function BillingPage({
  searchParams,
  params,
}: {
  searchParams: Promise<{ needs_subscription?: string }>;
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  const { locale } = await params;
  if (!session?.user?.id) redirect(`/${locale}/login`);
  const sp = await searchParams;

  const t = await getTranslations("billing");
  const tp = await getTranslations("pricing");
  const price = tp("price", { price: PRICING.monthlyPriceDollars });
  const trial = tp("trial", { days: PRICING.trialDays });

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect(`/${locale}/login`);

  const active = hasActiveAccess(user);
  const isTrial = isTrialing(user);

  const statusKey =
    user.subscriptionStatus === "trialing"
      ? "statusTrialing"
      : user.subscriptionStatus === "active"
        ? "statusActive"
        : user.subscriptionStatus === "past_due"
          ? "statusPastDue"
          : user.subscriptionStatus === "canceled"
            ? "statusCanceled"
            : user.subscriptionStatus === "unpaid"
              ? "statusUnpaid"
              : "statusNone";
  const fmtDate = (d: Date) =>
    d.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });

  const actionState = isTrial ? "trialing" : active ? "active" : "start";

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>

      {sp.needs_subscription && !active && (
        <p className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
          {t("needsSubscription", { trial })}
        </p>
      )}

      <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-stone-500">{t("status")}</p>
            <p className="text-xl font-semibold">{t(statusKey)}</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              active ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-600"
            }`}
          >
            {active ? t("accessEnabled") : t("accessDisabled")}
          </span>
        </div>

        {isTrial && user.trialEndsAt && (
          <div className="mt-3 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">
              {t("addPaymentBefore", { date: fmtDate(user.trialEndsAt) })}
            </p>
            <p className="mt-1">{t("trialEnds", { date: fmtDate(user.trialEndsAt) })}</p>
          </div>
        )}
        {user.subscriptionStatus === "active" && user.currentPeriodEnd && (
          <p className="mt-3 text-sm text-stone-600">
            {t("nextBilling", { date: fmtDate(user.currentPeriodEnd), price })}
          </p>
        )}

        <div className="mt-6">
          <BillingActions state={actionState} showRefund={!!user.stripeCustomerId && actionState !== "start"} />
        </div>
      </div>
    </div>
  );
}
