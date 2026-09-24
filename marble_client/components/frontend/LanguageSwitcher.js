"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { getLocalizedLabel, LANGUAGE_COOKIE } from "@/utils/localizedContent";

export default function LanguageSwitcher({ language = "en", className = "" }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const t = (labelKey, fallback) => getLocalizedLabel(labelKey, language, fallback);

  const switchLanguage = () => {
    const nextLanguage = language === "ar" ? "en" : "ar";

    document.cookie = `${LANGUAGE_COOKIE}=${nextLanguage}; path=/; max-age=31536000; samesite=lax`;
    startTransition(() => {
      router.refresh();
    });
  };

  const alternativeLabel = language === "ar" ? "EN" : "AR";

  return (
    <button
      type="button"
      className={`language-switcher-toggle border-0 bg-transparent text-white ${className}`}
      aria-label={`${t("lblSwitchLanguageTo")} ${alternativeLabel}`}
      onClick={switchLanguage}
      disabled={isPending}
    >
      {alternativeLabel}
    </button>
  );
}
