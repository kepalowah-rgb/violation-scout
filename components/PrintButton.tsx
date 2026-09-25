"use client";

// Small client button for the print view — window.print() must run in the
// browser. Hidden automatically when printing via the `no-print` class.

import { useTranslations } from "next-intl";

export default function PrintButton() {
  const t = useTranslations("contractPrint");
  return (
    <button
      onClick={() => window.print()}
      className="no-print rounded-xl bg-emerald-700 px-6 py-3 font-semibold text-white hover:bg-emerald-800"
    >
      {t("print")}
    </button>
  );
}
