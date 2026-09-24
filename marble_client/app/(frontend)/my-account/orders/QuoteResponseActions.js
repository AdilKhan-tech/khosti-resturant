"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import apiKeyMapping from "@/configs/apiKeyMapping";
import { addCartItemRoute, emptyCartRoute, getOrderByNumberRoute, respondOrderQuotationRoute } from "@/utils/apiRoutes";
import { notifyCartUpdated } from "@/utils/cartEvents";
import { getLocalizedLabel } from "@/utils/localizedContent";

function getApiHeaders() {
  const hostname = typeof window === "undefined" ? "localhost" : window.location.hostname;
  return { "X-API-KEY": apiKeyMapping[hostname] || apiKeyMapping.localhost };
}

function getCartUserId() {
  if (typeof window === "undefined") return "";
  let userId = window.localStorage.getItem("marble_cart_user_id");
  if (!userId) {
    userId = `guest-${window.crypto?.randomUUID ? window.crypto.randomUUID() : Date.now()}`;
    window.localStorage.setItem("marble_cart_user_id", userId);
  }
  document.cookie = `marble_cart_user_id=${encodeURIComponent(userId)}; path=/; max-age=31536000; samesite=lax`;
  return userId;
}

function persistReceivingInfo(info) {
  window.localStorage.setItem("marble_receiving_info", JSON.stringify(info));
  document.cookie = `marble_receiving_info=${encodeURIComponent(JSON.stringify(info))}; path=/; max-age=31536000; samesite=lax`;
}

function checkoutOptionsFromQuote(item = {}, quoteAmount = 0) {
  const options = item.options || {};
  return {
    ...options,
    product_type: "custom_cake",
    cake_size: options.cake_size || null,
    cake_flavor: options.cake_flavor || null,
    custom_price: Number(quoteAmount || item.unit_price || item.total_price || 0),
  };
}

export default function QuoteResponseActions({ orderNumber, order: initialOrder = null, language = "en" }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const t = (labelKey, fallback) => getLocalizedLabel(labelKey, language, fallback);

  const loadOrder = async () => {
    if (initialOrder) return initialOrder;
    const response = await fetch(getOrderByNumberRoute(orderNumber), {
      headers: { Authorization: `Bearer ${session?.user?.accessToken || ""}` },
      cache: "no-store",
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.message || t("lblUnableLoadQuotation"));
    return json.data;
  };

  const acceptQuotation = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      const order = await loadOrder();
      const item = order.items?.[0];
      const quoteAmount = order.quote?.amount || order.totals?.subtotal || item?.unit_price || 0;
      if (!item?.product_id || !quoteAmount) {
        throw new Error(t("lblQuotationMissingItem"));
      }

      const cartUserId = getCartUserId();
      const apiHeaders = getApiHeaders();
      persistReceivingInfo(order.receiving_info || {});

      await fetch(emptyCartRoute, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...apiHeaders,
        },
        body: JSON.stringify({ user_id: cartUserId }),
      });

      const response = await fetch(addCartItemRoute, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...apiHeaders,
        },
        body: JSON.stringify({
          user_id: cartUserId,
          product_id: item.product_id,
          order_number: order.order_number,
          quantity: item.quantity || 1,
          ...checkoutOptionsFromQuote(item, quoteAmount),
        }),
      });

      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(json.message || t("lblUnableAddQuotationToCart"));
      }

      notifyCartUpdated(json);
      router.push("/checkout");
    } catch (acceptError) {
      setError(acceptError.message || t("lblUnablePrepareCheckout"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const rejectQuotation = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      const response = await fetch(respondOrderQuotationRoute(orderNumber), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.accessToken || ""}`,
        },
        body: JSON.stringify({ action: "reject" }),
      });

      if (!response.ok) {
        const json = await response.json().catch(() => ({}));
        throw new Error(json.message || t("lblUnableUpdateQuotation"));
      }

      router.refresh();
    } catch (rejectError) {
      setError(rejectError.message || t("lblUnableRejectQuotation"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="d-flex flex-column gap-1">
      <button
        type="button"
        className="woocommerce-button button accept text-blue bg-transparent fs-14 border-0 p-0 text-start"
        onClick={acceptQuotation}
        disabled={isSubmitting}
      >
        <i className="bi bi-check-circle-fill me-2"></i>{t("lblAccept")}
      </button>
      <button
        type="button"
        className="woocommerce-button button cancel text-danger bg-transparent fs-14 border-0 p-0 text-start"
        onClick={rejectQuotation}
        disabled={isSubmitting}
      >
        <i className="bi bi-x-circle-fill me-2"></i>{t("lblReject")}
      </button>
      {error && <span className="small text-danger">{error}</span>}
    </div>
  );
}
