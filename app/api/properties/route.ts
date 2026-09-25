// /api/properties — list and create property leads for the logged-in user.
// All queries are scoped by userId (multi-tenancy). Creating a property also
// seeds its default research checklist from config/research.ts.

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/api-auth";
import { resolveRegion } from "@/config/research";
import { buildLocalizedResearchSteps, getRequestLocaleFromCookies } from "@/lib/research-i18n";

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const properties = await db.property.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      researchItems: { orderBy: { sortOrder: "asc" } },
      photos: { orderBy: { createdAt: "asc" } },
      conditionItems: true,
      _count: { select: { contracts: true } },
    },
  });
  return NextResponse.json({ properties });
}

export async function POST(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (!body.address || typeof body.address !== "string") {
    return NextResponse.json({ error: "Address is required" }, { status: 400 });
  }
  const tourUrl = (body.virtualTourUrl ?? "").toString().trim();
  if (tourUrl && !/^https?:\/\/.+\..+/.test(tourUrl)) {
    return NextResponse.json({ error: "Invalid virtual tour URL" }, { status: 400 });
  }

  // Build the default checklist from the user's configured region
  // ("hawaii" preset or their custom county lookup URLs).
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      region: true,
      customAssessorLabel: true,
      customAssessorUrl: true,
      customViolationLabel: true,
      customViolationUrl: true,
    },
  });
  const researchSteps = await buildLocalizedResearchSteps(
    resolveRegion({
      region: user?.region ?? "hawaii",
      customAssessorLabel: user?.customAssessorLabel ?? null,
      customAssessorUrl: user?.customAssessorUrl ?? null,
      customViolationLabel: user?.customViolationLabel ?? null,
      customViolationUrl: user?.customViolationUrl ?? null,
    }),
    await getRequestLocaleFromCookies()
  );

  const property = await db.property.create({
    data: {
      userId,
      address: body.address.trim(),
      city: (body.city ?? "Nanakuli").toString().trim() || "Nanakuli",
      zip: body.zip?.toString().trim() || null,
      tmk: body.tmk?.toString().trim() || null,
      lat: typeof body.lat === "number" ? body.lat : null,
      lng: typeof body.lng === "number" ? body.lng : null,
      distressNotes: body.distressNotes?.toString() || null,
      suspectedViolations: body.suspectedViolations?.toString() || null,
      status: body.status?.toString() || "new",
      priority: body.priority?.toString() || "medium",
      followUpDate: body.followUpDate ? new Date(body.followUpDate) : null,
      virtualTourUrl: tourUrl || null,
      researchItems: {
        create: researchSteps.map((step, i) => ({
          label: step.label,
          notes: step.hint,
          sourceUrl: step.url ?? null,
          sortOrder: i,
        })),
      },
    },
    include: { researchItems: { orderBy: { sortOrder: "asc" } } },
  });

  return NextResponse.json({ property }, { status: 201 });
}
