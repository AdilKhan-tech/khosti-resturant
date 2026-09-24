import { getCitiesRoute, getCustomCakeOptionsRoute, getProductByIdRoute } from "@/utils/apiRoutes";
import apiKeyMapping from "@/configs/apiKeyMapping";
import { cookies, headers } from "next/headers";
import MakeCake from "@/components/frontend/cakes/makeCake";
import { LANGUAGE_COOKIE, normalizeLanguage } from "@/utils/localizedContent";
import { buildPageMetadata } from "@/utils/pageSeo";

const CUSTOM_CAKE_BASE_PRODUCT_ID = 38;

export async function generateMetadata() {
  return buildPageMetadata("makecake", {
    title: "Custom Cake Builder | Marble Store",
    description: "Design a custom cake at Marble Store",
  });
}

function flattenCityBranches(cities = []) {
  return cities.flatMap((city) =>
    (city.branches || []).map((branch) => ({
      ...branch,
      city: branch.city || city.name_en || city.name || "",
      city_id: branch.city_id || city.id,
      name_en: branch.name_en || branch.name || "",
      name_ar: branch.name_ar || branch.name || "",
    })),
  );
}

export default async function MakeCakePage() {
  const [headersList, cookieStore] = await Promise.all([headers(), cookies()]);
  const currentDomain = headersList.get("host")?.split(":")[0] || "localhost";
  const apiKey = apiKeyMapping[currentDomain] || null;
  const language = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);

  let cakeTypes = [];
  let branches = [];
  let baseProduct = null;

  try {
    const [optionsRes, citiesRes, productRes] = await Promise.all([
      fetch(getCustomCakeOptionsRoute, {
        headers: { "X-API-KEY": apiKey },
        cache: "no-store",
      }),
      fetch(
        `${getCitiesRoute}?lang=${encodeURIComponent(language)}&product_id=${CUSTOM_CAKE_BASE_PRODUCT_ID}`,
        {
          headers: { "X-API-KEY": apiKey },
          cache: "no-store",
        },
      ),
      fetch(getProductByIdRoute(CUSTOM_CAKE_BASE_PRODUCT_ID), {
        headers: { "X-API-KEY": apiKey },
        cache: "no-store",
      }),
    ]);

    if (optionsRes.ok) {
      const json = await optionsRes.json();
      cakeTypes = json.data || [];
    }
    if (citiesRes.ok) {
      const json = await citiesRes.json();
      branches = flattenCityBranches(json.cities || []);
    }
    if (productRes.ok) {
      const json = await productRes.json();
      baseProduct = json.data || json;
      if (!branches.length && Array.isArray(baseProduct?.branches)) {
        branches = baseProduct.branches;
      }
    }
  } catch {
    // API unreachable
  }

  return <MakeCake cakeTypes={cakeTypes} branches={branches} baseProduct={baseProduct} language={language} />;
}
