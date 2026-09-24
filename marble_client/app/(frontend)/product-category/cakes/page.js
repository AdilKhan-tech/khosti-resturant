import {
  getCakePortionSizesRoute,
  getCategoriesRoute,
  getGendersRoute,
  getOccasionsRoute,
  getProductsRoute,
} from "@/utils/apiRoutes";
import apiKeyMapping from "@/configs/apiKeyMapping";
import { cookies, headers } from "next/headers";
import { Fragment } from "react";
import CakesFilters from "@/components/frontend/cakes/CakesFilters";
import ProductCard from "@/components/frontend/ProductCard";
import { getLocalizedLabel, LANGUAGE_COOKIE, normalizeLanguage } from "@/utils/localizedContent";
import { buildPageMetadata } from "@/utils/pageSeo";

export async function generateMetadata() {
  return buildPageMetadata("cakes", {
    title: "Cakes | Marble Store",
    description: "Browse cakes from Marble Store",
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

function CustomCakeCard({ language }) {
  const t = (labelKey, fallback) => getLocalizedLabel(labelKey, language, fallback);

  return (
    <ProductCard
      title={t("lblCustomizeCake")}
      meta={t("lblMakeItYourWay")}
      href="/makecake"
      imageUrl="/assets/images/Cake-type.svg"
      imageAlt={t("lblCustomizeCakeAlt")}
      buttonLabel={t("lblStartCustomCake")}
    />
  );
}

export default async function CakesPage({ searchParams }) {
  const params = await searchParams;
  const [headersList, cookieStore] = await Promise.all([headers(), cookies()]);
  const currentDomain = headersList.get("host")?.split(":")[0] || "localhost";
  const apiKey = apiKeyMapping[currentDomain] || null;
  const language = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);
  const t = (labelKey, fallback) => getLocalizedLabel(labelKey, language, fallback);
  const selected = {
    s: queryValue(params?.s),
    cake_type_ids: queryValue(params?.cake_type_ids),
    occasion_ids: queryValue(params?.occasion_ids),
    portion_size_ids: queryValue(params?.portion_size_ids),
    gender_ids: queryValue(params?.gender_ids),
  };

  let products = [];
  let cakeTypes = [];
  let occasions = [];
  let portionSizes = [];
  let genders = [];

  try {
    const [productsRes, cakeTypesRes, occasionsRes, portionSizesRes, gendersRes] = await Promise.all([
      fetch(appendFilters(getProductsRoute, {
        category_slug: "cakes",
        limit: "500",
        s: selected.s,
        cake_type_ids: selected.cake_type_ids,
        occasion_ids: selected.occasion_ids,
        gender_ids: selected.gender_ids,
      }), {
        headers: { "X-API-KEY": apiKey },
        cache: "no-store",
      }),
      fetch(`${getCategoriesRoute}?parent_slug=cakes&limit=100&sortOrder=ASC`, {
        headers: { "X-API-KEY": apiKey },
        cache: "no-store",
      }),
      fetch(`${getOccasionsRoute}?limit=100&sortOrder=ASC`, {
        headers: { "X-API-KEY": apiKey },
        cache: "no-store",
      }),
      fetch(`${getCakePortionSizesRoute}?limit=100&sortOrder=ASC`, {
        headers: { "X-API-KEY": apiKey },
        cache: "no-store",
      }),
      fetch(`${getGendersRoute}?limit=100&sortOrder=ASC`, {
        headers: { "X-API-KEY": apiKey },
        cache: "no-store",
      }),
    ]);

    if (productsRes.ok) {
      const json = await productsRes.json();
      products = json.data || [];
    }

    if (cakeTypesRes.ok) {
      const json = await cakeTypesRes.json();
      cakeTypes = json.data || [];
    }

    if (occasionsRes.ok) {
      const json = await occasionsRes.json();
      occasions = json.data || [];
    }

    if (portionSizesRes.ok) {
      const json = await portionSizesRes.json();
      portionSizes = json.data || [];
    }

    if (gendersRes.ok) {
      const json = await gendersRes.json();
      genders = json.data || [];
    }
  } catch {
    // API unreachable
  }

  return (
    <section>
      <img
        className="w-100"
        src="/assets/images/ice-cak-bnner.jpg"
        alt={t("lblCakesBannerAlt")}
      />
      <div className="container">
        <div className="bg-white">
          <CakesFilters
            key={`${selected.cake_type_ids}|${selected.occasion_ids}|${selected.portion_size_ids}|${selected.gender_ids}`}
            cakeTypes={cakeTypes}
            occasions={occasions}
            portionSizes={portionSizes}
            genders={genders}
            selected={selected}
            language={language}
          />
        </div>
      </div>

      <div className="container-fluid px-3 px-md-4 py-1">
        <div className="row row-cols-2 row-cols-sm-3 row-cols-lg-5 storefront-product-grid g-3 g-lg-4 mt-3">
          {products.length > 0 ? products.map((product, index) => (
            <Fragment key={product.id}>
              <ProductCard product={product} language={language} />
              {index === 3 && <CustomCakeCard language={language} />}
            </Fragment>
          )) : (
            <div className="noProductCont text-center py-5">
              <img className="nop-img w-25" src="/assets/images/notfound.png" alt={t("lblNoProductsFoundAlt")} />
              <p className="fs-2 fw-bold mt-3 text-brown">{t("lblNoProductsFound")}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
