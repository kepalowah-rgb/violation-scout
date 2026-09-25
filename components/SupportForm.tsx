"use client";

// Contact-support form. Posts to /api/support, which validates server-side
// and delivers via Resend. Client-side checks mirror the server rules so
// users get instant feedback; the server is the authority.
//
// Topic dropdown submits stable codes (SUPPORT_TOPICS); the display labels
// are translated. The server maps codes back to English labels for the
// support inbox email.

import { useState } from "react";
import { useTranslations } from "next-intl";
import { SUPPORT_TOPICS } from "@/config/support";

const inputCls =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600";

export default function SupportForm({ initialTopic }: { initialTopic?: string | null }) {
  const t = useTranslations("supportForm");
  const tp = useTranslations("support");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState<string>(
    initialTopic && (SUPPORT_TOPICS as readonly string[]).includes(initialTopic)
      ? initialTopic
      : SUPPORT_TOPICS[0]
  );
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  function validate(): string | null {
    if (name.trim().length < 2) return t("errorName");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return t("errorEmail");
    if (!(SUPPORT_TOPICS as readonly string[]).includes(topic)) return t("errorTopic");
    if (message.trim().length < 10) return t("errorMessageShort");
    if (message.length > 5000) return t("errorMessageLong");
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), topic, message: message.trim() }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? t("errorSend"));
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : t("errorSend"));
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-900">
        <p className="font-semibold">{t("sentTitle")}</p>
        <p className="mt-1">{t("sentBody", { promise: tp("responsePromise") })}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="support-name" className="mb-1 block text-sm font-medium text-stone-700">
            {t("name")}
          </label>
          <input
            id="support-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("namePlaceholder")}
            className={inputCls}
            maxLength={100}
            autoComplete="name"
          />
        </div>
        <div>
          <label htmlFor="support-email" className="mb-1 block text-sm font-medium text-stone-700">
            {t("email")}
          </label>
          <input
            id="support-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("emailPlaceholder")}
            className={inputCls}
            maxLength={254}
            autoComplete="email"
          />
        </div>
      </div>
      <div>
        <label htmlFor="support-topic" className="mb-1 block text-sm font-medium text-stone-700">
          {t("topic")}
        </label>
        <select
          id="support-topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className={inputCls}
        >
          {SUPPORT_TOPICS.map((code) => (
            <option key={code} value={code}>
              {t(`topics.${code}` as "topics.other")}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="support-message" className="mb-1 block text-sm font-medium text-stone-700">
          {t("message")}
        </label>
        <textarea
          id="support-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("messagePlaceholder")}
          rows={5}
          className={inputCls}
          maxLength={5000}
        />
        <p className="mt-1 text-xs text-stone-500">{t("note")}</p>
      </div>
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
      >
        {status === "sending" ? t("sending") : t("send")}
      </button>
    </form>
  );
}
