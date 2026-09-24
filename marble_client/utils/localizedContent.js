import { FRONTEND_LABELS } from "@/utils/frontendLabels";

export const LANGUAGE_COOKIE = "marble_language";

export function normalizeLanguage(value) {
  return value === "ar" ? "ar" : "en";
}

export function getLocalizedValue(englishValue, arabicValue, language = "en", fallback = "") {
  const normalizedLanguage = normalizeLanguage(language);
  const primaryValue = normalizedLanguage === "ar" ? arabicValue : englishValue;
  const secondaryValue = normalizedLanguage === "ar" ? englishValue : arabicValue;

  return primaryValue || secondaryValue || fallback || "";
}

export function getLocalizedLabel(labelKey, language = "en", fallback = "") {
  const label = FRONTEND_LABELS[labelKey] || {};

  return getLocalizedValue(label.en, label.ar, language, fallback || labelKey);
}
