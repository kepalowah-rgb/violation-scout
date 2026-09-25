// Dashboard entry: loads the user's leads + contract drafts server-side and
// hands them to the client tab shell. Force-dynamic so subscription-gated
// data is never cached across users.

import { auth } from "@/auth";
import { db } from "@/lib/db";
import DashboardClient from "@/components/DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const [properties, contracts] = await Promise.all([
    db.property.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        researchItems: { orderBy: { sortOrder: "asc" } },
        photos: { orderBy: { createdAt: "asc" } },
        conditionItems: true,
      },
    }),
    db.contractDraft.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: { property: { select: { id: true, address: true } } },
    }),
  ]);

  // Serialize dates for the client boundary.
  const serialized = {
    properties: properties.map((p) => ({
      ...p,
      followUpDate: p.followUpDate?.toISOString() ?? null,
      createdAt: p.createdAt.toISOString(),
      photos: p.photos.map((ph) => ({ ...ph, createdAt: ph.createdAt.toISOString() })),
      conditionItems: p.conditionItems.map((c) => ({
        id: c.id,
        itemKey: c.itemKey,
        status: c.status as "unchecked" | "good" | "fair" | "poor",
        notes: c.notes,
      })),
    })),
    contracts: contracts.map((c) => ({
      ...c,
      closingDate: c.closingDate?.toISOString() ?? null,
      reviewRequestedAt: c.reviewRequestedAt?.toISOString() ?? null,
      updatedAt: c.updatedAt.toISOString(),
    })),
  };

  return <DashboardClient initialProperties={serialized.properties} initialContracts={serialized.contracts} />;
}
