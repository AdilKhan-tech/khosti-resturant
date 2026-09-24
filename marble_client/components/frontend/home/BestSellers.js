import { headers } from "next/headers";
import apiKeyMapping from "@/configs/apiKeyMapping";
import { getProductsRoute } from "@/utils/apiRoutes";
import ProductSlider from "@/components/frontend/home/ProductSlider";
import { getLocalizedLabel } from "@/utils/localizedContent";

function matchesBestSeller(product) {
  const haystack = [
    product.name_en,
    product.name_ar,
    product.sku,
    ...(product.tags || []).flatMap((tag) => [tag.name_en, tag.name_ar, tag.slug]),
    ...(product.categories || []).flatMap((category) => [category.name_en, category.name_ar, category.slug]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes("best") || haystack.includes("seller");
}

async function getBestSellerProducts() {
  const headersList = await headers();
  const currentDomain = headersList.get("host")?.split(":")[0] || "localhost";
  const apiKey = apiKeyMapping[currentDomain] || null;

  try {
    const res = await fetch(`${getProductsRoute}?limit=12`, {
      headers: { "X-API-KEY": apiKey },
      cache: "no-store",
    });

    if (!res.ok) return [];

    const json = await res.json();
    const products = json.data || [];
    const bestSellers = products.filter(matchesBestSeller);

    return (bestSellers.length ? bestSellers : products).slice(0, 10);
  } catch {
    return [];
  }
}

export default async function BestSellers({ language = "en" }) {
  const products = await getBestSellerProducts();

  return (
    <ProductSlider
      title={getLocalizedLabel("lblHomeBestSellers", language)}
      products={products}
      sectionClassName="bg-white py-5"
      language={language}
    />
  );
}
