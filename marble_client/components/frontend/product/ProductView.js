"use client";
import React, { useState, useMemo } from "react";
import marbleUploadUrl from "@/utils/marbleUploadUrl";
import axios from "axios";
import { useRouter } from "next/navigation";
import { addCartItemRoute } from "@/utils/apiRoutes";
import apiKeyMapping from "@/configs/apiKeyMapping";
import DeliveryPickupModal, { getSavedReceivingInfo } from "./DeliveryPickupModal";
import { notifyCartUpdated } from "@/utils/cartEvents";
import ProductCard from "@/components/frontend/ProductCard";
import { getLocalizedLabel, getLocalizedValue } from "@/utils/localizedContent";
import {
  formatSpecialDayLabel,
  getSpecialDayState,
} from "@/utils/specialDay";
import { isProductInStock } from "@/utils/stock";

function getCartUserId() {
  if (typeof window === "undefined") return "guest";
  let userId = window.localStorage.getItem("marble_cart_user_id");
  if (!userId) {
    userId = `guest-${window.crypto?.randomUUID ? window.crypto.randomUUID() : Date.now()}`;
    window.localStorage.setItem("marble_cart_user_id", userId);
  }
  document.cookie = `marble_cart_user_id=${encodeURIComponent(userId)}; path=/; max-age=31536000; samesite=lax`;
  return userId;
}

export default function ProductView({
  product,
  sizes = [],
  flavors = [],
  portionSizes = [],
  isIceCream = false,
  relatedProducts = [],
  language = "en",
}) {
  const router = useRouter();
  const t = (labelKey, fallback) => getLocalizedLabel(labelKey, language, fallback);
  const [selectedSize, setSelectedSize] = useState(sizes[0] || null);
  const [selectedFlavor, setSelectedFlavor] = useState(null);
  const [selectedPortionSize, setSelectedPortionSize] = useState(portionSizes[0] || null);
  const [cakeText, setCakeText] = useState("");
  const [cakeNote, setCakeNote] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showReceivingModal, setShowReceivingModal] = useState(false);

  const specialDay = useMemo(() => getSpecialDayState(product), [product]);
  const inStock = useMemo(() => isProductInStock(product), [product]);
  const canAddToCart = inStock && specialDay.canAddToCart;

  const calculatedPrice = useMemo(() => {
    const base = parseFloat(product.regular_price) || 0;
    const sizeAdd = selectedSize?.additional_price || 0;
    const flavorAdd = selectedFlavor?.additional_price || 0;
    const portionAdd = selectedPortionSize?.additional_price || 0;
    return base + sizeAdd + flavorAdd + portionAdd;
  }, [product, selectedSize, selectedFlavor, selectedPortionSize]);

  const addProductToCart = async () => {
    setIsAddingToCart(true);
    try {
      const hostName = window.location.hostname;
      const apiKey = apiKeyMapping[hostName] || apiKeyMapping.localhost;
      const response = await axios.post(
        addCartItemRoute,
        {
          user_id: getCartUserId(),
          product_id: product.id,
          product_type: "ready_made",
          quantity,
          cake_size: selectedSize,
          cake_flavor: selectedFlavor,
          ice_size: selectedPortionSize,
          product_text: cakeText,
          product_notes: cakeNote,
        },
        { headers: { "X-API-KEY": apiKey } },
      );
      notifyCartUpdated(response.data);
      router.push("/cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToCart = async () => {
    const savedReceivingInfo = getSavedReceivingInfo();
    if (
      !savedReceivingInfo ||
      (product.pickup_only &&
        savedReceivingInfo.address_type !== "Pickup")
    ) {
      setShowReceivingModal(true);
      return;
    }

    await addProductToCart();
  };

  const productName = getLocalizedValue(product.name_en, product.name_ar, language);
  const productDescription = getLocalizedValue(
    product.description,
    product.description_ar,
    language,
    t("lblNotAvailable"),
  );
  const tabs = [
    { key: "description", label: t("lblDescription") },
    { key: "calories", label: t("lblCalories") },
    { key: "allergens", label: t("lblAllergens") },
  ];

  return (
    <div className="bg-product-light">
      <div className="container py-5">
        <div className="row align-items-start">
          {/* Image */}
          <div className="col-12 col-md-5">
            <div className="p-4 bg-white rounded-4 shadow-sm">
              <img
                src={marbleUploadUrl(product.image_url)}
                alt={productName}
                className="w-100 rounded-4 object-fit-cover"
              />
            </div>
          </div>

          {/* Content */}
          <div className="col-12 col-md-7 mt-4 mt-md-0">
            <h1 className="font-brandon-bold mb-2 fs-fluid-42 text-brown">
              {productName}
            </h1>

            <p className="text-brown-50 mb-3 fs-18">
              {productDescription}
            </p>

            {/* Sizes */}
            {sizes.length > 0 && (
              <div className="mb-4">
                <h6 className="font-brandon-bold mb-2 text-brown">
                  {t("lblSelectSize")}
                </h6>
                <div className="d-flex gap-2 overflow-auto pb-2">
                  {sizes.map((size) => {
                    const sizeName = getLocalizedValue(size.name_en, size.name_ar, language);
                    return (
                      <button
                        key={size.id}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`border rounded-3 p-2 text-center bg-white flex-shrink-0 option-card ${
                          selectedSize?.id === size.id
                            ? "active border-2"
                            : "border-light"
                        }`}
                      >
                        {size.image_url && (
                          <img
                            src={size.image_url}
                            alt={sizeName}
                            className="object-fit-contain mx-auto d-block mb-1 size-60"
                          />
                        )}
                        <small className="d-block fw-semibold fs-12">
                          {sizeName}
                        </small>
                        {size.additional_price > 0 && (
                          <small className="text-muted fs-11">
                            +{size.additional_price} SR
                          </small>
                        )}
                      </button>
                    );
                  })}
                </div>
                {selectedSize?.calories && (
                  <small className="text-muted mt-1 d-block">
                    {t("lblCalories")}: {selectedSize.calories}
                  </small>
                )}
              </div>
            )}

            {/* Flavors */}
            {flavors.length > 0 && (
              <div className="mb-4">
                <h6 className="font-brandon-bold mb-2 text-brown">
                  {t("lblSelectFlavor")}
                </h6>
                <div className="d-flex gap-2 overflow-auto pb-2">
                  {flavors.map((flavor) => {
                    const flavorName = getLocalizedValue(flavor.name_en, flavor.name_ar, language);
                    return (
                      <button
                        key={flavor.id}
                        type="button"
                        onClick={() =>
                          setSelectedFlavor(
                            selectedFlavor?.id === flavor.id ? null : flavor
                          )
                        }
                        className={`border rounded-3 p-2 text-center bg-white flex-shrink-0 option-card ${
                          selectedFlavor?.id === flavor.id
                            ? "active border-2"
                            : "border-light"
                        }`}
                      >
                        {flavor.image_url && (
                          <img
                            src={flavor.image_url}
                            alt={flavorName}
                            className="object-fit-contain mx-auto d-block mb-1 size-60"
                          />
                        )}
                        <small className="d-block fw-semibold fs-12">
                          {flavorName}
                        </small>
                        {flavor.additional_price > 0 && (
                          <small className="text-muted fs-11">
                            +{flavor.additional_price} SR
                          </small>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Ice Cream Portion Sizes */}
            {portionSizes.length > 0 && (
              <div className="mb-4">
                <h6 className="font-brandon-bold mb-2 text-brown">
                  {t("lblSelectPortionSize")}
                </h6>
                <div className="d-flex gap-2 overflow-auto pb-2">
                  {portionSizes.map((portion) => {
                    const portionName = getLocalizedValue(portion.name_en, portion.name_ar, language);
                    return (
                      <button
                        key={portion.id}
                        type="button"
                        onClick={() => setSelectedPortionSize(portion)}
                        className={`border rounded-3 p-2 text-center bg-white flex-shrink-0 option-card ${
                          selectedPortionSize?.id === portion.id
                            ? "active border-2"
                            : "border-light"
                        }`}
                      >
                        {portion.image_url && (
                          <img
                            src={portion.image_url}
                            alt={portionName}
                            className="object-fit-contain mx-auto d-block mb-1 size-60"
                          />
                        )}
                        <small className="d-block fw-semibold fs-12">
                          {portionName}
                        </small>
                        {portion.additional_price > 0 && (
                          <small className="text-muted fs-11">
                            +{portion.additional_price} SR
                          </small>
                        )}
                      </button>
                    );
                  })}
                </div>
                {selectedPortionSize?.calories && (
                  <small className="text-muted mt-1 d-block">
                    {t("lblCalories")}: {selectedPortionSize.calories}
                  </small>
                )}
              </div>
            )}

            {/* Price */}
            <h2 className="font-brandon-bold mb-3 text-brand-pink fs-fluid-38">
              {calculatedPrice.toFixed(2)}
              <span className="fs-20"> SR</span>
            </h2>

            {/* Add text to cake (not for ice cream) */}
            {!isIceCream && (
              <div className="mb-3">
                <label htmlFor="cakeText" className="form-label font-brandon-bold small text-brown">
                  {t("lblAddTextToCake")}
                </label>
                <input
                  type="text"
                  id="cakeText"
                  className="form-control rounded-3"
                  placeholder={t("lblCakeTextPlaceholder")}
                  value={cakeText}
                  onChange={(e) => setCakeText(e.target.value)}
                  maxLength={50}
                />
                <label htmlFor="cakeNote" className="form-label font-brandon-bold small mt-2 text-brown">
                  {t("lblAdditionalNote")}
                </label>
                <textarea
                  id="cakeNote"
                  className="form-control rounded-3"
                  rows={2}
                  placeholder={t("lblSpecialInstructions")}
                  value={cakeNote}
                  onChange={(e) => setCakeNote(e.target.value)}
                />
              </div>
            )}

            {/* Pre-order / special-day messaging (WP special-day-products) */}
            {specialDay.configured && specialDay.inWindow && (
              <div className="alert alert-light border text-brand-brown mb-3 py-2 px-3">
                <i className="bi bi-star-fill me-2 text-warning" aria-hidden="true" />
                {t("lblPreOrdersOpenFrom", "Pre-orders open from")}{" "}
                {formatSpecialDayLabel(specialDay.start, language)}{" "}
                {t("lblTo", "to")}{" "}
                {formatSpecialDayLabel(specialDay.end, language)}
                {t("lblReserveYoursNow", "! Reserve yours now")}
              </div>
            )}
            {specialDay.configured && !specialDay.inWindow && (
              <div className="alert alert-secondary mb-3 py-2 px-3">
                {t(
                  "lblSpecialDayUnavailableBetween",
                  "This product will be available between",
                )}{" "}
                <strong>
                  {formatSpecialDayLabel(specialDay.start, language)}
                </strong>{" "}
                {t("lblAnd", "and")}{" "}
                <strong>
                  {formatSpecialDayLabel(specialDay.end, language)}
                </strong>
                .
              </div>
            )}

            {!inStock && (
              <div className="alert alert-secondary mb-3 py-2 px-3">
                {t("lblOutOfStock", "This product is currently out of stock.")}
              </div>
            )}

            {/* Add to Cart + Quantity */}
            {canAddToCart && (
              <div className="d-flex flex-wrap align-items-center gap-3 my-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  className="btn add-to-cart-btn storefront-product-btn w-160px"
                >
                  {isAddingToCart ? t("lblAddingToCart") : t("lblAddToCart")}
                </button>
                <div className="d-flex align-items-center bg-light rounded-5 px-2 py-1">
                  <button
                    type="button"
                    className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center size-36"
                    aria-label={t("lblDecreaseQuantity")}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </button>
                  <span className="mx-3 fs-5 fw-semibold">{quantity}</span>
                  <button
                    type="button"
                    className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center size-36"
                    aria-label={t("lblIncreaseQuantity")}
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="border-bottom pb-2 mt-4">
              <ul className="nav nav-underline">
                {tabs.map((tab) => (
                  <li key={tab.key} className="nav-item">
                    <button
                      type="button"
                      className={`nav-link ${activeTab === tab.key ? "active" : ""}`}
                      onClick={() => setActiveTab(tab.key)}
                    >
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-3 text-dark">
              {activeTab === "description" && (
                <p>{productDescription || t("lblNoDescriptionAvailable")}</p>
              )}
              {activeTab === "calories" && (
                <p>{selectedSize?.calories || selectedPortionSize?.calories || t("lblCalorieInformationUnavailable")}</p>
              )}
              {activeTab === "allergens" && (
                <p>{t("lblAllergenInformationUnavailable")}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
      <div className="bg-related-light">
        <div className="container py-5">
          <h2 className="font-brandon-bold mb-5 text-brown">
            {t("lblYouMayAlsoLike")}
          </h2>
          <div className="row row-cols-2 row-cols-sm-3 row-cols-lg-5 storefront-product-grid g-3">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} language={language} />
            ))}
          </div>
        </div>
      </div>
      )}

      {showReceivingModal && (
        <DeliveryPickupModal
          branches={product.branches || []}
          language={language}
          productId={product?.id}
          productType="ready_products"
          pickupOnly={product.pickup_only}
          onClose={() => setShowReceivingModal(false)}
          onConfirm={async () => {
            setShowReceivingModal(false);
            await addProductToCart();
          }}
        />
      )}
    </div>
  );
}
