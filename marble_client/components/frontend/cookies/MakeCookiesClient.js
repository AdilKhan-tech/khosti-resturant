"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { addCartItemRoute } from "@/utils/apiRoutes";
import apiKeyMapping from "@/configs/apiKeyMapping";
import DeliveryPickupModal, { getSavedReceivingInfo } from "@/components/frontend/product/DeliveryPickupModal";
import { notifyCartUpdated } from "@/utils/cartEvents";
import { getLocalizedLabel, getLocalizedValue } from "@/utils/localizedContent";

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

function getApiHeaders() {
  const hostname = typeof window === "undefined" ? "localhost" : window.location.hostname;
  return { "X-API-KEY": apiKeyMapping[hostname] || apiKeyMapping.localhost };
}

export default function MakeCookiesClient({ cookieTypes = [], baseProduct = null, language = "en" }) {
  const router = useRouter();
  const t = (labelKey, fallback) => getLocalizedLabel(labelKey, language, fallback);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [cookieQuantities, setCookieQuantities] = useState({});
  const [errors, setErrors] = useState([]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showReceivingModal, setShowReceivingModal] = useState(false);

  const availableSizes = selectedType?.sizes || [];
  const availableCookies = selectedType?.cookies || [];

  const maxCookiesAllowed = useMemo(() => {
    if (!selectedSize) return 0;
    const count = Number(selectedSize.portion_size) || 0;
    return count > 0 ? Math.floor(count) : 0;
  }, [selectedSize]);

  const selectedQuantity = useMemo(() => {
    return Object.values(cookieQuantities).reduce((sum, qty) => sum + qty, 0);
  }, [cookieQuantities]);

  const handleSelectType = (type) => {
    setSelectedType(type);
    setSelectedSize(null);
    setCookieQuantities({});
    setErrors([]);
  };

  const handleSelectSize = (size) => {
    setSelectedSize(size);
    setCookieQuantities({});
    setErrors([]);
  };

  const getCookieQty = (cookieId) => cookieQuantities[cookieId] || 0;

  const adjustQuantity = (cookie, delta) => {
    const current = getCookieQty(cookie.id);
    const newQty = current + delta;
    if (newQty < 0) return;

    const otherTotal = selectedQuantity - current;
    if (newQty > 0 && otherTotal + newQty > maxCookiesAllowed) {
      setErrors([t("lblCannotExceedCookies").replace("{max}", maxCookiesAllowed)]);
      return;
    }

    setErrors([]);
    setCookieQuantities((prev) => {
      const next = { ...prev };
      if (newQty === 0) {
        delete next[cookie.id];
      } else {
        next[cookie.id] = newQty;
      }
      return next;
    });
  };

  const subtotal = selectedSize ? parseFloat(selectedSize.price) || 0 : 0;

  const summaryCookieLines = availableCookies
    .filter((c) => getCookieQty(c.id) > 0)
    .map((c) => ({ label: getLocalizedValue(c.name_en, c.name_ar, language), qty: getCookieQty(c.id) }));

  const validateSelections = () => {
    const nextErrors = [];

    if (!baseProduct?.id) nextErrors.push(t("lblCookieProductUnavailable"));
    if (!selectedType) nextErrors.push(t("lblSelectBoxTypeError"));
    if (!selectedSize) nextErrors.push(t("lblSelectBoxSizeError"));
    if (selectedQuantity !== maxCookiesAllowed) {
      nextErrors.push(
        t("lblSelectExactCookiesError")
          .replace("{max}", maxCookiesAllowed)
          .replace("{count}", selectedQuantity),
      );
    }

    setErrors(nextErrors);
    return nextErrors.length === 0;
  };

  const addCookiesToCart = async () => {
    if (!validateSelections()) return;

    setIsAddingToCart(true);
    try {
      const cookies = availableCookies
        .filter((cookie) => getCookieQty(cookie.id) > 0)
        .map((cookie) => ({
          id: cookie.id,
          name_en: cookie.name_en || "",
          name_ar: cookie.name_ar || "",
          slug: cookie.slug,
          quantity: getCookieQty(cookie.id),
        }));

      const response = await axios.post(
        addCartItemRoute,
        {
          user_id: getCartUserId(),
          product_id: baseProduct.id,
          product_type: "cookies",
          quantity: 1,
          cookies_items: cookies,
          cookies_box_type_option: {
            id: selectedType.id,
            name_en: selectedType.name_en || "",
            name_ar: selectedType.name_ar || "",
            slug: selectedType.slug,
          },
          cookies_box_size_option: {
            id: selectedSize.id,
            name_en: selectedSize.name_en || "",
            name_ar: selectedSize.name_ar || "",
            slug: selectedSize.slug,
            portion_size: maxCookiesAllowed,
            price: selectedSize.price,
          },
          custom_price: subtotal,
        },
        { headers: getApiHeaders() },
      );
      notifyCartUpdated(response.data);
      router.push("/cart");
    } catch {
      setErrors([t("lblUnableAddCookiesToCart")]);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToCart = async () => {
    if (!validateSelections()) return;

    if (!getSavedReceivingInfo()) {
      setShowReceivingModal(true);
      return;
    }

    await addCookiesToCart();
  };

  return (
    <div className="container">
        <div className="py-4 mb-4 d-flex align-items-center gap-3">
          <Link href="/">
            <img src="/assets/images/brown-arrow.png" alt={t("lblBack")} />
          </Link>
          <h2 className="font-brandon-black text-brown m-0 fs-fluid-50">
            {t("lblMakeYourOwnCookieBox")}
          </h2>
        </div>

        {errors.length > 0 && (
          <div className="alert alert-danger">
            <ul className="mb-0">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="row mt-4">
          <div className="col-md-8 mb-5">
            {/* Step 1: Box type */}
            <div className="mb-5">
              <h4 className="font-brandon-black text-brown fs-24 d-flex align-items-center">
                <span className="selectnum numar me-2 d-block text-center bg-brown-50 text-white rounded-circle">1</span>
                {t("lblSelectBoxType")}
              </h4>
              <div className="d-flex gap-3 mt-3 flex-wrap">
                {cookieTypes.map((type) => (
                  <div
                    key={type.id}
                    onClick={() => handleSelectType(type)}
                    className={`selectBox py-2 px-3 rounded-3 text-center d-flex flex-column justify-content-between cursor boxType w-160px ${
                      selectedType?.id === type.id ? "active" : ""
                    }`}
                    role="button"
                  >
                    <div className="pt-12px">
                      {type.image && (
                        <img
                          src={type.image}
                          alt={getLocalizedValue(type.name_en, type.name_ar, language)}
                          className="img-fluid img-max-h-80 object-fit-contain"
                        />
                      )}
                    </div>
                    <h6 className="font-brandon-bold text-brown mt-2 m-0 fs-20">
                      {getLocalizedValue(type.name_en, type.name_ar, language)}
                    </h6>
                  </div>
                ))}
                <Link
                  href="/diy"
                  className="selectBox py-2 px-3 rounded-3 text-center d-flex flex-column justify-content-between text-decoration-none boxType w-160px"
                >
                  <div className="pt-12px">
                    <img
                      src="/assets/images/DIY Cookie@300x.png"
                      alt={t("lblNavDiy")}
                      className="img-fluid img-max-h-80 object-fit-contain"
                    />
                  </div>
                  <h6 className="font-brandon-bold text-brown mt-2 m-0 fs-20">{t("lblNavDiy")}</h6>
                </Link>
              </div>
            </div>

            {/* Step 2: Box size */}
            {selectedType && availableSizes.length > 0 && (
              <div className="mb-5">
                <h4 className="font-brandon-black text-brown fs-24 d-flex align-items-center">
                  <span className="selectnum numar me-2 d-block text-center bg-brown-50 text-white rounded-circle">2</span>
                  {t("lblSelectBoxSize")}
                </h4>
                <div className="d-flex gap-3 mt-3 flex-wrap">
                  {availableSizes.map((size) => (
                    <div
                      key={size.id}
                      onClick={() => handleSelectSize(size)}
                      className={`selectBox py-2 px-3 rounded-3 text-center d-flex flex-column justify-content-between cursor boxSize w-160px ${
                        Number(selectedSize?.id) === Number(size.id) ? "active" : ""
                      }`}
                      role="button"
                    >
                      <div className="pt-12px">
                        {size.image && (
                          <img
                            src={size.image}
                            alt={getLocalizedValue(size.name_en, size.name_ar, language)}
                            className="img-fluid img-max-h-80 object-fit-contain"
                          />
                        )}
                      </div>
                      <div>
                        <h6 className="font-brandon-bold text-brown mt-2 m-0 fs-20">
                          {getLocalizedValue(size.name_en, size.name_ar, language)}
                        </h6>
                        <p className="m-0 text-muted small">
                          {size.portion_size ?? 0} {t("lblPieces")}
                        </p>
                        <p className="m-0 fw-bold text-muted mt-1 fs-14">
                          {size.symbol || "SAR"} {size.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Select cookies */}
            {selectedType && selectedSize && availableCookies.length > 0 && (
              <div>
                <h4 className="font-brandon-black text-brown fs-24 d-flex align-items-center">
                  <span className="selectnum numar me-2 d-block text-center bg-brown-50 text-white rounded-circle">3</span>
                  {t("lblSelectUpToCookies").replace("{max}", maxCookiesAllowed)}
                  <span className="ms-2 text-muted small">
                    ({selectedQuantity}/{maxCookiesAllowed} {t("lblCookiesSelected")})
                  </span>
                </h4>
                <div className="row g-3 mt-2">
                  {availableCookies.map((cookie) => {
                    const qty = getCookieQty(cookie.id);
                    const isSelected = qty > 0;
                    return (
                      <div key={cookie.id} className="col-6 col-md-4 col-lg-3">
                        <div
                          className={`card border-0 rounded-4 align-items-center p-2 p-md-3 selectcooki6 ${
                            isSelected ? "active border border-2" : ""
                          }`}
                        >
                          {cookie.image && (
                            <img
                              className="mt-2 rounded-4 img-fluid img-max-w-70"
                              src={cookie.image}
                              alt={getLocalizedValue(cookie.name_en, cookie.name_ar, language)}
                            />
                          )}
                          <div className="card-body text-center p-2">
                            <h6 className="color-brown fw-bold fs-14">{getLocalizedValue(cookie.name_en, cookie.name_ar, language)}</h6>
                            <div className="d-flex align-items-center justify-content-center gap-2 mt-2">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary rounded-circle quantity-down size-32"
                                onClick={() => adjustQuantity(cookie, -1)}
                                disabled={qty === 0}
                                aria-label={t("lblDecreaseQuantity")}
                              >
                                −
                              </button>
                              <span className="fw-bold">{qty}</span>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary rounded-circle quantity-up size-32"
                                onClick={() => adjustQuantity(cookie, 1)}
                                aria-label={t("lblIncreaseQuantity")}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="col-md-4">
            <h4 className="text-brown-50 fs-20">{t("lblSummary")}</h4>
            <div className="bg-light-white p-3 rounded-4">
              <div className="d-flex justify-content-between dashedline mb-3">
                <p className="text-brown-50 mb-0">{t("lblBoxType")}</p>
                <p className="color-brown fw-bold mb-0">
                  {selectedType ? getLocalizedValue(selectedType.name_en, selectedType.name_ar, language) : "—"}
                </p>
              </div>
              <div className="d-flex justify-content-between dashedline mb-3">
                <p className="text-brown-50 mb-0">{t("lblBoxSize")}</p>
                <p className="color-brown fw-bold mb-0">
                  {selectedSize ? getLocalizedValue(selectedSize.name_en, selectedSize.name_ar, language) : "—"}
                </p>
              </div>
              {summaryCookieLines.map((line, i) => (
                <div key={i} className="d-flex justify-content-between dashedline mb-2">
                  <p className="text-brown-50 mb-0 small">{line.label}</p>
                  <p className="color-brown fw-bold mb-0 small">{line.qty} {t("lblPieceShort")}</p>
                </div>
              ))}
              <div className="d-flex justify-content-between dashedline mb-4 mt-3">
                <p className="text-brown-50 mb-0">{t("lblSubtotal")}</p>
                <p className="color-brown fw-bold mb-0">{subtotal} SAR</p>
              </div>
              <button
                type="button"
                className="btn add-to-cart-btn w-100"
                onClick={handleAddToCart}
                disabled={isAddingToCart || !selectedType || !selectedSize || selectedQuantity !== maxCookiesAllowed || !baseProduct?.id}
              >
                {isAddingToCart ? t("lblAddingToCart") : t("lblAddToCart")}
              </button>
            </div>
          </div>
        </div>
        {showReceivingModal && (
          <DeliveryPickupModal
            branches={baseProduct?.branches || []}
            language={language}
            productId={baseProduct?.id || 433}
            productType="custom_products"
            onClose={() => setShowReceivingModal(false)}
            onConfirm={async () => {
              setShowReceivingModal(false);
              await addCookiesToCart();
            }}
          />
        )}
    </div>
  );
}

