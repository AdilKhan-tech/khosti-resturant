"use client";

import React, { useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  applyCartCouponRoute,
  deleteCartItemRoute,
  emptyCartRoute,
  removeCartCouponRoute,
  selectCartFreeProductRoute,
  updateCartItemRoute,
} from "@/utils/apiRoutes";
import apiKeyMapping from "@/configs/apiKeyMapping";
import { useRouter } from "next/navigation";
import { notifyCartUpdated } from "@/utils/cartEvents";
import ProductCard from "@/components/frontend/ProductCard";
import { getLocalizedLabel, getLocalizedValue } from "@/utils/localizedContent";

const EMPTY_CART = {
  total: 0,
  sub_total: 0,
  discount: 0,
  tax: 0,
  currency: "SR",
  coupon: null,
  data: [],
};

function persistCartUserId(userId) {
  window.localStorage.setItem("marble_cart_user_id", userId);
  document.cookie = `marble_cart_user_id=${encodeURIComponent(userId)}; path=/; max-age=31536000; samesite=lax`;
}

function getCartUserId(initialUserId) {
  let userId = initialUserId || window.localStorage.getItem("marble_cart_user_id");
  if (!userId) {
    userId = `guest-${window.crypto?.randomUUID ? window.crypto.randomUUID() : Date.now()}`;
  }
  persistCartUserId(userId);
  return userId;
}

function getApiHeaders() {
  const hostname = typeof window === "undefined" ? "localhost" : window.location.hostname;
  return { "X-API-KEY": apiKeyMapping[hostname] || apiKeyMapping.localhost };
}

function formatMoney(value, currency = "SR") {
  return `${Number(value || 0).toFixed(2)} ${currency}`;
}

function optionName(option, language) {
  if (!option) return "";
  if (typeof option === "string" || typeof option === "number") return String(option);
  return getLocalizedValue(option.name_en || option.slug, option.name_ar, language);
}

function optionNames(items, language) {
  return Array.isArray(items)
    ? items.map((item) => optionName(item, language)).filter(Boolean).join(", ")
    : "";
}

function itemName(item, language) {
  return getLocalizedValue(item?.name_en, item?.name_ar, language);
}

function itemMeta(item, language, t) {
  const options = item.options || {};
  const cakeSize = options.cake_size || options.product_size;
  const cakeFlavor = options.cake_flavor || options.product_flavor;
  const iceSize = options.ice_size || options.product_portion_size;
  const cookiesItems = Array.isArray(options.cookies_items) ? options.cookies_items : [];
  const cookies = cookiesItems.map((cookie) => `${optionName(cookie, language)}: ${cookie.quantity} ${t("lblPieceShort")}`).join(", ");
  const rows = [];
  if (optionName(options.cake_type, language)) rows.push(`${t("lblCakeType")}: ${optionName(options.cake_type, language)}`);
  if (optionName(cakeSize, language)) rows.push(`${t("lblCakeSize")}: ${optionName(cakeSize, language)}`);
  if (optionName(cakeFlavor, language)) rows.push(`${t("lblCakeFlavor")}: ${optionName(cakeFlavor, language)}`);
  if (optionName(iceSize, language)) rows.push(`${t("lblPortionSize")}: ${optionName(iceSize, language)}`);
  if (optionName(options.cookies_box_type_option, language) || options.cookies_box_type) {
    rows.push(`${t("lblBoxType")}: ${optionName(options.cookies_box_type_option, language) || options.cookies_box_type}`);
  }
  if (optionName(options.cookies_box_size_option, language) || options.cookies_box_size) {
    rows.push(`${t("lblBoxSize")}: ${optionName(options.cookies_box_size_option, language) || options.cookies_box_size}`);
  }
  if (cookies) rows.push(`${t("lblCookies")}: ${cookies}`);
  else if (options.cookies) rows.push(`${t("lblCookies")}: ${options.cookies}`);
  if (optionName(options.icecream_bucket_option, language)) rows.push(`${t("lblBucketSize")}: ${optionName(options.icecream_bucket_option, language)}`);
  if (optionNames(options.icecream_flavor_items, language)) rows.push(`${t("lblFlavors")}: ${optionNames(options.icecream_flavor_items, language)}`);
  if (optionNames(options.icecream_mixin_items, language)) rows.push(`${t("lblMixins")}: ${optionNames(options.icecream_mixin_items, language)}`);
  if (optionNames(options.icecream_sauce_items, language)) rows.push(`${t("lblSauces")}: ${optionNames(options.icecream_sauce_items, language)}`);
  if (options.product_text || options.cake_text) rows.push(`${t("lblText")}: ${options.product_text || options.cake_text}`);
  if (options.product_notes || options.product_note || options.cake_note) {
    rows.push(`${t("lblNote")}: ${options.product_notes || options.product_note || options.cake_note}`);
  }
  if (options.sketch_url) rows.push(`${t("lblSketch")}: ${t("lblUploaded")}`);
  return rows;
}

export default function CartClient({
  initialCart = EMPTY_CART,
  initialUserId = "",
  addOnProducts = [],
  language = "en",
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponBusy, setCouponBusy] = useState(false);
  const [couponError, setCouponError] = useState("");
  const cart = initialCart;
  const t = (labelKey, fallback) => getLocalizedLabel(labelKey, language, fallback);

  const applyCoupon = async () => {
    setCouponError("");
    setCouponBusy(true);
    try {
      const response = await axios.post(
        applyCartCouponRoute,
        { user_id: getCartUserId(initialUserId), code: couponCode },
        { headers: getApiHeaders() },
      );
      notifyCartUpdated(response.data);
      setCouponCode("");
      setMessage(t("lblCouponApplied", "Coupon applied successfully."));
      router.refresh();
    } catch (error) {
      setCouponError(
        error?.response?.data?.message ||
          t("lblCouponInvalid", "Unable to apply this coupon."),
      );
    } finally {
      setCouponBusy(false);
    }
  };

  const removeCoupon = async () => {
    setCouponError("");
    setCouponBusy(true);
    try {
      const response = await axios.delete(removeCartCouponRoute, {
        headers: getApiHeaders(),
        data: { user_id: getCartUserId(initialUserId) },
      });
      notifyCartUpdated(response.data);
      setMessage(t("lblCouponRemoved", "Coupon removed."));
      router.refresh();
    } catch (error) {
      setCouponError(
        error?.response?.data?.message ||
          t("lblCouponRemoveFailed", "Unable to remove this coupon."),
      );
    } finally {
      setCouponBusy(false);
    }
  };

  const selectFreeProduct = async (productId) => {
    const response = await axios.post(
      selectCartFreeProductRoute,
      { user_id: getCartUserId(initialUserId), product_id: productId },
      { headers: getApiHeaders() },
    );
    notifyCartUpdated(response.data);
    setMessage(t("lblFreeProductSelected", "Free product added to your cart."));
    router.refresh();
  };

  const updateQuantity = async (item, quantity) => {
    if (item.options?.free_product) return;
    const response = await axios.put(
      updateCartItemRoute,
      { user_id: getCartUserId(initialUserId), id: item.id, quantity },
      { headers: getApiHeaders() },
    );
    notifyCartUpdated(response.data);
    router.refresh();
  };

  const removeItem = async (item) => {
    const response = await axios.delete(deleteCartItemRoute, {
      headers: getApiHeaders(),
      data: { user_id: getCartUserId(initialUserId), id: item.id },
    });
    notifyCartUpdated(response.data);
    router.refresh();
  };

  const emptyCart = async () => {
    const response = await axios.delete(emptyCartRoute, {
      headers: getApiHeaders(),
      data: { user_id: getCartUserId(initialUserId) },
    });
    notifyCartUpdated(response.data);
    setMessage(t("lblCartEmptiedSuccessfully"));
    router.refresh();
  };

  return (
    <div className="container py-4">
      {message && (
        <div className="top-alert border border-secondary rounded-3 bg-light d-flex flex-wrap justify-content-between align-items-center px-3 py-2 mb-4 gap-2 fs-14">
          <span>{message}</span>
          <Link href="/product-category/cakes">{t("lblContinueShopping")}</Link>
        </div>
      )}

      <h1 className="font-brandon-bold mb-4 text-brown fs-35">{t("lblMyCart")}</h1>

      {cart.data.length > 0 && (
        <div className="d-flex flex-wrap gap-2 mb-4 align-items-center">
          <input
            className="form-control cart-coupon-input"
            placeholder={t("lblCouponCode")}
            aria-label={t("lblCouponCode")}
            value={couponCode}
            onChange={(event) => setCouponCode(event.target.value)}
            disabled={couponBusy || Boolean(cart.coupon)}
          />
          {cart.coupon ? (
            <button
              className="btn py-1 px-3 rounded-5 text-white fw-bold bg-brand-teal"
              type="button"
              onClick={removeCoupon}
              disabled={couponBusy}
            >
              {t("lblRemoveCoupon", "Remove coupon")}
            </button>
          ) : (
            <button
              className="btn py-1 px-3 rounded-5 text-white fw-bold bg-brand-pink"
              type="button"
              onClick={applyCoupon}
              disabled={couponBusy || !couponCode.trim()}
            >
              {t("lblApplyCoupon")}
            </button>
          )}
          <button
            className="btn py-1 px-3 rounded-5 text-white fw-bold bg-brand-teal"
            type="button"
            onClick={() => router.refresh()}
          >
            {t("lblUpdateCart")}
          </button>
          {couponError && <span className="text-danger w-100">{couponError}</span>}
          {cart.coupon && (
            <span className="text-success w-100">
              {t("lblCoupon")}: {cart.coupon.code}
              {cart.coupon.discount
                ? ` (−${formatMoney(cart.coupon.discount, cart.currency)})`
                : ""}
            </span>
          )}
        </div>
      )}

      {Array.isArray(cart.eligible_free_products) &&
        cart.eligible_free_products.length > 1 &&
        !cart.selected_free_product_id && (
          <div className="border rounded-4 p-3 mb-4 bg-white">
            <h2 className="fs-20 fw-bold mb-3">
              {t("lblChooseFreeProduct", "Choose your free product")}
            </h2>
            <div className="row g-3">
              {cart.eligible_free_products.map((product) => (
                <div className="col-6 col-md-3" key={product.id}>
                  <button
                    type="button"
                    className="btn w-100 border rounded-3 p-2 text-start"
                    onClick={() => selectFreeProduct(product.id)}
                  >
                    <img
                      src={product.image || "/assets/images/placeholder.png"}
                      alt={itemName(product, language)}
                      className="w-100 rounded-3 mb-2 object-fit-cover"
                      style={{ height: 96 }}
                    />
                    <span className="d-block fw-semibold color-brown">
                      {itemName(product, language)}
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      {cart.data.length === 0 ? (
        <div className="pb-5 d-flex flex-column justify-content-center align-items-center text-center">
          <img
            className="empty-cart-image"
            src="/assets/images/empty-cart.png"
            alt={t("lblEmptyCartAlt")}
          />
          <div className="my-3 pb-2">
            <h3 className="fs-30 text-light-dark font-brandon-bold">{t("lblEmptyCartTitle")}</h3>
            <h3 className="fs-20 text-brown-50 font-brandon-bold">{t("lblEmptyCartSubtitle")}</h3>
          </div>
          <Link href="/product-category/cakes" className="btn bg-pink text-white rounded-5 font-brandon-bold fs-20">
            {t("lblViewCatalog")}
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-12 col-lg-8">
            {cart.data.map((item) => (
              <div key={item.id} className="cart-box p-3 mb-3 bg-white rounded-4 border border-light">
                <div className="d-flex flex-wrap align-items-start gap-3">
                  <img
                    src={item.image || "/assets/images/placeholder.png"}
                    className="rounded-3 object-fit-cover size-100"
                    alt={itemName(item, language)}
                  />

                  <div className="flex-fill">
                    <span className="fw-semibold d-block mb-2 color-brown">
                      {itemName(item, language)}
                      {item.options?.free_product ? ` (${t("lblFree", "Free")})` : ""}
                    </span>
                    {itemMeta(item, language, t).map((meta) => (
                      <small key={meta} className="d-block text-muted">
                        {meta}
                      </small>
                    ))}
                    {!item.options?.free_product && (
                    <div className="qty d-flex align-items-center bg-light rounded-5 px-2 py-1 mt-2 w-fit">
                      <button
                        type="button"
                        className="rounded-circle border-0 size-32"
                        aria-label={t("lblDecreaseQuantity")}
                        onClick={() => updateQuantity(item, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span className="mx-2">{item.quantity}</span>
                      <button
                        type="button"
                        className="rounded-circle border-0 size-32"
                        aria-label={t("lblIncreaseQuantity")}
                        onClick={() => updateQuantity(item, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    )}
                  </div>

                  <div className="d-flex align-items-center gap-3">
                    <span className="cart-price fw-bold">
                      {item.options?.free_product
                        ? t("lblFree", "Free")
                        : formatMoney(item.final_price, cart.currency)}
                    </span>
                    <button
                      className="btn p-0 border-0"
                      aria-label={t("lblRemoveItem")}
                      type="button"
                      onClick={() => removeItem(item)}
                    >
                      <i className="bi bi-trash fs-4 cart-delete" aria-hidden="true"></i>
                    </button>
                  </div>
                </div>

                <div className="cart-dashed mt-3"></div>
              </div>
            ))}

            <div className="d-flex flex-wrap justify-content-between gap-2">
              <button className="btn btn-pink-outline rounded-5 px-3" type="button" onClick={emptyCart}>
                {t("lblEmptyCart")}
              </button>
              <Link
                href="/product-category/cakes"
                className="btn fw-bold text-white rounded-5 px-3 bg-brand-teal"
              >
                {t("lblContinueShopping")}
              </Link>
            </div>
          </div>

          <div className="col-12 col-lg-4">
            <div className="cart-summary rounded-4 p-4">
              <h6 className="mb-3 fw-bold">{t("lblSummary")}</h6>

              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-normal">{t("lblSubtotal")}</span>
                <span>{formatMoney(cart.sub_total, cart.currency)}</span>
              </div>

              {Number(cart.discount) > 0 && (
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-normal">{t("lblDiscount")}</span>
                  <span>−{formatMoney(cart.discount, cart.currency)}</span>
                </div>
              )}
              {Array.isArray(cart.promotions) &&
                cart.promotions
                  .filter((promo) => Number(promo.amount) > 0)
                  .map((promo) => (
                    <div
                      key={`${promo.rule_type}-${promo.label}`}
                      className="d-flex justify-content-between align-items-center mb-2 small text-muted"
                    >
                      <span>{promo.label}</span>
                      <span>−{formatMoney(promo.amount, cart.currency)}</span>
                    </div>
                  ))}

              <div className="cart-summary-line"></div>

              <div className="d-flex justify-content-between mt-2">
                <span className="fw-bold">{t("lblTotal")}</span>
                <b>{formatMoney(cart.total, cart.currency)}</b>
              </div>

              <Link href="/checkout"
                className="btn rounded-5 text-white fw-bold w-100 mt-4 bg-brand-pink">
                {t("lblProceedToCheckout")}
              </Link>
            </div>
          </div>
        </div>
      )}

      {addOnProducts.length > 0 && (
        <div className="rounded-4 bg-light mt-5 p-3 p-md-4">
          <h2 className="font-brandon-bold mb-4 text-brown">{t("lblAddOnsItems")}</h2>

          <div className="row g-3 text-center">
            {addOnProducts.map((item) => (
              <ProductCard
                key={item.id || item.slug}
                product={item}
                buttonLabel={t("lblAddToCart")}
                wrapperClassName="col-6 col-md-3"
                showMeta={false}
                language={language}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
