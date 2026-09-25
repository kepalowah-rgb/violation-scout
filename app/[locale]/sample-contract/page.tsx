// Public sample contract — no signup, no login required.
//
// Renders the real ContractDocument component filled with clearly-labeled
// SAMPLE data, under a prominent SAMPLE banner. Lets prospects hold the
// product before paying. Print-friendly via PrintButton.

import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import ContractDocument from "@/components/ContractDocument";
import PrintButton from "@/components/PrintButton";
import type { ContractT } from "@/lib/lead-types";

const SAMPLE_CONTRACT: ContractT = {
  id: "sample",
  propertyId: null,
  sellerName: "Jane Sample (SAMPLE — not a real person)",
  propertyAddress: "123 Sample Street, Nanakuli, HI 96792 (SAMPLE ADDRESS)",
  tmk: "8-7-001:001 (sample)",
  purchasePrice: 350000,
  earnestMoney: 1000,
  assignmentFee: 15000,
  closingDate: "2026-11-15",
  inspectionDays: 14,
  additionalTerms:
    "SAMPLE TEXT — replace with your own terms. This document is a demonstration of the template only.",
  template: "hawaii",
  reviewRequestedAt: null,
  updatedAt: "2026-09-19T00:00:00.000Z",
};

export async function generateMetadata() {
  const t = await getTranslations("meta");
  return { title: t("sampleContractTitle"), description: t("sampleContractDescription") };
}

export default async function SampleContractPage() {
  const t = await getTranslations("sampleContract");

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {/* SAMPLE banner — screen only, the print view carries its own draft notice */}
      <div className="rounded-2xl border-2 border-amber-500 bg-amber-50 p-6 text-center print:hidden">
        <p className="text-2xl font-black uppercase tracking-widest text-amber-700">
          {t("bannerTitle")}
        </p>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-amber-900">{t("bannerBody")}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <PrintButton />
          <Link
            href="/signup"
            className="rounded-xl bg-emerald-700 px-6 py-2.5 font-semibold text-white hover:bg-emerald-800"
          >
            {t("bannerCta")}
          </Link>
        </div>
      </div>

      {/* Diagonal SAMPLE watermark overlay */}
      <div className="relative mt-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-hidden"
        >
          <span className="rotate-[-24deg] select-none text-[9rem] font-black uppercase tracking-widest text-stone-900/[0.06]">
            {t("watermark")}
          </span>
        </div>
        <div className="rounded-2xl border border-stone-200 shadow-sm">
          <ContractDocument contract={SAMPLE_CONTRACT} buyerName="Sample Buyer (SAMPLE)" />
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-stone-500 print:hidden">{t("footerNote")}</p>
    </div>
  );
}
