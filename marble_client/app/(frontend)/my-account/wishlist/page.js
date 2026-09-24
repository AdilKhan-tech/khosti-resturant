import { cookies } from "next/headers";
import ProductCard from "@/components/frontend/ProductCard";
import { getLocalizedLabel, LANGUAGE_COOKIE, normalizeLanguage } from "@/utils/localizedContent";

const WISHLIST_ITEMS = [
  {
    nameLabelKey: "lblWishlistChocolateCake",
    price: "245.00 SR",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400",
  },
  {
    nameLabelKey: "lblWishlistButterCookies",
    price: "89.00 SR",
    image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400",
  },
];

export default async function MyAccountWishlistPage() {
  const cookieStore = await cookies();
  const language = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);
  const t = (labelKey, fallback) => getLocalizedLabel(labelKey, language, fallback);

  return (
    <div className="mt-3">
      <p className="fs-25 Brandon_Grotesque mt-3">{t("lblMyWishlist")}</p>
      <div className="row g-3">
        {WISHLIST_ITEMS.map((item) => (
          <ProductCard
            key={item.nameLabelKey}
            product={{
              name_en: getLocalizedLabel(item.nameLabelKey, "en"),
              name_ar: getLocalizedLabel(item.nameLabelKey, "ar"),
              image: item.image,
            }}
            price={item.price}
            wrapperClassName="col-md-6 col-xl-4"
            showMeta={false}
            language={language}
          />
        ))}
      </div>

    </div>
  );
}
