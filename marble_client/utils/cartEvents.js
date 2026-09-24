"use client";

export const CART_UPDATED_EVENT = "marble:cart-updated";

export function cartCountFromPayload(payload) {
  const cart = Array.isArray(payload?.data)
    ? payload
    : payload?.data && Array.isArray(payload.data.data)
      ? payload.data
      : null;

  return (cart?.data || []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
}

export function notifyCartUpdated(payloadOrCount) {
  if (typeof window === "undefined") return;

  const count = typeof payloadOrCount === "number"
    ? payloadOrCount
    : cartCountFromPayload(payloadOrCount);

  window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT, { detail: { count } }));
}
