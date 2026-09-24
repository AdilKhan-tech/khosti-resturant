"use client";

import { useRef } from "react";
import ProductCard from "@/components/frontend/ProductCard";
import { getLocalizedLabel } from "@/utils/localizedContent";

export default function ProductSlider({
  title,
  products = [],
  sectionClassName = "bg-light py-5",
  buttonLabel,
  language = "en",
}) {
  const trackRef = useRef(null);
  const t = (labelKey, fallback) => getLocalizedLabel(labelKey, language, fallback);
  const resolvedButtonLabel = buttonLabel || t("lblAddToCart");

  if (!products.length) return null;

  const scroll = (direction) => {
    const track = trackRef.current;
    if (!track) return;

    track.scrollBy({
      left: direction * Math.max(track.clientWidth * 0.85, 260),
      behavior: "smooth",
    });
  };

  return (
    <section className={sectionClassName}>
      <h1 className="text-center text-brown mb-5 fs-44 font-brandon-bold">{title}</h1>
      <div className="container-fluid px-3 px-md-5">
        <div className="home-product-slider position-relative">
          <button
            type="button"
            className="home-product-slider-control home-product-slider-prev position-absolute top-50 translate-middle-y border-0 rounded-circle d-flex align-items-center justify-content-center"
            aria-label={`${t("lblPrevious")} ${title}`}
            onClick={() => scroll(-1)}
          >
            ‹
          </button>

          <div
            ref={trackRef}
            className="home-product-slider-track d-flex overflow-auto no-scrollbar gap-3 pb-3 px-1"
          >
            {products.map((item, index) => (
              <ProductCard
                key={
                  item.id != null
                    ? `product-${item.id}`
                    : `${item.sku || item.slug || item.name_en || "item"}-${index}`
                }
                product={item}
                buttonLabel={resolvedButtonLabel}
                wrapperClassName="flex-shrink-0 storefront-product-carousel-item"
                language={language}
              />
            ))}
          </div>

          <button
            type="button"
            className="home-product-slider-control home-product-slider-next position-absolute top-50 translate-middle-y border-0 rounded-circle d-flex align-items-center justify-content-center"
            aria-label={`${t("lblNext")} ${title}`}
            onClick={() => scroll(1)}
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}
