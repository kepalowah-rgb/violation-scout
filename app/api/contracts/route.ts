// /api/contracts — list and create wholesale assignment contract drafts.
// Drafts are templates the user fills in and prints; they are NOT legal
// advice and must be reviewed by an attorney before use. The "template"
// field selects the Hawaiʻi or generic (other states) legal template.

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/api-auth";

export const CONTRACT_TEMPLATE_IDS = ["hawaii", "generic"] as const;

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contracts = await db.contractDraft.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: { property: { select: { id: true, address: true } } },
  });
  return NextResponse.json({ contracts });
}

export async function POST(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (!body.sellerName || !body.propertyAddress || body.purchasePrice == null) {
    return NextResponse.json(
      { error: "sellerName, propertyAddress and purchasePrice are required" },
      { status: 400 }
    );
  }

  // If linked to a property, verify the user owns it.
  let propertyId: string | null = null;
  if (body.propertyId) {
    const property = await db.property.findFirst({
      where: { id: body.propertyId, userId },
    });
    if (!property) return NextResponse.json({ error: "Property not found" }, { status: 404 });
    propertyId = property.id;
  }

  const contract = await db.contractDraft.create({
    data: {
      userId,
      propertyId,
      sellerName: body.sellerName.toString().trim(),
      propertyAddress: body.propertyAddress.toString().trim(),
      tmk: body.tmk?.toString().trim() || null,
      purchasePrice: Number(body.purchasePrice),
      earnestMoney: Number(body.earnestMoney ?? 0),
      assignmentFee: Number(body.assignmentFee ?? 0),
      closingDate: body.closingDate ? new Date(body.closingDate) : null,
      inspectionDays: Number(body.inspectionDays ?? 10),
      additionalTerms: body.additionalTerms?.toString() || null,
      template: (CONTRACT_TEMPLATE_IDS as readonly string[]).includes(body.template)
        ? body.template
        : "hawaii",
    },
  });
  return NextResponse.json({ contract }, { status: 201 });
}
