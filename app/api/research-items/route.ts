// /api/research-items — add a custom checklist step to one of the user's
// properties. Ownership is verified through the property's userId.

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/api-auth";

export async function POST(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (!body.propertyId || !body.label) {
    return NextResponse.json({ error: "propertyId and label are required" }, { status: 400 });
  }

  const property = await db.property.findFirst({
    where: { id: body.propertyId, userId },
    include: { researchItems: true },
  });
  if (!property) return NextResponse.json({ error: "Property not found" }, { status: 404 });

  const item = await db.researchItem.create({
    data: {
      propertyId: property.id,
      label: body.label.toString().trim(),
      notes: body.notes?.toString() || null,
      sourceUrl: body.sourceUrl?.toString() || null,
      sortOrder: property.researchItems.length,
    },
  });
  return NextResponse.json({ item }, { status: 201 });
}
