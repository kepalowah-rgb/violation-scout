"use client";

// Billing actions for the cardless-trial flow.
//
// - state "start":    POST /api/stripe/start-trial → subscription with a
//                     14-day trial is created via the Stripe API (no card,
//                     no Checkout) and the user lands on the dashboard.
// - state "trialing": primary CTA opens the Stripe Customer Portal so the
//                     user can add a payment method before the trial ends.
// - state "active":   portal for managing/canceling.
// - showRefund:       link to the support form with the refund topic
//                     pre-selected (refunds are issued manually in Stripe).
//
// Card numbers are never handled by the app — everything payment-related
// happens on Stripe-hosted pages.

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PRICING } from "@/config/pricing";

export default function BillingActions({
  state,
  showRefund,
}: {
  state: "start" | "trialing" | "active";
  showRefund: boolean;
}) {
  const t = useTranslations("billing");
  const locale = useLocale();
  const [loading, setLoading] = useState<"start" | "portal" | null>(null);
  const [error, setError] = useState("");

  async function go(path: "/api/stripe/start-trial" | "/api/stripe/portal", which: "start" | "portal") {
    setLoading(which);
    setError("");
    try {
      const res = await fetch(path, { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Request failed");
      window.location.href = body.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-red-600">{error}</p>}

      {state === "start" && (
        <button
          onClick={() => go("/api/stripe/start-trial", "start")}
          disabled={loading !== null}
          className="w-full rounded-xl bg-emerald-700 px-6 py-3 font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
        >
          {loading === "start" ? t("redirecting") : t("startTrial")}
        </button>
      )}

      {state === "trialing" && (
        <>
          <button
            onClick={() => go("/api/stripe/portal", "portal")}
            disabled={loading !== null}
            className="w-full rounded-xl bg-amber-500 px-6 py-3 font-semibold text-stone-900 hover:bg-amber-400 disabled:opacity-50"
          >
            {loading === "portal" ? t("opening") : t("addPayment")}
          </button>
          <p className="text-xs text-stone-500">{t("trialCardNote", { price: `$${PRICING.monthlyPriceDollars}/mo` })}</p>
        </>
      )}

      {state === "active" && (
        <button
          onClick={() => go("/api/stripe/portal", "portal")}
          disabled={loading !== null}
          className="w-full rounded-xl border border-stone-300 px-6 py-3 font-semibold hover:bg-stone-100 disabled:opacity-50"
        >
          {loading === "portal" ? t("opening") : t("manageCancel")}
        </button>
      )}

      {showRefund && (
        <Link
          href={{ pathname: "/help", query: { topic: "refund" }, hash: "contact" }}
          className="block w-full rounded-xl border border-stone-300 px-6 py-3 text-center font-semibold text-stone-700 hover:bg-stone-100"
        >
          {t("refundCta")}
        </Link>
      )}

      <p className="text-xs text-stone-500">{t("stripeNote")}</p>
    </div>
  );
}
