// /api/properties/[id] — read, update and delete a single lead.
// Every operation re-checks ownership via userId so users can never touch
// each other's data. (Next 16: route params are async.)

import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/api-auth";
import { blobEnabled } from "@/lib/property-access";

type Params = { params: Promise<{ id: string }> };

async function ownedProperty(userId: string, id: string) {
  return db.property.findFirst({
    where: { id, userId },
    include: {
      researchItems: { orderBy: { sortOrder: "asc" } },
      photos: { orderBy: { createdAt: "asc" } },
      conditionItems: true,
    },
  });
}

export async function GET(_req: Request, { params }: Params) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const property = await ownedProperty(userId, (await params).id);
  if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ property });
}

export async function PATCH(req: Request, { params }: Params) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = (await params).id;
  if (!(await ownedProperty(userId, id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};
  for (const key of [
    "address", "city", "zip", "tmk", "distressNotes",
    "suspectedViolations", "ownerName", "status", "priority",
  ]) {
    if (key in body) data[key] = body[key]?.toString().trim() || null;
  }
  if ("lat" in body) data.lat = typeof body.lat === "number" ? body.lat : null;
  if ("lng" in body) data.lng = typeof body.lng === "number" ? body.lng : null;
  if ("followUpDate" in body) {
    data.followUpDate = body.followUpDate ? new Date(body.followUpDate) : null;
  }
  if ("virtualTourUrl" in body) {
    const url = body.virtualTourUrl?.toString().trim() || "";
    if (url && !/^https?:\/\/.+\..+/.test(url)) {
      return NextResponse.json({ error: "Invalid virtual tour URL" }, { status: 400 });
    }
    data.virtualTourUrl = url || null;
  }

  const property = await db.property.update({ where: { id }, data });
  return NextResponse.json({ property });
}

export async function DELETE(_req: Request, { params }: Params) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = (await params).id;
  const property = await ownedProperty(userId, id);
  if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Best effort: delete the property's Blob objects so storage doesn't leak
  // (the DB rows cascade). Failures are logged; the DB delete still runs.
  if (blobEnabled()) {
    for (const photo of property.photos) {
      try {
        await del(photo.url);
      } catch (err) {
        console.error("Blob delete failed for photo", photo.id, err);
      }
    }
  }

  await db.property.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
