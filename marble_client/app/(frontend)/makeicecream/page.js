import { getCustomIcecreamOptionsRoute, getProductByIdRoute } from "@/utils/apiRoutes";
import apiKeyMapping from "@/configs/apiKeyMapping";
import { cookies, headers } from "next/headers";
import MakeIceCream from "@/components/frontend/icecreams/MakeIceCream";
import { LANGUAGE_COOKIE, normalizeLanguage } from "@/utils/localizedContent";
import { buildPageMetadata } from "@/utils/pageSeo";

const CUSTOM_ICE_CREAM_BASE_PRODUCT_ID = 432;

export async function generateMetadata() {
  return buildPageMetadata("makeicecream", {
    title: "Custom Ice Cream | Marble Store",
    description: "Build a custom ice cream order at Marble Store",
  });
}

export default async function MakeIceCreamPage() {
  const [headersList, cookieStore] = await Promise.all([headers(), cookies()]);
  const currentDomain = headersList.get("host")?.split(":")[0] || "localhost";
  const apiKey = apiKeyMapping[currentDomain] || null;
  const language = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);

  let data = { buckets: [], flavors: [], mixins: [], sauces: [] };
  let baseProduct = null;

  try {
    const [optionsRes, productRes] = await Promise.all([
      fetch(getCustomIcecreamOptionsRoute, {
        headers: { "X-API-KEY": apiKey },
        cache: "no-store",
      }),
      fetch(getProductByIdRoute(CUSTOM_ICE_CREAM_BASE_PRODUCT_ID), {
        headers: { "X-API-KEY": apiKey },
        cache: "no-store",
      }),
    ]);

    if (optionsRes.ok) {
      const json = await optionsRes.json();
      data = json.data || data;
    }

    if (productRes.ok) {
      const json = await productRes.json();
      baseProduct = json.data || json;
    }
  } catch {
    // API unreachable
  }

  return (
    <MakeIceCream
      buckets={data.buckets}
      flavors={data.flavors}
      mixins={data.mixins}
      sauces={data.sauces}
      baseProduct={baseProduct}
      language={language}
    />
  );
}
