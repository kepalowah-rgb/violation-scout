// /api/settings — read and update the logged-in user's region settings.
// The research checklist for newly added leads deep-links the user's
// configured official lookups ("hawaii" preset or their custom URLs).

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/api-auth";

const REGION_IDS = ["hawaii", "custom"] as const;

function validUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const v = value.trim();
  if (v.length === 0 || v.length > 500) return false;
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function cleanLabel(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim().slice(0, 120);
  return v.length ? v : null;
}

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 401 });
  return NextResponse.json({ settings: user });
}

export async function PATCH(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data: {
    region?: string;
    customAssessorLabel?: string | null;
    customAssessorUrl?: string | null;
    customViolationLabel?: string | null;
    customViolationUrl?: string | null;
  } = {};

  if ("region" in body) {
    if (!REGION_IDS.includes(body.region)) {
      return NextResponse.json({ error: 'region must be "hawaii" or "custom"' }, { status: 400 });
    }
    data.region = body.region;
  }

  for (const key of ["customAssessorUrl", "customViolationUrl"] as const) {
    if (key in body) {
      const raw = body[key];
      if (raw === "" || raw == null) {
        data[key] = null;
      } else if (!validUrl(raw)) {
        return NextResponse.json(
          { error: `${key} must be a valid http(s) URL` },
          { status: 400 }
        );
      } else {
        data[key] = (raw as string).trim();
      }
    }
  }

  for (const key of ["customAssessorLabel", "customViolationLabel"] as const) {
    if (key in body) data[key] = cleanLabel(body[key]);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const user = await db.user.update({ where: { id: userId }, data });
  return NextResponse.json({
    settings: {
      region: user.region,
      customAssessorLabel: user.customAssessorLabel,
      customAssessorUrl: user.customAssessorUrl,
      customViolationLabel: user.customViolationLabel,
      customViolationUrl: user.customViolationUrl,
    },
  });
}
