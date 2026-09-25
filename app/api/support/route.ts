// Contact-support API: validates the form server-side and delivers it to
// the support inbox via the Resend REST API (no extra dependency — the app
// already holds AUTH_RESEND_KEY / EMAIL_FROM for magic-link auth).
//
// Validation rules (mirrored client-side in SupportForm):
//   name    — 2–100 chars
//   email   — valid format, ≤ 254 chars
//   topic   — must be one of SUPPORT_TOPICS
//   message — 10–5000 chars

import { NextResponse } from "next/server";
import { SUPPORT, SUPPORT_TOPICS, SUPPORT_TOPIC_LABELS } from "@/config/support";
import { PRICING } from "@/config/pricing";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { name, email, topic, message } = (body ?? {}) as Record<string, unknown>;

  if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (typeof email !== "string" || email.trim().length > 254 || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (typeof topic !== "string" || !(SUPPORT_TOPICS as readonly string[]).includes(topic)) {
    return NextResponse.json({ error: "Please choose a valid topic." }, { status: 400 });
  }
  if (typeof message !== "string" || message.trim().length < 10 || message.length > 5000) {
    return NextResponse.json({ error: "Please describe the issue (10–5,000 characters)." }, { status: 400 });
  }

  const resendKey = process.env.AUTH_RESEND_KEY;
  const from = process.env.EMAIL_FROM;
  if (!resendKey || !from) {
    // Misconfiguration on our side — don't leak internals, but don't silently drop.
    console.error("[support] missing AUTH_RESEND_KEY or EMAIL_FROM");
    return NextResponse.json(
      { error: "Support email isn't configured yet. Please try again later." },
      { status: 503 }
    );
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim();
  const cleanMessage = message.trim();

  const subject = `[${PRICING.productName} Support] ${SUPPORT_TOPIC_LABELS[topic] ?? topic} — ${cleanName}`;
  const text = [
    `New support request from the ${PRICING.productName} help center.`,
    ``,
    `Name:    ${cleanName}`,
    `Email:   ${cleanEmail}`,
    `Topic:   ${topic}`,
    ``,
    `Message:`,
    cleanMessage,
  ].join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [SUPPORT.supportEmail],
      reply_to: cleanEmail,
      subject,
      text,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("[support] Resend error:", res.status, detail.slice(0, 500));
    return NextResponse.json(
      { error: "We couldn't send your message right now. Please try again in a few minutes." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
