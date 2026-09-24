import Link from "next/link";
import marbleUploadUrl from "@/utils/marbleUploadUrl";
import { getLocalizedLabel, getLocalizedValue } from "@/utils/localizedContent";
import { isProductInStock } from "@/utils/stock";

function formatPrice(value) {
  const price = Number(value);
  if (!Number.isFinite(price)) return "";

  return `${price.toFixed(2)} SR`;
}

function productDisplayPrice(product, price) {
  if (price) return price;

  const salePrice = Number(product.sale_price);
  if (Number.isFinite(salePrice) && salePrice > 0) {
    return formatPrice(salePrice);
  }

  return formatPrice(product.regular_price);
}

function hasFastDelivery(product) {
  return (product.tags || []).some((tag) => {
    const values = [tag.name_en, tag.name_ar, tag.slug].filter(Boolean);

    return values.some((value) => {
      const normalized = String(value).toLowerCase().replace(/[-_]+/g, " ");
      return normalized.includes("fast delivery");
    });
  });
}

export default function ProductCard({
  product = {},
  title,
  meta,
  price,
  href,
  imageUrl,
  imageAlt,
  buttonLabel,
  badgeLabel,
  wrapperClassName = "col",
  showMeta = true,
  link = true,
  language = "en",
}) {
  const productTitle = product.name_en || product.title || "";
  const cardTitle = title || getLocalizedValue(productTitle, product.name_ar, language);
  const cardMeta = meta ?? product.sku ?? product.code ?? "";
  const cardPrice = productDisplayPrice(product, price ?? product.price);
  const cardHref = link ? href || product.href || (product.slug || product.id ? `/product/${product.slug || product.id}` : "") : "";
  const cardImage = marbleUploadUrl(imageUrl ?? product.image_url ?? product.image ?? product.img);
  const deliveryBadge = badgeLabel || (hasFastDelivery(product) ? "Fast Delivery" : "");
  const inStock = isProductInStock(product);
  const resolvedButtonLabel = inStock
    ? buttonLabel || getLocalizedLabel("lblAddToCart", language)
    : getLocalizedLabel("lblOutOfStock", language) || "Out of Stock";

  return (
    <div className={wrapperClassName}>
      <div
        className={`card storefront-product-card w-100 border-0 rounded-4 h-100 p-2 text-center position-relative ${
          inStock ? "" : "opacity-75"
        }`}
      >
        {deliveryBadge && (
          <span className="storefront-product-badge position-absolute top-0 start-0 translate-middle-y rounded-pill text-white">
            {deliveryBadge}
          </span>
        )}

        {cardHref ? (
          <Link href={cardHref} className="text-decoration-none">
            {cardImage && (
              <img
                className="storefront-product-img w-100 rounded-4 object-fit-contain"
                src={cardImage}
                alt={imageAlt || cardTitle}
              />
            )}
          </Link>
        ) : (
          cardImage && (
            <img
              className="storefront-product-img w-100 rounded-4 object-fit-contain"
              src={cardImage}
              alt={imageAlt || cardTitle}
            />
          )
        )}

        <div className="card-body storefront-product-body text-center d-flex flex-column px-1 pb-0">
          {cardHref ? (
            <Link href={cardHref} className="text-decoration-none">
              <h6 className="storefront-product-title product-title text-center text-brown fs-24 font-brandon-bold mb-1">
                {cardTitle}
              </h6>
            </Link>
          ) : (
            <h6 className="storefront-product-title product-title text-center text-brown fs-24 font-brandon-bold mb-1">
              {cardTitle}
            </h6>
          )}

          {showMeta && (
            <p className="storefront-product-meta product-cat my-1 mb-2">
              {cardMeta || "N/A"}
            </p>
          )}

          {cardPrice && (
            <p className="storefront-product-price text-center text-sky fs-20 mb-3">
              {cardPrice}
            </p>
          )}

          {cardHref && inStock ? (
            <Link
              href={cardHref}
              className="btn add-to-cart-btn hero-btn storefront-product-btn mt-auto w-100"
            >
              {resolvedButtonLabel}
            </Link>
          ) : (
            <button
              type="button"
              className="btn add-to-cart-btn hero-btn storefront-product-btn mt-auto w-100"
              disabled={!inStock}
            >
              {resolvedButtonLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
