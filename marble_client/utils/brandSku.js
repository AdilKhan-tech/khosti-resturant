const BRAND_SKU_KEY = "marble_brand_sku";

export function setBrandSku(sku) {
  const value = String(sku || "").trim();
  if (typeof window === "undefined") return;
  if (!value) {
    window.localStorage.removeItem(BRAND_SKU_KEY);
    return;
  }
  window.localStorage.setItem(BRAND_SKU_KEY, value);
}

export function getBrandSku() {
  if (typeof window === "undefined") return "";
  return String(window.localStorage.getItem(BRAND_SKU_KEY) || "").trim();
}

export function clearBrandSku() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(BRAND_SKU_KEY);
}
