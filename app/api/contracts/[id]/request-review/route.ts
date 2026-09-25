// /api/contracts/[id]/request-review — send a contract draft to the
// configured attorney for review.
//
// What this is: an introduction. The email tells the attorney the subscriber
// is requesting their legal services; no attorney-client relationship exists
// until the attorney accepts the engagement. The attorney bills the
// subscriber directly — the app takes no referral fee (Hawaiʻi ethics rules
// forbid lawyers from paying non-lawyers for referrals).
//
// POST body (optional): { "resend": true, "locale": "en" }
//   - Without "resend", a second request for the same draft returns 409.
//   - With "resend": true the attorney is emailed again (the UI confirms
//     this with the user first) and reviewRequestedAt is refreshed.
//   - "locale" selects the language of the printable-draft link path.

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/api-auth";
import { ATTORNEY, isAttorneyConfigured } from "@/config/attorney";
import { PRICING } from "@/config/pricing";

type Params = { params: Promise<{ id: string }> };

const LOCALES = ["en", "es", "tl"] as const;

function usd(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export async function POST(req: Request, { params }: Params) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = (await params).id;
  const contract = await db.contractDraft.findFirst({ where: { id, userId } });
  if (!contract) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: { resend?: boolean; locale?: string } = {};
  try {
    body = await req.json();
  } catch {
    // no body is fine — defaults apply
  }

  if (contract.reviewRequestedAt && body.resend !== true) {
    return NextResponse.json(
      { error: "Review already requested for this draft.", alreadyRequested: true },
      { status: 409 }
    );
  }

  if (!isAttorneyConfigured()) {
    return NextResponse.json(
      { error: "Attorney review isn't configured yet. Please try again later." },
      { status: 503 }
    );
  }

  const resendKey = process.env.AUTH_RESEND_KEY;
  const from = process.env.EMAIL_FROM;
  if (!resendKey || !from) {
    console.error("[request-review] missing AUTH_RESEND_KEY or EMAIL_FROM");
    return NextResponse.json(
      { error: "Email isn't configured yet. Please try again later." },
      { status: 503 }
    );
  }

  const user = await db.user.findUnique({ where: { id: userId } });
  const locale = LOCALES.includes(body.locale as (typeof LOCALES)[number])
    ? body.locale!
    : "en";
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL ?? "").replace(/\/$/, "");
  const printLink = appUrl
    ? `${appUrl}/${locale}/dashboard/contracts/${contract.id}/print`
    : `(print view not available — ask the subscriber for their draft)`;

  const dealLines = [
    `Property address: ${contract.propertyAddress}`,
    contract.tmk ? `TMK: ${contract.tmk}` : null,
    `Seller: ${contract.sellerName}`,
    `Purchase price: ${usd(contract.purchasePrice)}`,
    `Earnest money: ${usd(contract.earnestMoney)}`,
    contract.assignmentFee ? `Disclosed assignment fee: ${usd(contract.assignmentFee)}` : null,
    contract.closingDate
      ? `Target closing: ${contract.closingDate.toISOString().slice(0, 10)}`
      : null,
    `Inspection period: ${contract.inspectionDays} days`,
    `Template: ${contract.template === "generic" ? "Generic (state-neutral)" : "Hawaiʻi"}`,
  ]
    .filter(Boolean)
    .join("\n");

  const subject = `[${PRICING.productName}] Contract review requested — ${contract.propertyAddress}`;
  const text = [
    `A ${PRICING.productName} subscriber is requesting your legal services to review a wholesale assignment contract draft.`,
    ``,
    `IMPORTANT: This message is a request for engagement only. No attorney-client relationship exists between you and the subscriber until you accept the engagement under your own terms. Please bill the subscriber directly for your review.`,
    ``,
    `--- Subscriber ---`,
    `Name:  ${user?.name ?? "(not provided)"}`,
    `Email: ${user?.email ?? "(unknown)"}`,
    ``,
    `--- Draft details ---`,
    dealLines,
    ``,
    `Printable draft (requires the subscriber's sign-in; ask them to share it if you can't open it):`,
    printLink,
    ``,
    `---`,
    `Sent by ${PRICING.productName} on behalf of the subscriber above.`,
  ].join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [ATTORNEY.reviewEmail],
      reply_to: user?.email ?? undefined,
      subject,
      text,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("[request-review] Resend error:", res.status, detail.slice(0, 500));
    return NextResponse.json(
      { error: "We couldn't send the request right now. Please try again in a few minutes." },
      { status: 502 }
    );
  }

  const updated = await db.contractDraft.update({
    where: { id },
    data: { reviewRequestedAt: new Date() },
  });

  return NextResponse.json({
    contract: {
      ...updated,
      closingDate: updated.closingDate?.toISOString() ?? null,
      reviewRequestedAt: updated.reviewRequestedAt?.toISOString() ?? null,
      updatedAt: updated.updatedAt.toISOString(),
    },
  });
}
