import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import AuthForm from "@/components/AuthForm";

export async function generateMetadata() {
  const t = await getTranslations("meta");
  return { title: t("loginTitle") };
}

export default function LoginPage() {
  return (
    <Suspense>
      <AuthForm mode="login" />
    </Suspense>
  );
}
