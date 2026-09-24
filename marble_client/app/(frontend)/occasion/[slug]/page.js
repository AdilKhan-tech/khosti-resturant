import { Fragment } from "react";
import Link from "next/link";
import { cookies, headers } from "next/headers";
import apiKeyMapping from "@/configs/apiKeyMapping";
import {
  getBannerBySlugRoute,
  getOccasionsRoute,
  getProductsRoute,
} from "@/utils/apiRoutes";
import marbleUploadUrl from "@/utils/marbleUploadUrl";
import ProductCard from "@/components/frontend/ProductCard";
import { getLocalizedLabel, getLocalizedValue, LANGUAGE_COOKIE, normalizeLanguage } from "@/utils/localizedContent";

const FALLBACK_BANNER_URL = "/assets/images/ice-cak-bnner.jpg";

function appendParams(route, params) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.set(key, value);
  });

  const query = searchParams.toString();
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
      language={language}
    />
  );
}

function OccasionFilterStrip({ occasions, activeSlug, language }) {
  return (
    <div className="container-fluid px-3 px-md-4 pt-5 mt-5">
      <div className="d-flex align-items-center gap-2">
        <button
          type="button"
          className="btn btn-light border rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 size-38"
          aria-label="Previous occasions"
        >
          ‹
        </button>

        <div
          className="d-flex align-items-center gap-3 flex-grow-1 overflow-auto no-scrollbar"
        >
          <Link
            href="/product-category/cakes"
            className="btn border-0 rounded-3 d-inline-flex align-items-center gap-2 text-dark flex-shrink-0 px-3 py-2 bg-soft-blue"
          >
            <i className="bi bi-image text-secondary" aria-hidden="true"></i>
            <span className="fs-14">All</span>
          </Link>
          {occasions.map((item) => {
            const isActive = item.slug === activeSlug;
            const iconSrc = marbleUploadUrl(item.image_url);
            return (
              <Link
                key={item.id}
                href={`/occasion/${item.slug}`}
                className={`btn rounded-3 d-inline-flex align-items-center gap-2 flex-shrink-0 px-3 py-2 occasion-filter-link ${isActive ? "active" : ""}`}
              >
                {iconSrc ? (
                  <img
                    src={iconSrc}
                    alt=""
                    className="rounded-circle object-fit-contain size-24"
                  />
                ) : (
                  <i className="bi bi-image text-secondary" aria-hidden="true"></i>
                )}
                <span className="fs-14">{getLocalizedValue(item.name_en, item.name_ar, language)}</span>
              </Link>
            );
          })}
        </div>

        <button
          type="button"
          className="btn btn-light border rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 size-38"
          aria-label="Next occasions"
        >
          ›
        </button>
        <button
          type="button"
          className="btn bg-white border rounded-4 d-flex align-items-center justify-content-center flex-shrink-0 size-48"
          aria-label="Filters"
        >
          <i className="bi bi-funnel fs-3 text-brown" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  );
}

export default async function OccasionPage({ params }) {
  const { slug } = await params;
  const [headersList, cookieStore] = await Promise.all([headers(), cookies()]);
  const currentDomain = headersList.get("host")?.split(":")[0] || "localhost";
  const apiKey = apiKeyMapping[currentDomain] || null;
  const language = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);

  let bannerUrl = FALLBACK_BANNER_URL;
  let occasion = null;
  let occasions = [];
  let products = [];

  try {
    const [bannerRes, occasionsRes, productsRes] = await Promise.all([
      fetch(getBannerBySlugRoute("occassion"), {
        headers: { "X-API-KEY": apiKey },
        cache: "no-store",
      }),
      fetch(`${getOccasionsRoute}?limit=100&sortOrder=ASC`, {
        headers: { "X-API-KEY": apiKey },
        cache: "no-store",
      }),
      fetch(appendParams(getProductsRoute, {
        occasion_slug: slug,
        limit: "500",
      }), {
        headers: { "X-API-KEY": apiKey },
        cache: "no-store",
      }),
    ]);

    if (bannerRes.ok) {
      const json = await bannerRes.json();
      bannerUrl = json.data?.banner_en_url || FALLBACK_BANNER_URL;
    }

    if (occasionsRes.ok) {
      const json = await occasionsRes.json();
      occasions = json.data || [];
      occasion = occasions.find((item) => item.slug === slug) || null;
    }

    if (productsRes.ok) {
      const json = await productsRes.json();
      products = json.data || [];
    }
  } catch {
    // API unreachable
  }

  const title = getLocalizedValue(occasion?.name_en, occasion?.name_ar, language, slug.replace(/-/g, " "));

  return (
    <section>
      <div className="cake-background-desktop-banner">
        <img className="w-100" src={bannerUrl} alt={`${title} banner`} />
      </div>

      <OccasionFilterStrip occasions={occasions} activeSlug={slug} language={language} />

      <section className="taxonomy-occasion-section py-4">
        <div className="container-fluid px-3 px-md-4">
          <div className="row row-cols-2 row-cols-sm-3 row-cols-lg-5 storefront-product-grid g-3 g-lg-4 mt-2">
            {products.length > 0 ? products.map((product, index) => (
              <Fragment key={product.id}>
                <ProductCard product={product} language={language} />
                {index === 2 && <CustomCakeCard language={language} />}
              </Fragment>
            )) : (
              <div className="col-12">
                <p className="text-brown fs-5">No products found in this occasion.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </section>
  );
}
