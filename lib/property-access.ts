// Shared guard for property-scoped remote-evaluation APIs (photos,
// conditions). Enforces, in order: session, active subscription/trial, and
// that the property belongs to the caller — so users can never touch each
// other's photos or condition reports.

import { db } from "@/lib/db";
import { requireUserId } from "@/lib/api-auth";
import { hasActiveAccess } from "@/lib/subscription";

export const MAX_PHOTOS_PER_PROPERTY = 12;
export const MAX_PHOTO_BYTES = 8 * 1024 * 1024; // 8 MB per file

export async function requireOwnedProperty(propertyId: string) {
  const userId = await requireUserId();
  if (!userId) return { error: "Unauthorized" as const, status: 401 as const };

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || !hasActiveAccess(user)) {
    return { error: "Subscription required" as const, status: 403 as const };
  }

  const property = await db.property.findFirst({
    where: { id: propertyId, userId },
    include: { _count: { select: { photos: true } } },
  });
  if (!property) return { error: "Not found" as const, status: 404 as const };

  return { userId, property };
}

/** True when photo uploads can work (Vercel Blob token configured). */
export function blobEnabled(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}
