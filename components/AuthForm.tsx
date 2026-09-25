"use client";

// Email magic-link sign-in. One form serves both /login and /signup: entering
// an email sends a sign-in link; clicking it creates the account if needed.
// After auth, new users land on /billing to start their trial.

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { PRICING } from "@/config/pricing";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const t = useTranslations("auth");
  const tp = useTranslations("pricing");
  const trialLabel = tp("trial", { days: PRICING.trialDays });
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const verified = searchParams.get("verify") === "1";
  const next = searchParams.get("next") ?? "/billing";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await signIn("resend", { email, redirect: false, callbackUrl: next });
      if (res?.error) setError(t("errorSend"));
      else setSent(true);
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight">
          {mode === "signup" ? t("signupTitle") : t("loginTitle")}
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          {mode === "signup" ? t("signupSub", { trial: trialLabel }) : t("loginSub")}
        </p>

        {verified && !sent && (
          <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{t("verified")}</p>
        )}

        {sent ? (
          <p className="mt-4 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
            {t("sent", { email, finish: mode === "signup" ? t("sentFinishSignup") : t("sentFinishLogin") })}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-medium">{t("emailLabel")}</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
              />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
            >
              {loading ? t("sending") : mode === "signup" ? t("ctaSignup") : t("ctaLogin")}
            </button>
          </form>
        )}

        <p className="mt-6 text-xs text-stone-500">{t("legal")}</p>
      </div>
    </div>
  );
}
