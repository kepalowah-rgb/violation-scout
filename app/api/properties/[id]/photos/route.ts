// /api/properties/[id]/photos — upload one or more photos for a property.
//
// Accepts multipart/form-data with a "photos" field (multiple files).
// Validates, in order:
//   1. session + active subscription/trial (requireOwnedProperty)
//   2. Blob storage configured (BLOB_READ_WRITE_TOKEN) — 503 otherwise
//   3. each file is an image (MIME starts with image/)
//   4. each file ≤ 8 MB
//   5. the property would not exceed ~12 photos total
// Uploads go to Vercel Blob (public); only metadata is stored in Postgres.

import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { db } from "@/lib/db";
import {
  blobEnabled,
  requireOwnedProperty,
  MAX_PHOTOS_PER_PROPERTY,
  MAX_PHOTO_BYTES,
} from "@/lib/property-access";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  const gate = await requireOwnedProperty((await params).id);
  if ("error" in gate) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }
  const { property } = gate;

  if (!blobEnabled()) {
    return NextResponse.json({ error: "blob_unavailable" }, { status: 503 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }
  const files = form.getAll("photos").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: "No photos provided" }, { status: 400 });
  }

  const existing = property._count.photos;
  if (existing + files.length > MAX_PHOTOS_PER_PROPERTY) {
    return NextResponse.json({ error: "photo_limit" }, { status: 400 });
  }

  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "photo_type" }, { status: 400 });
    }
    if (file.size > MAX_PHOTO_BYTES) {
      return NextResponse.json({ error: "photo_size" }, { status: 400 });
    }
  }

  const safeName = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").slice(-80) || "photo";
  const created = [];
  for (const file of files) {
    const key = `properties/${property.id}/${Date.now()}-${safeName(file.name)}`;
    const blob = await put(key, file, { access: "public" });
    const photo = await db.propertyPhoto.create({
      data: {
        propertyId: property.id,
        url: blob.url,
        mimeType: file.type,
        sizeBytes: file.size,
      },
    });
    created.push({ ...photo, createdAt: photo.createdAt.toISOString() });
  }

  return NextResponse.json({ photos: created });
}
