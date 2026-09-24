import { getProductsRoute } from "@/utils/apiRoutes";
import MoreGift from "@/components/frontend/home/Moregift";
import { cookies, headers } from "next/headers";
import apiKeyMapping from "@/configs/apiKeyMapping";
import ProductCard from "@/components/frontend/ProductCard";
import { LANGUAGE_COOKIE, normalizeLanguage } from "@/utils/localizedContent";
import { buildPageMetadata } from "@/utils/pageSeo";

export async function generateMetadata() {
  return buildPageMetadata("diy", {
    title: "DIY Gifts | Marble Store",
    description: "DIY gifts from Marble Store",
  });
}

export default async function DiyPage() {
  const [headersList, cookieStore] = await Promise.all([headers(), cookies()]);
  const currentDomain = headersList.get("host")?.split(":")[0] || "localhost";
  const apiKey = apiKeyMapping[currentDomain] || null;
  const language = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);

  let products = [];

  try {
    const res = await fetch(getProductsRoute, {
      headers: { "X-API-KEY": apiKey },
      cache: "no-store",
    });

    if (res.ok) {
      const json = await res.json();
      products = (json.data || []).filter((product) =>
        product.categories?.some((cat) => cat.name_en.toLowerCase() === "cookies box")
      );
    }
  } catch {
    // API unreachable
  }

  return (
    <section>
      <img
        className="w-100"
        src="/assets/images/ice-cak-bnner.jpg"
        alt="DIY cookies box banner"
      />

      <div className="container-fluid px-3 px-md-5 py-4">
        <div className="bg-white">
          <div className="row row-cols-2 row-cols-sm-3 row-cols-lg-5 storefront-product-grid g-3 g-lg-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} language={language} />
            ))}
          </div>
        </div>
      </div>
      <MoreGift language={language}/>
    </section>
  );
}