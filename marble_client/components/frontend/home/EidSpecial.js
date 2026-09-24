import { headers } from "next/headers";
import apiKeyMapping from "@/configs/apiKeyMapping";
import { getProductsRoute } from "@/utils/apiRoutes";
import marbleUploadUrl from "@/utils/marbleUploadUrl";
import ProductSlider from "@/components/frontend/home/ProductSlider";
import { getLocalizedLabel } from "@/utils/localizedContent";

function productMatchesEid(product) {
  const haystack = [
    product.name_en,
    product.sku,
    ...(product.categories || []).map((category) => category.name_en),
    ...(product.tags || []).map((tag) => tag.name_en),
    ...(product.occasions || []).map((occasion) => occasion.name_en),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes("eid");
}

async function getEidProducts() {
  const headersList = await headers();
  const currentDomain = headersList.get("host")?.split(":")[0] || "localhost";
  const apiKey = apiKeyMapping[currentDomain] || null;

  try {
    const res = await fetch(getProductsRoute, {
      headers: { "X-API-KEY": apiKey },
      cache: "no-store",
    });

    if (!res.ok) return [];

    const json = await res.json();
    const products = json.data || [];
    const eidProducts = products.filter(productMatchesEid);
    const visibleProducts = (eidProducts.length ? eidProducts : products).slice(0, 5);

    return visibleProducts.map((product) => ({
      ...product,
      image_url: marbleUploadUrl(product.image_url),
      href: `/product/${product.slug || product.id}`,
    }));
  } catch {
    return [];
  }
}

async function EidSpecial({ language = "en" }) {
  const products = await getEidProducts();
  const t = (labelKey, fallback) => getLocalizedLabel(labelKey, language, fallback);

  return (
    <section className="bg-light">
      {/* Why Order Online */}
      <div className="py-3 text-center bg-green">
        <div className="container">
          <p className="fs-30 font-brandon-bold text-purpleL pt-3 mb-3">{t("lblWhyOrderOnline")}</p>
          <div className="row justify-content-center gy-3 pb-3">
            <div className="col-12 col-md-4">
              <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-2">
                <img src="/assets/images/order-cake.webp" alt={t("lblPersonalizedCake")} className="object-fit-contain size-60" />
                <div className="text-start">
                  <p className="m-0 fs-25 font-brandon-bold text-brown">{t("lblPersonalizedCake")}</p>
                  <p className="m-0 fw-medium text-brown">{t("lblOverHundredDesigns")}</p>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-2">
                <img src="/assets/images/order-hand.png" alt={t("lblEasyOrdering")} className="object-fit-contain size-60" />
                <div className="text-start">
                  <p className="m-0 fs-25 font-brandon-bold text-brown">{t("lblEasyOrdering")}</p>
                  <p className="m-0 fw-medium text-brown">{t("lblWithinTwoMinutes")}</p>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-2">
                <img src="/assets/images/order-box.png" alt={t("lblFastDelivery")} className="object-fit-contain size-60" />
                <div className="text-start">
                  <p className="m-0 fs-25 font-brandon-bold text-brown">{t("lblFastDelivery")}</p>
                  <p className="m-0 fw-medium text-brown">{t("lblWithinTwoHours")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProductSlider
        title={t("lblHomeEidSpecial")}
        products={products}
        sectionClassName="bg-light py-5"
        buttonLabel={t("lblAddToCart")}
        language={language}
      />
    </section>
  );
}

export default EidSpecial;
