// Printable contract view. Opens in a new tab from the dashboard; the user
// prints it (or saves as PDF) for attorney review and signatures.
// Ownership is verified server-side before rendering.
// The legal document itself stays in English; only the surrounding UI
// chrome is translated.

import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import ContractDocument from "@/components/ContractDocument";
import PrintButton from "@/components/PrintButton";

export const dynamic = "force-dynamic";

export default async function PrintContractPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const session = await auth();
  if (!session?.user?.id) notFound();
  const { id, locale } = await params;

  const contract = await db.contractDraft.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!contract) notFound();

  const t = await getTranslations("contractPrint");
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  const generic = contract.template === "generic";

  return (
    <div className="bg-stone-200 py-8">
      <div className="no-print mx-auto mb-6 flex max-w-3xl items-center justify-between px-4">
        <div>
          <p className="text-sm text-stone-600">
            {generic ? t("reviewGeneric") : t("reviewHawaii")}
          </p>
          {contract.reviewRequestedAt && (
            <p className="mt-1 inline-block rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-semibold text-violet-800">
              ✓ {t("reviewRequestedNote", {
                date: contract.reviewRequestedAt.toLocaleDateString(locale, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                }),
              })}
            </p>
          )}
        </div>
        <PrintButton />
      </div>
      <ContractDocument
        contract={{
          ...contract,
          closingDate: contract.closingDate?.toISOString() ?? null,
          reviewRequestedAt: contract.reviewRequestedAt?.toISOString() ?? null,
          updatedAt: contract.updatedAt.toISOString(),
        }}
        buyerName={user?.name ?? ""}
      />
    </div>
  );
}
