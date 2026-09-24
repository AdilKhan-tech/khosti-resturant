import { getPageSeoBySlugRoute } from "@/utils/apiRoutes";
import apiKeyMapping from "@/configs/apiKeyMapping";
import { cookies, headers } from "next/headers";
import { LANGUAGE_COOKIE, normalizeLanguage } from "@/utils/localizedContent";

/**
 * Fetch admin-managed SEO for a storefront page slug (HRM-style).
 * Returns null when API is down or slug is unknown — callers supply fallbacks.
 */
export async function fetchPageSeo(slug) {
  if (!slug) return null;
  try {
    const headersList = await headers();
    const currentDomain = headersList.get("host")?.split(":")[0] || "localhost";
    const apiKey = apiKeyMapping[currentDomain] || null;
    const res = await fetch(getPageSeoBySlugRoute(slug), {
      headers: { "X-API-KEY": apiKey },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

/**
 * Build Next.js Metadata from page_seo + language cookie.
 *
 * @param {string} slug - page_seo.slug (home, about, cakes, …)
 * @param {{ title?: string, description?: string, keywords?: string }} [fallback]
 */
export async function buildPageMetadata(slug, fallback = {}) {
  const [seo, cookieStore] = await Promise.all([
    fetchPageSeo(slug),
    cookies(),
  ]);
  const language = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);
  const isAr = language === "ar";

  const title =
    (isAr
      ? seo?.meta_title_ar || seo?.meta_title
      : seo?.meta_title || seo?.meta_title_ar) ||
    fallback.title ||
    "Marble Store";

  const description =
    (isAr
      ? seo?.meta_description_ar || seo?.meta_description
      : seo?.meta_description || seo?.meta_description_ar) ||
    fallback.description ||
    undefined;

  const keywords =
    (isAr
      ? seo?.meta_keyword_ar || seo?.meta_keyword
      : seo?.meta_keyword || seo?.meta_keyword_ar) ||
    fallback.keywords ||
    undefined;

  const metadata = { title };
  if (description) metadata.description = description;
  if (keywords) metadata.keywords = keywords;
  return metadata;
}
