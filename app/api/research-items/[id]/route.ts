// /api/research-items/[id] — update a checklist step's status/notes, or delete
// a custom step. Ownership is verified via the parent property's userId.

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/api-auth";

type Params = { params: Promise<{ id: string }> };

async function ownedItem(userId: string, id: string) {
  return db.researchItem.findFirst({
    where: { id, property: { userId } },
  });
}

export async function PATCH(req: Request, { params }: Params) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = (await params).id;
  if (!(await ownedItem(userId, id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if ("status" in body && ["todo", "in_progress", "done"].includes(body.status)) {
    data.status = body.status;
  }
  if ("notes" in body) data.notes = body.notes?.toString() || null;
  if ("label" in body && body.label?.toString().trim()) {
    data.label = body.label.toString().trim();
  }

  const item = await db.researchItem.update({ where: { id }, data });
  return NextResponse.json({ item });
}

export async function DELETE(_req: Request, { params }: Params) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = (await params).id;
  if (!(await ownedItem(userId, id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await db.researchItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
