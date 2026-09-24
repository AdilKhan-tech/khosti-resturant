"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DeliveryPickupModal from "@/components/frontend/product/DeliveryPickupModal";
import { createOrderRoute, emptyCartRoute, getShippingSettingsRoute, applyCartCouponRoute, removeCartCouponRoute, initiatePaymentRoute } from "@/utils/apiRoutes";
import { notifyCartUpdated } from "@/utils/cartEvents";
import { getLocalizedLabel, getLocalizedValue } from "@/utils/localizedContent";
import { getRiyadhDate } from "@/utils/riyadhDate";
import {
  checkoutShippingTotal,
  isFreeShippingEligible,
  parseShippingRules,
} from "@/utils/shipping";
import { clearBrandSku, getBrandSku } from "@/utils/brandSku";
import getApiKeyByDomain from "@/configs/getApiKey";

const EMPTY_RECEIVING_INFO = {
  address: "",
  branch_id: null,
  nearest_branch: "",
  shipping_cost: 0,
  shipping_distance: 0,
  address_type: "Delivery",
  selected_time_slot: "",
  selected_date: "",
  branch_city: "",
  recipient_name: "",
  recipient_phone: "",
  is_send_for_someone_checked: false,
  address_availability: "yes",
};

function money(value, currency = "SR") {
  return `${Number(value || 0).toFixed(2)} ${currency}`;
}

function formatDate(date) {
  if (!date) return "";
  const [year, month, day] = String(date).split("-");
  if (!year || !month || !day) return date;
  return `${day}-${month}-${year}`;
}

function slotStartDateTime(info) {
  if (!info?.selected_date || !info?.selected_time_slot) return null;
  const normalized = String(info.selected_time_slot).replace("—", "-");
  const [start] = normalized.split("-");
  if (!start) return null;

  const parsed = new Date(`${info.selected_date} ${start.trim()}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isTimeSlotExpired(info) {
  const start = slotStartDateTime(info);
  if (!start) return false;

  const today = getRiyadhDate();
  if (info.selected_date !== today) return false;

  return Date.now() > start.getTime() + 30 * 60 * 1000;
}

function checkoutPhoneFromSession(phoneNumber) {
  const digits = String(phoneNumber || "").replace(/\D/g, "");
  if (digits.startsWith("966")) return digits.slice(3);
  return digits;
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

function branchDisplayName(branchName, branches, language) {
  const branch = branches.find((item) => item.name_en === branchName);
  return branch ? getLocalizedValue(branch.name_en, branch.name_ar, language, branchName) : branchName;
}

function itemMeta(item, language, t) {
  const options = item.options || {};
  const cakeSize = options.cake_size || options.product_size;
  const cakeFlavor = options.cake_flavor || options.product_flavor;
  const iceSize = options.ice_size || options.product_portion_size;
  const cookiesItems = Array.isArray(options.cookies_items) ? options.cookies_items : [];
  const cookies = cookiesItems.map((cookie) => `${optionName(cookie, language)}: ${cookie.quantity} ${t("lblPieceShort")}`).join(", ");
  const rows = [];
  if (optionName(options.cake_type, language)) rows.push([t("lblCakeType"), optionName(options.cake_type, language)]);
  if (optionName(cakeSize, language)) rows.push([t("lblCakeSize"), optionName(cakeSize, language)]);
  if (optionName(cakeFlavor, language)) rows.push([t("lblCakeFlavor"), optionName(cakeFlavor, language)]);
  if (optionName(iceSize, language)) rows.push([t("lblPortionSize"), optionName(iceSize, language)]);
  if (optionName(options.cookies_box_type_option, language) || options.cookies_box_type) {
    rows.push([t("lblBoxType"), optionName(options.cookies_box_type_option, language) || options.cookies_box_type]);
  }
  if (optionName(options.cookies_box_size_option, language) || options.cookies_box_size) {
    rows.push([t("lblBoxSize"), optionName(options.cookies_box_size_option, language) || options.cookies_box_size]);
  }
  if (cookies) rows.push([t("lblCookies"), cookies]);
  else if (options.cookies) rows.push([t("lblCookies"), options.cookies]);
  if (optionName(options.icecream_bucket_option, language)) rows.push([t("lblBucketSize"), optionName(options.icecream_bucket_option, language)]);
  if (optionNames(options.icecream_flavor_items, language)) rows.push([t("lblFlavors"), optionNames(options.icecream_flavor_items, language)]);
  if (optionNames(options.icecream_mixin_items, language)) rows.push([t("lblMixins"), optionNames(options.icecream_mixin_items, language)]);
  if (optionNames(options.icecream_sauce_items, language)) rows.push([t("lblSauces"), optionNames(options.icecream_sauce_items, language)]);
  if (options.product_text || options.cake_text) rows.push([t("lblText"), options.product_text || options.cake_text]);
  if (options.product_notes || options.product_note || options.cake_note) {
    rows.push([t("lblNote"), options.product_notes || options.product_note || options.cake_note]);
  }
  if (options.sketch_url) rows.push([t("lblSketch"), t("lblUploaded")]);
  return rows;
}

function CheckoutRow({ label, value }) {
  return (
    <div className="d-flex justify-content-between align-items-start dashedline checkout-row mb-3">
      <p className="text-brown-50 fs-20 font-brandon-bold checkout-row-label">{label}</p>
      <p className="fs-20 font-brandon-bold text-end text-brown checkout-row-value">{value || "—"}</p>
    </div>
  );
}

export default function CheckoutClient({ initialCart, initialBranches, initialReceivingInfo, initialUserId, language = "en" }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const t = (labelKey, fallback) => getLocalizedLabel(labelKey, language, fallback);
  const [receivingInfo, setReceivingInfo] = useState(initialReceivingInfo || EMPTY_RECEIVING_INFO);
  const [showReceivingModal, setShowReceivingModal] = useState(false);
  const [billing, setBilling] = useState({
    full_name: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [shippingRules, setShippingRules] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponBusy, setCouponBusy] = useState(false);
  const [couponMessage, setCouponMessage] = useState("");
  const [cartState, setCartState] = useState(initialCart || { data: [], sub_total: 0, discount: 0, tax: 0, total: 0, currency: "SR", coupon: null });
  const cart = cartState;
  const branches = initialBranches || [];

  useEffect(() => {
    setCartState(
      initialCart || {
        data: [],
        sub_total: 0,
        discount: 0,
        tax: 0,
        total: 0,
        currency: "SR",
        coupon: null,
      },
    );
  }, [initialCart]);

  useEffect(() => {
    let cancelled = false;
    fetch(getShippingSettingsRoute, {
      headers: { "X-API-KEY": getApiKeyByDomain() },
      cache: "no-store",
    })
      .then((response) => {
        if (!response.ok) throw new Error("shipping settings request failed");
        return response.json();
      })
      .then((data) => {
        if (cancelled) return;
        const rules = parseShippingRules(data);
        if (rules) setShippingRules(rules);
      })
      .catch(() => {
        // No client fallbacks — totals use saved shipping until rules load;
        // Nest still recalculates on order create.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const cartItems = useMemo(() => cart.data || [], [cart.data]);
  const checkoutPickupOnly = useMemo(
    () => cartItems.some((item) => item.pickup_only === true),
    [cartItems],
  );
  const currency = cart.currency || "SR";
  const subTotal = Number(cart.sub_total || 0);
  const discountTotal = Number(cart.discount || 0);
  let shippingTotal = checkoutShippingTotal({
    addressType: receivingInfo.address_type,
    subtotal: subTotal,
    shippingCost: receivingInfo.shipping_cost,
    rules: shippingRules,
  });
  if (cart.coupon?.free_shipping) {
    shippingTotal = 0;
  }
  const shouldShowShipping = shippingTotal > 0;
  const showFreeDelivery =
    receivingInfo.address_type === "Delivery" &&
    (cart.coupon?.free_shipping || isFreeShippingEligible(subTotal, shippingRules));
  const taxTotal = Number(cart.tax || 0);
  const orderTotal = Math.max(0, subTotal - discountTotal) + shippingTotal + taxTotal;
  const hasReceivingInfo = Boolean(
    receivingInfo.address &&
      receivingInfo.selected_time_slot &&
      receivingInfo.selected_date &&
      (!checkoutPickupOnly || receivingInfo.address_type === "Pickup"),
  );
  const expiredSlot = isTimeSlotExpired(receivingInfo);
  const isAuthenticated = status === "authenticated";
  const isAuthLoading = status === "loading";
  const sessionUser = session?.user || {};
  const sessionName = sessionUser.full_name || "";
  const sessionPhone = checkoutPhoneFromSession(sessionUser.phone_number);
  const billingFullName = billing.full_name || sessionName;
  const billingPhone = billing.phone || sessionPhone;
  const checkoutOrderNumber = cartItems.find((item) => item.order_number)?.order_number || "";

  const productIds = useMemo(
    () => cartItems.map((item) => item.product_id).filter(Boolean).join(","),
    [cartItems],
  );
  const checkoutSlotProductType = useMemo(
    () =>
      cartItems.some((item) => {
        const type = String(item.product_type || "").toLowerCase();
        return type.startsWith("custom") || type === "cookies";
      })
        ? "custom_products"
        : "ready_products",
    [cartItems],
  );

  useEffect(() => {
    if (
      checkoutPickupOnly &&
      receivingInfo.address_type !== "Pickup"
    ) {
      setShowReceivingModal(true);
    }
  }, [checkoutPickupOnly, receivingInfo.address_type]);

  const updateBilling = (field, value) => {
    setBilling((current) => ({
      ...current,
      [field]: field === "phone" ? value.replace(/\D/g, "").replace(/\s+/g, "") : value,
    }));
  };

  const openLoginPopup = () => {
    if (typeof window === "undefined") return;

    const modalElement = document.getElementById("myModal");
    if (modalElement && window.bootstrap?.Modal) {
      window.bootstrap.Modal.getOrCreateInstance(modalElement).show();
      return;
    }

    document.querySelector('[data-bs-target="#myModal"]')?.click();
  };

  useEffect(() => {
    if (status === "unauthenticated" && cartItems.length > 0) {
      openLoginPopup();
    }
  }, [status, cartItems.length]);

  const validateBilling = () => {
    const nextErrors = {};
    if (!billingFullName.trim()) {
      nextErrors.full_name = t("lblEnterFullNameError");
    }
    if (!/^\d{9,10}$/.test(billingPhone)) {
      nextErrors.phone = t("lblValidPhoneError");
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${session?.user?.accessToken || ""}`,
  });

  const clearCheckoutStorage = async () => {
    if (initialUserId) {
      try {
        const response = await fetch(emptyCartRoute, {
          method: "DELETE",
          headers: authHeaders(),
          body: JSON.stringify({ user_id: initialUserId }),
        });
        const json = await response.json().catch(() => ({}));
        if (response.ok) {
          notifyCartUpdated(json);
        }
      } catch {
        // Redirect should not be blocked by cart cleanup.
      }
    }

    window.localStorage.removeItem("marble_receiving_info");
    document.cookie = "marble_receiving_info=; path=/; max-age=0; samesite=lax";
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();
    setNotice("");

    if (!isAuthenticated) {
      openLoginPopup();
      setNotice(t("lblLoginBeforeOrder"));
      return;
    }

    if (!hasReceivingInfo || expiredSlot) {
      setShowReceivingModal(true);
      return;
    }

    if (!validateBilling()) return;

    setIsPlacingOrder(true);
    try {
      const orderPayload = {
        order_number: checkoutOrderNumber,
        language,
        cart_user_id: initialUserId,
        brand_sku: getBrandSku(),
        billing: {
          full_name: billingFullName,
          phone: billingPhone,
        },
        receiving_info: receivingInfo,
        items: cartItems,
        currency,
        payment_method: paymentMethod,
        totals: {
          subtotal: subTotal,
          discount: discountTotal,
          coupon_code: cart.coupon?.code || "",
          shipping: shippingTotal,
          tax: taxTotal,
          total: orderTotal,
          currency,
        },
      };

      const response = await fetch(createOrderRoute, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(orderPayload),
      });
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || t("lblCreateOrderError"));
      }

      if (paymentMethod === "myfatoorah") {
        const payRes = await fetch(initiatePaymentRoute, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            orderNumber: json.data.order_number,
            amount: orderTotal,
            customerName: billingFullName,
            customerMobile: billingPhone,
          }),
        });
        const payJson = await payRes.json();
        const invoiceUrl = payJson?.data?.invoiceUrl ?? payJson?.invoiceUrl;

        if (!payRes.ok || !invoiceUrl) {
          throw new Error(t("lblPaymentInitFailed", "Unable to start payment. Please try again."));
        }
        window.location.href = invoiceUrl;
        return;
      }


      await clearCheckoutStorage();
      clearBrandSku();
      router.push(json.data.redirect_url);
    } catch (error) {
      setNotice(error.message || t("lblCreateOrderError"));
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const showAddress = !receivingInfo.is_send_for_someone_checked || receivingInfo.address_availability === "yes";

  return (
    <div className="checkout-page bg-light-green py-4 font-brandon">
      <div className="container">
        <div className="py-3">
          <h2 className="fs-35 font-brandon-bold d-flex align-items-center text-brown mb-0">
            <Link href="/cart" className="checktxt me-2 text-decoration-none text-brown" aria-label={t("lblBackToCart")}>
              <i className="bi bi-arrow-left-circle"></i>
            </Link>
            {t("lblCheckout")}
          </h2>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-4 p-5 text-center">
            <h3 className="text-brown font-brandon-bold">{t("lblYourCartIsEmpty")}</h3>
            <Link href="/product-category/cakes" className="btn add-to-cart-btn mt-3">
              {t("lblContinueShopping")}
            </Link>
          </div>
        ) : (
          <>
            <form className="checkout woocommerce-checkout" onSubmit={handlePlaceOrder}>
              <div className="row">
                <div className="col-md-8 pe-md-4">
                  <div className="d-flex justify-content-between my-3">
                    <div className="w-100">
                      <div className="d-flex justify-content-between align-items-center p-0 mob-res-btm">
                        <h3 className="m-0 flex-grow-1 fs-25 font-brandon-medium checkout-section-title">{t("lblReceiving")}</h3>
                        <div className="d-flex mb-3 p-0 justify-content-center delivery-button checkdelivbtn">
                          {["Delivery", "Pickup"].map((type) => (
                            <button
                              key={type}
                              type="button"
                              data-product-id={productIds}
                              className={`nav-link py-2 fs-16 font-brandon-bold d-flex justify-content-center gap-1 tab-button ${receivingInfo.address_type === type ? "active" : ""}`}
                              onClick={() => setShowReceivingModal(true)}
                            >
                              <span>{type === "Pickup" ? t("lblPickup") : t("lblDelivery")}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="tab-content bg-white rounded-3 pickup-mob-none">
                        <div className="col-md-12 d-inline-block w-100 rounded-12 p-sm-5 pb-sm-4 p-3">
                          <div className="pb-4 d-flex justify-content-between align-items-center">
                            <h3 className="text-light-dark fs-20 font-brandon-bold mb-0">
                              {hasReceivingInfo
                                ? (receivingInfo.address_type === "Pickup" ? t("lblPickupDetails") : t("lblDeliveryDetails"))
                                : t("lblSelectReceivingType")}
                            </h3>
                            <button
                              type="button"
                              data-product-id={productIds}
                              className="text-pink fs-20 font-brandon-bold bg-transparent border-0"
                              onClick={() => setShowReceivingModal(true)}
                            >
                              {hasReceivingInfo ? t("lblEdit") : t("lblAdd")}
                            </button>
                          </div>

                          <div className="address mt-2">
                            {showAddress && <CheckoutRow label={t("lblAddress")} value={receivingInfo.address} />}
                            <CheckoutRow label={t("lblCity")} value={receivingInfo.branch_city} />
                            <CheckoutRow label={t("lblBranch")} value={branchDisplayName(receivingInfo.nearest_branch, branches, language)} />
                            <CheckoutRow label={t("lblTimeSlot")} value={receivingInfo.selected_time_slot} />
                            <CheckoutRow label={t("lblDate")} value={formatDate(receivingInfo.selected_date)} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div id="billing-container">
                    <h4 className="fs-25 font-brandon-medium my-3 mt-4 checkout-section-title">
                      {receivingInfo.is_send_for_someone_checked ? t("lblSenderInfo") : t("lblRecipientData")}
                    </h4>
                    {isAuthenticated ? (
                      <div className="col2-set bg-white rounded-4 border-0 checkout-card" id="customer_details">
                        <div className="row g-3">
                          <div className="col-md-12">
                            <label htmlFor="billing_full_name" className="form-label fs-16 font-brandon-bold text-brown">
                              {t("lblFullName")} <span className="text-danger">*</span>
                            </label>
                            <input
                              id="billing_full_name"
                              className={`form-control checkout-input rounded-3 py-2 ${errors.full_name ? "is-invalid" : ""}`}
                              value={billingFullName}
                              onChange={(event) => updateBilling("full_name", event.target.value)}
                              onBlur={() => validateBilling()}
                            />
                            {errors.full_name && <span className="text-danger small">{errors.full_name}</span>}
                          </div>
                          <div className="col-md-12">
                            <label htmlFor="billing_phone" className="form-label fs-16 font-brandon-bold text-brown">
                              {t("lblPhone")} <span className="text-danger">*</span>
                            </label>
                            <div className="input-group">
                              <span className="input-group-text checkout-input rounded-start-3 border-0 font-brandon-bold">+966</span>
                              <input
                                id="billing_phone"
                                className={`form-control checkout-input rounded-end-3 py-2 ${errors.phone ? "is-invalid" : ""}`}
                                value={billingPhone}
                                onChange={(event) => updateBilling("phone", event.target.value)}
                                onBlur={() => validateBilling()}
                                inputMode="numeric"
                              />
                            </div>
                            {errors.phone && <span className="text-danger small">{errors.phone}</span>}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div id="login-container">
                        <div className="col2-set bg-white rounded-4 border-0 checkout-card" id="customer_details">
                          <div className="text-center border border-danger p-3 fs-20 rounded text-danger bg-danger-subtle">
                            {t("lblLoginRequiredCheckout")}
                          </div>
                          <button
                            type="button"
                            className="btn bg-blue text-white rounded-5 font-brandon-bold fs-20 w-100 mt-3"
                            data-bs-toggle="modal"
                            data-bs-target="#myModal"
                            disabled={isAuthLoading}
                          >
                            {t("lblLoginRegister")}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {receivingInfo.is_send_for_someone_checked && (
                    <>
                      <h4 className="fs-25 font-brandon-medium my-3 mt-4 checkout-section-title">{t("lblRecipientsInfo")}</h4>
                      <div className="tab-content bg-white rounded-3">
                        <div className="col-md-12 d-inline-block w-100 rounded-12 p-sm-5 pb-sm-4 p-3">
                          <div className="address mt-2">
                            <CheckoutRow label={t("lblRecipientName")} value={receivingInfo.recipient_name} />
                            <CheckoutRow label={t("lblRecipientPhone")} value={receivingInfo.recipient_phone} />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="col-md-4 ps-md-4 mob-top-space">
                  <div className="summaryBoxD">
                    <h3 className="fs-20 summary-mob-res font-brandon-bold">{t("lblSummary")}</h3>
                    <div id="order_review" className="woocommerce-checkout-review-order bg-light-white p-3 rounded-4">
                      <div className="shop_table woocommerce-checkout-review-order-table">
                        <div className="cart-product-div">
                          {cartItems.map((item) => (
                            <div key={item.id} className="mb-3">
                              <div className="d-flex justify-content-between dashedline product-items">
                                <p className="text-brown-50 font-brandon-normal">
                                  {itemName(item, language)} <strong className="product-quantity font-brandon-bold">x&nbsp;{item.quantity}</strong>
                                </p>
                                <p className="text-brown font-brandon-bold">{money(item.total_price, currency)}</p>
                              </div>
                              <div className="variationDiv small text-brown-50">
                                {itemMeta(item, language, t).map(([label, value]) => (
                                  <div key={`${item.id}-${label}-${value}`} className="d-flex gap-1">
                                    <span className="font-brandon-bold">{label}:</span>
                                    <span>{value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="d-flex justify-content-between dashedline">
                          <p className="text-brown-50 font-brandon-normal">{t("lblSubtotal")}</p>
                          <p className="text-brown font-brandon-bold">{money(subTotal, currency)}</p>
                        </div>
                        {discountTotal > 0 && (
                          <div className="d-flex justify-content-between dashedline">
                            <p className="text-brown-50 font-brandon-normal">
                              {t("lblDiscount")}
                              {cart.coupon?.code ? ` (${cart.coupon.code})` : ""}
                            </p>
                            <p className="text-brown font-brandon-bold">−{money(discountTotal, currency)}</p>
                          </div>
                        )}
                        {shouldShowShipping && (
                          <div className="d-flex justify-content-between dashedline">
                            <p className="text-brown-50 font-brandon-normal">{t("lblShippingCost")}</p>
                            <p className="text-brown font-brandon-bold">{money(shippingTotal, currency)}</p>
                          </div>
                        )}
                        {showFreeDelivery && (
                          <div className="d-flex justify-content-between dashedline">
                            <p className="text-brown-50 font-brandon-normal">{t("lblShippingCost")}</p>
                            <p className="text-brown font-brandon-bold">
                              {t("lblFreeDelivery", "Free delivery")}
                            </p>
                          </div>
                        )}
                        {taxTotal > 0 && (
                          <div className="d-flex justify-content-between dashedline">
                            <p className="text-brown-50 font-brandon-normal">{t("lblTax")}</p>
                            <p className="text-brown font-brandon-bold">{money(taxTotal, currency)}</p>
                          </div>
                        )}
                        <div className="d-flex justify-content-between dashedline">
                          <p className="text-brown-50 font-brandon-normal">{t("lblTotal")}</p>
                          <p className="text-brown font-brandon-bold">{money(orderTotal, currency)}</p>
                        </div>

                        <div className="payment_methods methods mt-3 pt-2">
                          <label className="wc_payment_method d-flex gap-2 align-items-center mb-2 font-brandon-normal">
                            <input
                              type="radio"
                              name="payment_method"
                              value="bank_transfer"
                              checked={paymentMethod === "bank_transfer"}
                              onChange={() => setPaymentMethod("bank_transfer")}
                            />
                            <span>{t("lblDirectBankTransfer")}</span>
                          </label>
                          {paymentMethod === "bank_transfer" && (
                            <p className="payment-description small mb-3">
                              {t("lblBankTransferDescription")}
                            </p>
                          )}
                          <hr className="my-3" />
                          <label className="wc_payment_method d-flex gap-2 align-items-center mb-2 font-brandon-normal">
                            <input
                              type="radio"
                              name="payment_method"
                              value="cod"
                              checked={paymentMethod === "cod"}
                              onChange={() => setPaymentMethod("cod")}
                            />
                            <span>{t("lblCashOnDelivery")}</span>
                          </label>
                          <hr className="my-3" />
                          <label className="wc_payment_method d-flex gap-2 align-items-center mb-2 font-brandon-normal">
                            <input
                              type="radio"
                              name="payment_method"
                              value="myfatoorah"
                              checked={paymentMethod === "myfatoorah"}
                              onChange={() => setPaymentMethod("myfatoorah")}
                            />
                            <span>{t("lblPayOnline", "Pay Online")}</span>
                          </label>
                        </div>

                        {expiredSlot && (
                          <div className="alert alert-warning py-2 mt-3">
                            {t("lblExpiredTimeSlot")}
                          </div>
                        )}
                        {notice && <div className="alert alert-info py-2 mt-3">{notice}</div>}

                        <button
                          type="submit"
                          className="button alt btn bg-brand-pink-dark text-white w-100 rounded-5 font-brandon-bold fs-20 mt-3 py-2"
                          disabled={isAuthLoading || isPlacingOrder}
                        >
                          {isPlacingOrder ? t("lblPlacingOrder") : t("lblPlaceOrder")}
                        </button>
                      </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-center py-4 px-4 bg-blue-light rounded-3 mt-3">
                      <div className="cartinfoicon">
                        <i className="bi bi-info-circle me-3 text-info"></i>
                      </div>
                      <div className="m-0 fs-14 lh-sm text-light-dark ps-2 fw-medium ms-1">
                        {t("lblOrderPrivacyNotice")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>

            <div className="row">
              <div className="col-md-8 pe-md-4">
                <h4 className="fs-25 font-brandon-medium my-3 mt-4 checkout-section-title">{t("lblDiscount")}</h4>
                <form
                  className="checkout_coupon woocommerce-form-coupon mt-0 d-block bg-white rounded-4 border-0 checkout-card"
                  onSubmit={async (event) => {
                    event.preventDefault();
                    if (!initialUserId || couponBusy) return;
                    setCouponMessage("");
                    setCouponBusy(true);
                    try {
                      const response = await fetch(applyCartCouponRoute, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          "X-API-KEY": getApiKeyByDomain(),
                        },
                        body: JSON.stringify({
                          user_id: initialUserId,
                          code: couponCode,
                        }),
                      });
                      const json = await response.json();
                      if (!response.ok) {
                        throw new Error(json.message || t("lblCouponInvalid", "Unable to apply this coupon."));
                      }
                      setCartState(json.data);
                      notifyCartUpdated(json);
                      setCouponCode("");
                      setCouponMessage(t("lblCouponApplied", "Coupon applied successfully."));
                    } catch (error) {
                      setCouponMessage(error.message || t("lblCouponInvalid", "Unable to apply this coupon."));
                    } finally {
                      setCouponBusy(false);
                    }
                  }}
                >
                  <p className="promo-code fs-20 font-brandon-bold">{t("lblEnterPromoCode")}</p>
                  <div className="d-flex justify-content-between gap-3 mob-res-coupon">
                    <div className="flex-grow-1">
                      <label htmlFor="coupon_code" className="visually-hidden">{t("lblCoupon")}</label>
                      <input
                        type="text"
                        className="form-control checkout-input w-100 rounded-3"
                        placeholder={t("lblCouponCode")}
                        id="coupon_code"
                        value={couponCode}
                        onChange={(event) => setCouponCode(event.target.value)}
                        disabled={couponBusy || Boolean(cart.coupon)}
                      />
                    </div>
                    {cart.coupon ? (
                      <button
                        type="button"
                        className="resp-mob-apply px-5 h-100 bg-sky text-white border-0 rounded-5 font-brandon-bold fs-20"
                        disabled={couponBusy}
                        onClick={async () => {
                          setCouponBusy(true);
                          setCouponMessage("");
                          try {
                            const response = await fetch(removeCartCouponRoute, {
                              method: "DELETE",
                              headers: {
                                "Content-Type": "application/json",
                                "X-API-KEY": getApiKeyByDomain(),
                              },
                              body: JSON.stringify({ user_id: initialUserId }),
                            });
                            const json = await response.json();
                            if (!response.ok) {
                              throw new Error(json.message || t("lblCouponRemoveFailed", "Unable to remove this coupon."));
                            }
                            setCartState(json.data);
                            notifyCartUpdated(json);
                            setCouponMessage(t("lblCouponRemoved", "Coupon removed."));
                          } catch (error) {
                            setCouponMessage(error.message);
                          } finally {
                            setCouponBusy(false);
                          }
                        }}
                      >
                        {t("lblRemoveCoupon", "Remove")}
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="resp-mob-apply px-5 h-100 bg-sky text-white border-0 rounded-5 font-brandon-bold fs-20"
                        disabled={couponBusy || !couponCode.trim()}
                      >
                        {t("lblApply")}
                      </button>
                    )}
                  </div>
                  {couponMessage && (
                    <p className={`small mt-2 mb-0 ${cart.coupon ? "text-success" : "text-danger"}`}>
                      {couponMessage}
                    </p>
                  )}
                  {cart.coupon && (
                    <p className="small text-success mt-2 mb-0">
                      {t("lblCoupon")}: {cart.coupon.code}
                    </p>
                  )}
                </form>
              </div>
            </div>
          </>
        )}
      </div>

      {showReceivingModal && (
        <DeliveryPickupModal
          branches={branches}
          initialReceivingInfo={receivingInfo}
          language={language}
          productId={productIds}
          productType={checkoutSlotProductType}
          pickupOnly={checkoutPickupOnly}
          onClose={() => setShowReceivingModal(false)}
          onConfirm={(info) => {
            setReceivingInfo(info);
            setShowReceivingModal(false);
          }}
        />
      )}
    </div>
  );
}
