// /api/properties/[id]/conditions — upsert the remote condition report.
//
// PATCH body: { items: [{ itemKey, status, notes }] }
// itemKey must be one of the 8 stable keys (see CONDITION_ITEM_KEYS in
// lib/lead-types.ts); status one of unchecked | good | fair | poor.
// Each item is upserted on the (propertyId, itemKey) unique constraint.

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireOwnedProperty } from "@/lib/property-access";
import { CONDITION_ITEM_KEYS, type ConditionStatus } from "@/lib/lead-types";

type Params = { params: Promise<{ id: string }> };

const VALID_STATUSES: ConditionStatus[] = ["unchecked", "good", "fair", "poor"];

export async function PATCH(req: Request, { params }: Params) {
  const gate = await requireOwnedProperty((await params).id);
  if ("error" in gate) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }
  const { property } = gate;

  const body = await req.json();
  const items = Array.isArray(body.items) ? body.items : [];
  for (const item of items) {
    if (!(CONDITION_ITEM_KEYS as readonly string[]).includes(item.itemKey)) {
      return NextResponse.json({ error: `Invalid item: ${item.itemKey}` }, { status: 400 });
    }
    if (!VALID_STATUSES.includes(item.status)) {
      return NextResponse.json({ error: `Invalid status: ${item.status}` }, { status: 400 });
    }
  }

  await db.$transaction(
    items.map((item: { itemKey: string; status: string; notes?: unknown }) =>
      db.conditionItem.upsert({
        where: { propertyId_itemKey: { propertyId: property.id, itemKey: item.itemKey } },
        update: { status: item.status, notes: (item.notes ?? "").toString().trim().slice(0, 2000) || null },
        create: {
          propertyId: property.id,
          itemKey: item.itemKey,
          status: item.status,
          notes: (item.notes ?? "").toString().trim().slice(0, 2000) || null,
        },
      })
    )
  );

  const conditionItems = await db.conditionItem.findMany({ where: { propertyId: property.id } });
  return NextResponse.json({ conditionItems });
}
