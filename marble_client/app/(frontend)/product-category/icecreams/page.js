import { Fragment } from "react";
import { getIceCreamPortionSizesRoute, getProductsRoute } from "@/utils/apiRoutes";
import MoreGift from "@/components/frontend/home/Moregift";
import { cookies, headers } from "next/headers";
import apiKeyMapping from "@/configs/apiKeyMapping";
import IceCreamsFilters from "@/components/frontend/icecreams/IceCreamsFilters";
import ProductCard from "@/components/frontend/ProductCard";
import { getLocalizedLabel, LANGUAGE_COOKIE, normalizeLanguage } from "@/utils/localizedContent";
import { buildPageMetadata } from "@/utils/pageSeo";

export async function generateMetadata() {
  return buildPageMetadata("icecreams", {
    title: "Ice Creams | Marble Store",
    description: "Browse ice cream from Marble Store",
  });
}

function queryValue(value) {
  return Array.isArray(value) ? value.join(",") : value || "";
}

function appendFilters(route, filters) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  const query = params.toString();
  if (!query) return route;

  return `${route}${route.includes("?") ? "&" : "?"}${query}`;
}

function CustomIceCreamCard({ language }) {
  const t = (labelKey, fallback) => getLocalizedLabel(labelKey, language, fallback);

  return (
    <ProductCard
      title={t("lblCustomizeIceCream")}
      meta={t("lblIceCreamCustomizationMeta")}
      href="/makeicecream"
      imageUrl="/assets/images/ice.svg"
      imageAlt={t("lblCustomizeIceCreamAlt")}
      buttonLabel={t("lblStartCustomIceCream")}
    />
  );
}

export default async function IceCreams({ searchParams }) {
  const params = await searchParams;
  const [headersList, cookieStore] = await Promise.all([headers(), cookies()]);
  const currentDomain = headersList.get("host")?.split(":")[0] || "localhost";
  const apiKey = apiKeyMapping[currentDomain] || null;
  const language = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);
  const t = (labelKey, fallback) => getLocalizedLabel(labelKey, language, fallback);
  const selected = {
    icecream_portion_size_ids: queryValue(params?.icecream_portion_size_ids),
  };

  let products = [];
  let portionSizes = [];

  try {
    const [productsRes, portionSizesRes] = await Promise.all([
      fetch(appendFilters(getProductsRoute, {
        category_slug: "ice-creams",
        limit: "500",
        icecream_portion_size_ids: selected.icecream_portion_size_ids,
      }), {
        headers: { "X-API-KEY": apiKey },
        cache: "no-store",
      }),
      fetch(`${getIceCreamPortionSizesRoute}?limit=100&sortOrder=ASC&status=Active&parent_id=null&has_products=1`, {
        headers: { "X-API-KEY": apiKey },
        cache: "no-store",
      }),
    ]);

    if (productsRes.ok) {
      const json = await productsRes.json();
      products = json.data || [];
    }

    if (portionSizesRes.ok) {
      const json = await portionSizesRes.json();
      portionSizes = json.data || [];
    }
  } catch {
    // API unreachable
  }

  return (
    <section>
      <img
        className="w-100"
        src="/assets/images/ice-cak-bnner.jpg"
        alt={t("lblIceCreamBannerAlt")}
      />

      <div className="container">
        <div className="bg-white">
          <IceCreamsFilters
            key={selected.icecream_portion_size_ids}
            portionSizes={portionSizes}
            selected={selected}
            language={language}
          />
        </div>
      </div>

      <div className="container-fluid px-3 px-md-4 py-1">
        <div className="bg-white">
          <div className="row row-cols-2 row-cols-sm-3 row-cols-lg-5 storefront-product-grid g-3 g-lg-4 mt-3">
            {products.length > 0 ? products.map((product, index) => (
              <Fragment key={product.id}>
                <ProductCard product={product} language={language} />
                {index === 3 && <CustomIceCreamCard language={language} />}
              </Fragment>
            )) : (
              <div className="noProductCont text-center py-5">
                <img className="nop-img w-25" src="/assets/images/notfound.png" alt={t("lblNoProductsFoundAlt")} />
                <p className="fs-2 fw-bold mt-3 text-brown">{t("lblNoProductsFound")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <MoreGift language={language}/>
    </section>
  );
}
