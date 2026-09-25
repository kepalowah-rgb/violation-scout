import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import AuthForm from "@/components/AuthForm";

export async function generateMetadata() {
  const t = await getTranslations("meta");
  return { title: t("signupTitle") };
}

export default function SignupPage() {
  return (
    <Suspense>
      <AuthForm mode="signup" />
    </Suspense>
  );
}
