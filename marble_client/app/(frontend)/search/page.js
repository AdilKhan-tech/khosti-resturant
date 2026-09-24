import { getProductsRoute } from "@/utils/apiRoutes";
import apiKeyMapping from "@/configs/apiKeyMapping";
import { cookies, headers } from "next/headers";
import ProductCard from "@/components/frontend/ProductCard";
import {
  getLocalizedLabel,
  LANGUAGE_COOKIE,
  normalizeLanguage,
} from "@/utils/localizedContent";
import { buildPageMetadata } from "@/utils/pageSeo";

function queryValue(value) {
  if (Array.isArray(value)) return String(value[0] || "").trim();
  return String(value || "").trim();
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

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const query = queryValue(params?.q) || queryValue(params?.s);
  const base = await buildPageMetadata("search", {
    title: "Search | Marble Store",
    description: "Search products at Marble Store",
  });
  if (!query) return base;
  return {
    ...base,
    title: `Search Results for: ${query} | Marble Store`,
  };
}

export default async function SearchPage({ searchParams }) {
  const params = await searchParams;
  const [headersList, cookieStore] = await Promise.all([headers(), cookies()]);
  const currentDomain = headersList.get("host")?.split(":")[0] || "localhost";
  const apiKey = apiKeyMapping[currentDomain] || null;
  const language = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);
  const t = (labelKey, fallback) =>
    getLocalizedLabel(labelKey, language, fallback);

  const query = queryValue(params?.q) || queryValue(params?.s);
  let products = [];
  let loadError = false;

  if (query) {
    try {
      const response = await fetch(
        appendFilters(getProductsRoute, {
          s: query,
          limit: "100",
          sortField: "name_en",
          sortOrder: "ASC",
        }),
        {
          headers: { "X-API-KEY": apiKey },
          cache: "no-store",
        },
      );
      if (response.ok) {
        const json = await response.json();
        products = json.data || [];
      } else {
        loadError = true;
      }
    } catch {
      loadError = true;
    }
  }

  return (
    <section className="py-4">
      <div className="container">
        <div className="mb-4">
          <h1 className="fs-28 fw-bold text-brown mb-2">
            {query
              ? `${t("lblSearchResultsFor", "Search results for")}: “${query}”`
              : t("lblSearchProducts", "Search products")}
          </h1>
          {query ? (
            <p className="text-muted mb-0">
              {loadError
                ? t(
                    "lblSearchLoadError",
                    "Search could not be completed. Please try again.",
                  )
                : t("lblSearchResultsCount", "{count} products found").replace(
                    "{count}",
                    String(products.length),
                  )}
            </p>
          ) : (
            <p className="text-muted mb-0">
              {t(
                "lblSearchEnterQuery",
                "Enter a product name in the search box above.",
              )}
            </p>
          )}
        </div>

        {!query ? null : products.length > 0 ? (
          <div className="row row-cols-2 row-cols-sm-3 row-cols-lg-5 storefront-product-grid g-3 g-lg-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                language={language}
              />
            ))}
          </div>
        ) : (
          !loadError && (
            <div className="noProductCont text-center py-5">
              <img
                className="nop-img w-25"
                src="/assets/images/notfound.png"
                alt={t("lblNoProductsFoundAlt", "No products found")}
              />
              <p className="fs-2 fw-bold mt-3 text-brown">
                {t("lblNoProductsFound", "No products found")}
              </p>
              <p className="text-muted">
                {t(
                  "lblSearchTryAgain",
                  "Try a different spelling or browse cakes and ice creams.",
                )}
              </p>
            </div>
          )
        )}
      </div>
    </section>
  );
}
