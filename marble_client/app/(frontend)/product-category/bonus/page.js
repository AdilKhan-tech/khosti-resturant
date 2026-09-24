import { getQrCodeBySkuRoute } from "@/utils/apiRoutes";
import apiKeyMapping from "@/configs/apiKeyMapping";
import { cookies, headers } from "next/headers";
import ProductCard from "@/components/frontend/ProductCard";
import BrandSkuCapture from "@/components/frontend/BrandSkuCapture";
import {
  LANGUAGE_COOKIE,
  normalizeLanguage,
} from "@/utils/localizedContent";

function queryValue(value) {
  if (Array.isArray(value)) return String(value[0] || "").trim();
  return String(value || "").trim();
}

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const key = queryValue(params?.key);
  return {
    title: key ? `Bonus | ${key} | Marble Store` : "Bonus | Marble Store",
  };
}

export default async function BonusQrLandingPage({ searchParams }) {
  const params = await searchParams;
  const key = queryValue(params?.key);
  const [headersList, cookieStore] = await Promise.all([headers(), cookies()]);
  const currentDomain = headersList.get("host")?.split(":")[0] || "localhost";
  const apiKey = apiKeyMapping[currentDomain] || null;
  const language = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);

  if (!key) {
    return (
      <main className="container py-5">
        <p className="text-danger mb-0">Missing QR key.</p>
      </main>
    );
  }

  let data = null;
  try {
    const res = await fetch(getQrCodeBySkuRoute(key), {
      headers: { "X-API-KEY": apiKey },
      cache: "no-store",
    });
    if (res.ok) {
      const json = await res.json();
      data = json?.data || null;
    }
  } catch {
    data = null;
  }

  if (!data) {
    return (
      <main className="container py-5">
        <p className="text-danger mb-0">No record exists for this QR code.</p>
      </main>
    );
  }

  const bannerUrl =
    language === "ar"
      ? data.banner_ar_url || data.banner_en_url
      : data.banner_en_url || data.banner_ar_url;

  if (!bannerUrl) {
    return (
      <main className="container py-5">
        <p className="text-danger mb-0">Banner not found for this QR code.</p>
      </main>
    );
  }

  const products = data.products || [];

  return (
    <main>
      <BrandSkuCapture sku={data.sku} />
      <section className="cake-background-desktop-banner">
        <img src={bannerUrl} className="w-100" alt={data.brand || "Bonus"} />
      </section>
      <section className="container py-4">
        {products.length === 0 ? (
          <p className="text-secondary mb-0">No products found.</p>
        ) : (
          <div className="row g-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  name_en: product.name_en,
                  name_ar: product.name_ar,
                  image_url: product.image_url,
                  regular_price: product.price,
                }}
                language={language}
                wrapperClassName="col-6 col-md-4 col-lg-3"
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
