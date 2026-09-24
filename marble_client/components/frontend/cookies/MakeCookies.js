import { getCustomCookieOptionsRoute, getProductByIdRoute } from "@/utils/apiRoutes";
import apiKeyMapping from "@/configs/apiKeyMapping";
import { cookies, headers } from "next/headers";
import MakeCookiesClient from "./MakeCookiesClient";
import { LANGUAGE_COOKIE, normalizeLanguage } from "@/utils/localizedContent";

const COOKIES_BASE_PRODUCT_ID = 433;

export default async function MakeCookies() {
  const [headersList, cookieStore] = await Promise.all([headers(), cookies()]);
  const currentDomain = headersList.get("host")?.split(":")[0] || "localhost";
  const apiKey = apiKeyMapping[currentDomain] || null;
  const language = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);

  let cookieTypes = [];
  let baseProduct = null;

  try {
    const [optionsRes, productRes] = await Promise.all([
      fetch(getCustomCookieOptionsRoute, {
        headers: { "X-API-KEY": apiKey },
        cache: "no-store",
      }),
      fetch(getProductByIdRoute(COOKIES_BASE_PRODUCT_ID), {
        headers: { "X-API-KEY": apiKey },
        cache: "no-store",
      }),
    ]);

    if (optionsRes.ok) {
      const json = await optionsRes.json();
      cookieTypes = json.data || [];
    }

    if (productRes.ok) {
      const json = await productRes.json();
      baseProduct = json.data || json;
    }
  } catch {
    // API unreachable
  }

  return <MakeCookiesClient cookieTypes={cookieTypes} baseProduct={baseProduct} language={language} />;
}
