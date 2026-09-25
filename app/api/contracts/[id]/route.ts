// /api/contracts/[id] — read, update, delete a single contract draft.
// Ownership is re-checked on every operation.

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/api-auth";

type Params = { params: Promise<{ id: string }> };

async function ownedContract(userId: string, id: string) {
  return db.contractDraft.findFirst({
    where: { id, userId },
    include: { property: { select: { id: true, address: true } } },
  });
}

export async function GET(_req: Request, { params }: Params) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const contract = await ownedContract(userId, (await params).id);
  if (!contract) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ contract });
}

export async function PATCH(req: Request, { params }: Params) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = (await params).id;
  if (!(await ownedContract(userId, id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};
  for (const key of ["sellerName", "propertyAddress", "tmk", "additionalTerms"]) {
    if (key in body) data[key] = body[key]?.toString().trim() || null;
  }
  for (const key of ["purchasePrice", "earnestMoney", "assignmentFee", "inspectionDays"]) {
    if (key in body && body[key] !== "" && body[key] != null) data[key] = Number(body[key]);
  }
  if ("closingDate" in body) {
    data.closingDate = body.closingDate ? new Date(body.closingDate) : null;
  }
  if ("template" in body) {
    data.template = ["hawaii", "generic"].includes(body.template) ? body.template : "hawaii";
  }

  const contract = await db.contractDraft.update({ where: { id }, data });
  return NextResponse.json({ contract });
}

export async function DELETE(_req: Request, { params }: Params) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = (await params).id;
  if (!(await ownedContract(userId, id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await db.contractDraft.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
