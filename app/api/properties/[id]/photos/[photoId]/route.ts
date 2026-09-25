// /api/properties/[id]/photos/[photoId] — update a photo's caption or
// delete the photo (removes the Blob object too, so storage doesn't leak).

import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { db } from "@/lib/db";
import { blobEnabled, requireOwnedProperty } from "@/lib/property-access";

type Params = { params: Promise<{ id: string; photoId: string }> };

async function ownedPhoto(userId: string, propertyId: string, photoId: string) {
  return db.propertyPhoto.findFirst({
    where: { id: photoId, property: { id: propertyId, userId } },
  });
}

export async function PATCH(req: Request, { params }: Params) {
  const { id, photoId } = await params;
  const gate = await requireOwnedProperty(id);
  if ("error" in gate) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }
  const photo = await ownedPhoto(gate.userId, id, photoId);
  if (!photo) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const caption = (body.caption ?? "").toString().trim().slice(0, 200) || null;
  const updated = await db.propertyPhoto.update({ where: { id: photoId }, data: { caption } });
  return NextResponse.json({ photo: { ...updated, createdAt: updated.createdAt.toISOString() } });
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id, photoId } = await params;
  const gate = await requireOwnedProperty(id);
  if ("error" in gate) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }
  const photo = await ownedPhoto(gate.userId, id, photoId);
  if (!photo) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Best effort: delete the Blob object; still remove the DB row even if
  // Blob deletion fails (the row is what the UI renders).
  if (blobEnabled()) {
    try {
      await del(photo.url);
    } catch {
      // fall through — the metadata row still goes away
    }
  }
  await db.propertyPhoto.delete({ where: { id: photoId } });
  return NextResponse.json({ ok: true });
}
