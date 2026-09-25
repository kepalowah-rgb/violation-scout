// Next.js 16 "proxy" (the renamed middleware convention).
//
// Two jobs, in order:
//   1. next-intl locale routing: /dashboard -> /en/dashboard (or the locale
//      from the NEXT_LOCALE cookie / Accept-Language header).
//   2. Auth.js session gating: /{locale}/dashboard/* and /{locale}/billing/*
//      require a session; everyone else is sent to /{locale}/login.
//      The subscription check still lives in app/[locale]/dashboard/layout.tsx.

import { auth } from "./auth";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const PROTECTED_PREFIXES = ["/dashboard", "/billing"];

export default auth((req) => {
  // 1. Locale handling — may return a locale-prefix redirect.
  //
  // NOTE: next-intl's middleware returns a response even when the request is
  // merely *continuing* (a NextResponse.next() or rewrite). Only a redirect
  // carries a `location` header, so we return early ONLY for redirects;
  // otherwise we fall through to the session gate below. Returning on every
  // intl response would silently disable auth protection.
  const intlResponse = intlMiddleware(req);
  if (intlResponse?.headers.get("location")) return intlResponse;

  // 2. Session gate on the locale-stripped path.
  const { pathname } = req.nextUrl;
  const segments = pathname.split("/");
  const maybeLocale = segments[1] ?? "";
  const hasLocale = (routing.locales as readonly string[]).includes(maybeLocale);
  const stripped = hasLocale ? `/${segments.slice(2).join("/")}` : pathname;

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => stripped === p || stripped.startsWith(`${p}/`)
  );
  if (isProtected && !req.auth) {
    const locale = hasLocale ? maybeLocale : routing.defaultLocale;
    const loginUrl = new URL(`/${locale}/login`, req.nextUrl);
    loginUrl.searchParams.set("next", pathname);
    return Response.redirect(loginUrl);
  }
});

export const config = {
  // next-intl convention: run on everything except API routes, Next.js
  // internals, and static files. API routes stay unprefixed.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
