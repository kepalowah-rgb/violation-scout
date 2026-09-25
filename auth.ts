// Auth.js (NextAuth v5) configuration.
//
// Email magic-link auth via Resend: the user types their email, gets a sign-in
// link, and clicking it creates their account. No passwords to store or reset.
//
// The sign-in email is localized: the recipient's NEXT_LOCALE cookie (falling
// back to Accept-Language, then English) picks the subject/body from the
// `authEmail` message catalog. All other magic-link settings stay default.
//
// Required env vars:
//   AUTH_SECRET      — random 32+ char string (`npx auth secret` generates one)
//   AUTH_RESEND_KEY  — Resend API key (https://resend.com/api-keys)
//   EMAIL_FROM       — verified sender, e.g. "Acme <noreply@yourdomain.com>"
//   AUTH_URL         — set in production, e.g. https://app.yourdomain.com

import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Resend from "next-auth/providers/resend";
import { db } from "./lib/db";
import enMessages from "./messages/en.json";
import esMessages from "./messages/es.json";
import tlMessages from "./messages/tl.json";

const PRODUCT_NAME = "Violation Scout";
const AUTH_EMAIL_LOCALES = ["en", "es", "tl"] as const;

type AuthEmailMessages = { [k: string]: string };

function authEmailMessagesFor(locale: string): AuthEmailMessages {
  const catalogs: Record<string, { authEmail: AuthEmailMessages }> = {
    en: enMessages as { authEmail: AuthEmailMessages },
    es: esMessages as { authEmail: AuthEmailMessages },
    tl: tlMessages as { authEmail: AuthEmailMessages },
  };
  return (catalogs[locale] ?? catalogs.en).authEmail;
}

/** Resolve the email locale from the sign-in request: NEXT_LOCALE cookie, then Accept-Language. */
function emailLocaleFromRequest(request: Request): string {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookieLocale = /(?:^|;\s*)NEXT_LOCALE=([a-zA-Z-]+)/.exec(cookieHeader)?.[1]?.toLowerCase();
  if (cookieLocale && (AUTH_EMAIL_LOCALES as readonly string[]).includes(cookieLocale)) {
    return cookieLocale;
  }
  const acceptLanguage = request.headers.get("accept-language") ?? "";
  for (const part of acceptLanguage.split(",")) {
    const lang = part.split(";")[0].trim().toLowerCase();
    if ((AUTH_EMAIL_LOCALES as readonly string[]).includes(lang)) return lang;
    const base = lang.split("-")[0];
    if ((AUTH_EMAIL_LOCALES as readonly string[]).includes(base)) return base;
  }
  return "en";
}

function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? `{${key}}`);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  // JWT sessions: the proxy + server components read the session without a
  // database round-trip. The Prisma adapter is still used for user/account rows.
  session: { strategy: "jwt" },
  providers: [
    Resend({
      from: process.env.EMAIL_FROM ?? "noreply@example.com",
      async sendVerificationRequest({ identifier, url, provider, request }) {
        const locale = emailLocaleFromRequest(request);
        const m = authEmailMessagesFor(locale);
        const values = { product: PRODUCT_NAME };
        const subject = fill(m.subject, values);

        const html = `
<body style="font-family: system-ui, -apple-system, sans-serif; color: #1f2937; padding: 24px;">
  <h2>${PRODUCT_NAME}</h2>
  <p>${m.greeting}</p>
  <p>${fill(m.body, values)}</p>
  <p><a href="${url}" style="display: inline-block; background: #16a34a; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">${fill(m.cta, values)}</a></p>
  <p style="font-size: 14px; color: #6b7280;">${m.fallback}<br/><a href="${url}">${url}</a></p>
  <p style="font-size: 12px; color: #9ca3af;">${m.footer}</p>
</body>`.trim();

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${provider.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: provider.from,
            to: identifier,
            subject,
            html,
            text: `${m.greeting}\n\n${fill(m.body, values)}\n\n${url}\n\n${m.footer}`,
          }),
        });
        if (!res.ok) {
          throw new Error(`Resend API error: ${res.status} ${await res.text()}`);
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/login?verify=1",
  },
});
