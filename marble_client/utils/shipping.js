/**
 * Client-side delivery fee helpers.
 *
 * Rules must come from GET /shipping-settings. There are no client-side
 * fallback fee values — if settings are missing, callers must wait or block.
 */

export const SHIPPING_RULE_KEYS = [
  "free_shipping_threshold",
  "max_delivery_distance_km",
  "no_address_shipping_cost",
  "base_shipping_cost",
  "base_shipping_distance_km",
  "extra_shipping_cost_per_km",
];

/**
 * Parse API/form shipping rules. Returns null when any required field is missing
 * or not a non-negative number.
 */
export function parseShippingRules(input) {
  if (!input || typeof input !== "object") return null;

  const rules = {};
  for (const key of SHIPPING_RULE_KEYS) {
    const number = Number(input[key]);
    if (!Number.isFinite(number) || number < 0) return null;
    rules[key] = number;
  }
  return rules;
}

export function calculateDistanceShippingCost(distanceKm, rules) {
  if (!rules) return null;
  const distance = Number(distanceKm) || 0;
  if (distance <= rules.base_shipping_distance_km) {
    return rules.base_shipping_cost;
  }
  return Math.round(
    rules.base_shipping_cost +
      (distance - rules.base_shipping_distance_km) *
        rules.extra_shipping_cost_per_km,
  );
}

export function isFreeShippingEligible(subtotal, rules) {
  if (!rules) return false;
  return Number(subtotal) >= rules.free_shipping_threshold;
}

export function checkoutShippingTotal({
  addressType,
  subtotal,
  shippingCost,
  rules,
}) {
  if (addressType !== "Delivery") return 0;
  if (!rules) {
    return Number(shippingCost) > 0 ? Number(shippingCost) : 0;
  }
  if (isFreeShippingEligible(subtotal, rules)) return 0;
  return Number(shippingCost) > 0 ? Number(shippingCost) : 0;
}
