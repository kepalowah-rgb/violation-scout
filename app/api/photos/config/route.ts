// Small public config endpoint so the client can render the photo
// section's "uploads unavailable" state without attempting an upload first.

import { NextResponse } from "next/server";
import { blobEnabled } from "@/lib/property-access";

export async function GET() {
  return NextResponse.json({ enabled: blobEnabled() });
}
