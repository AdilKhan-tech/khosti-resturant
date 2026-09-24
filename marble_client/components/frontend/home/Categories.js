import Link from "next/link";
import { getLocalizedLabel } from "@/utils/localizedContent";

const categories = [
  {
    labelKey: "lblCategoryCakes",
    href: "/product-category/cakes",
    image: "/assets/images/Mermaid-cake-1.webp",
  },
  {
    labelKey: "lblCategoryCookies",
    href: "/cookies",
    image: "/assets/images/cookiespg1.png",
  },
  {
    labelKey: "lblMarbleVan",
    href: "/makeicecream",
    image: "/assets/images/mvan.png",
  },
];

export default function Categories({ language = "en" }) {
  const t = (labelKey, fallback) => getLocalizedLabel(labelKey, language, fallback);

  return (
    <div className="container text-center py-5">
      <h1 className="text-center text-brown mb-5 fs-44 font-brandon-bold">{t("lblByCategories")}</h1>
      <div className="row g-3 g-md-4 justify-content-center mt-2">
        {categories.map((category) => (
          <div className="col-12 col-md-4" key={category.labelKey}>
            <Link href={category.href} className="text-decoration-none text-dark">
              <div className="home-category-card rounded-4 text-center h-100 d-flex flex-column align-items-center justify-content-between">
                <h4 className="home-category-title font-brandon-bold mb-0">{t(category.labelKey)}</h4>
                <img
                  className="home-category-img img-fluid"
                  src={category.image}
                  alt={t(category.labelKey)}
                />
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
