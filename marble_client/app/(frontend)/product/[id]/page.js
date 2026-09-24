import { getProductByIdRoute, getProductOptionsRoute, getProductsRoute } from "@/utils/apiRoutes";
import apiKeyMapping from "@/configs/apiKeyMapping";
import { cookies, headers } from "next/headers";
import ProductView from "@/components/frontend/product/ProductView";
import { getLocalizedLabel, LANGUAGE_COOKIE, normalizeLanguage } from "@/utils/localizedContent";

function idList(items = []) {
  return items.map((item) => item.id).filter(Boolean).join(",");
}

async function fetchRelatedProducts(product, apiKey) {
  const categoryIds = idList(product.categories);
  const tagIds = idList(product.tags);
  const occasionIds = idList(product.occasions);
  const fetchRelated = async (query) => {
    const queryString = new URLSearchParams(query ? `${query}&limit=10` : "limit=10").toString();
    const res = await fetch(`${getProductsRoute}?${queryString}`, {
      headers: { "X-API-KEY": apiKey },
      cache: "no-store",
    });

    if (!res.ok) return [];

    const json = await res.json();
    return (json.data || []).filter((item) => item.id !== product.id);
  };

  const relatedByCategoryAndTag = categoryIds
    ? await fetchRelated(`category_ids=${categoryIds}${tagIds ? `&tag_ids=${tagIds}` : ""}`)
    : [];

  if (relatedByCategoryAndTag.length >= 5) return relatedByCategoryAndTag.slice(0, 5);

  const relatedByCategory = categoryIds ? await fetchRelated(`category_ids=${categoryIds}`) : [];
  const relatedByOccasion = occasionIds ? await fetchRelated(`occasion_ids=${occasionIds}`) : [];
  const latestProducts = await fetchRelated("");
  const uniqueProducts = [...relatedByCategoryAndTag, ...relatedByCategory, ...relatedByOccasion, ...latestProducts]
    .filter((item, index, items) => items.findIndex((candidate) => candidate.id === item.id) === index);

  return uniqueProducts.slice(0, 5);
}

export default async function ProductPageDetail({ params }) {
  const { id: productIdentifier } = await params;
  const [headersList, cookieStore] = await Promise.all([headers(), cookies()]);
  const currentDomain = headersList.get("host")?.split(":")[0] || "localhost";
  const apiKey = apiKeyMapping[currentDomain] || null;
  const language = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);
  const t = (labelKey, fallback) => getLocalizedLabel(labelKey, language, fallback);

  let product = null;
  let relatedProducts = [];
  let options = { sizes: [], flavors: [], portionSizes: [], isIceCream: false };

  try {
    const [productRes, optionsRes] = await Promise.all([
      fetch(getProductByIdRoute(productIdentifier), {
        headers: { "X-API-KEY": apiKey },
        cache: "no-store",
      }),
      fetch(getProductOptionsRoute(productIdentifier), {
        headers: { "X-API-KEY": apiKey },
        cache: "no-store",
      }),
    ]);

    if (productRes.ok) {
      const json = await productRes.json();
      product = json.data || json;
    }

    if (optionsRes.ok) {
      options = await optionsRes.json();
    }

    if (product) {
      relatedProducts = await fetchRelatedProducts(product, apiKey);
    }
  } catch {
    // API unreachable
  }

  if (!product) {
    return <p className="text-center mt-5">{t("lblProductNotFound")}</p>;
  }

  return (
    <ProductView
      product={product}
      sizes={options.sizes || []}
      flavors={options.flavors || []}
      portionSizes={options.portionSizes || []}
      isIceCream={options.isIceCream || false}
      relatedProducts={relatedProducts}
      language={language}
    />
  );
}
