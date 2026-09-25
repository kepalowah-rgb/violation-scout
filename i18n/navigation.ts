// Locale-aware navigation helpers (next-intl).
//
// Use THESE instead of next/navigation in components:
//   import { Link, redirect, usePathname, useRouter } from "@/i18n/navigation";
// They automatically prefix the active locale (e.g. /es/dashboard).
// API routes (/api/*) and external URLs are unaffected — keep using plain
// fetch() and <a> for those.

import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
