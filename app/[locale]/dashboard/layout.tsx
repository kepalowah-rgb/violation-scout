// Subscription gate for everything under /dashboard.
//
// The proxy (proxy.ts) already guarantees a session. This layout adds the
// billing check: only users whose Stripe subscription is "trialing" or
// "active" may enter. Everyone else is sent to /billing to start or fix
// their subscription.

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { hasActiveAccess } from "@/lib/subscription";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  const { locale } = await params;
  if (!session?.user?.id) redirect(`/${locale}/login`);

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user || !hasActiveAccess(user)) {
    redirect(`/${locale}/billing?needs_subscription=1`);
  }

  return <>{children}</>;
}
