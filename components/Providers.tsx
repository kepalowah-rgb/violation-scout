"use client";

// Wraps the app in the Auth.js session provider so client components can
// call useSession(), signIn() and signOut() from "next-auth/react".

import { SessionProvider } from "next-auth/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
