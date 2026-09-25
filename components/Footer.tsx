"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PRICING } from "@/config/pricing";

export default function Footer() {
  const t = useTranslations("footer");
  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 text-xs text-stone-500 space-y-2">
        <p className="font-semibold text-stone-700">{PRICING.productName}</p>
        <p>{t("disclaimer")}</p>
        <p>
          <Link href="/guides" className="font-medium text-stone-600 hover:text-stone-900 hover:underline">
            {t("guides")}
          </Link>
          {" · "}
          <Link href="/help" className="font-medium text-stone-600 hover:text-stone-900 hover:underline">
            {t("helpCenter")}
          </Link>
        </p>
        <p>{t("rights", { year: new Date().getFullYear(), productName: PRICING.productName })}</p>
      </div>
    </footer>
  );
}
