import { getBannerBySlugRoute } from "@/utils/apiRoutes";
import apiKeyMapping from "@/configs/apiKeyMapping";
import { cookies, headers } from "next/headers";
import MakeCookies from "@/components/frontend/cookies/MakeCookies";
import { getLocalizedLabel, LANGUAGE_COOKIE, normalizeLanguage } from "@/utils/localizedContent";
import { buildPageMetadata } from "@/utils/pageSeo";

const FALLBACK_BANNER_URL = "/assets/images/cooki-box.jpg";

export async function generateMetadata() {
  return buildPageMetadata("cookies", {
    title: "Cookies | Marble Store",
    description: "Order cookies from Marble Store",
  });
}

export default async function CookiesPage() {
  const [headersList, cookieStore] = await Promise.all([headers(), cookies()]);
  const currentDomain = headersList.get("host")?.split(":")[0] || "localhost";
  const apiKey = apiKeyMapping[currentDomain] || null;
  const language = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);
  const t = (labelKey, fallback) => getLocalizedLabel(labelKey, language, fallback);

  let bannerUrl = FALLBACK_BANNER_URL;

  try {
    const res = await fetch(getBannerBySlugRoute("cookie"), {
      headers: { "X-API-KEY": apiKey },
      cache: "no-store",
    });
    if (res.ok) {
      const json = await res.json();
      bannerUrl = language === "ar"
        ? (json.data?.banner_ar_url || json.data?.banner_en_url || FALLBACK_BANNER_URL)
        : (json.data?.banner_en_url || FALLBACK_BANNER_URL);
    }
  } catch {
    // API unreachable
  }

  return (
    <section className="customCookieSec">
      <div>
        <img src={bannerUrl} className="w-100" alt={t("lblCookiesBannerAlt")} />
      </div>
      <MakeCookies />
    </section>
  );
}
