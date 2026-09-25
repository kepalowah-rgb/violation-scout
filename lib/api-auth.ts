// Small helper for API routes: returns the logged-in user's id or null.

import { auth } from "@/auth";

export async function requireUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}
