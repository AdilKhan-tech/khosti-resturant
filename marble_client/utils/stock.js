/**
 * WooCommerce-style stock status helpers for the storefront.
 */

export function isProductInStock(product) {
  const status = String(product?.stock_status || "instock")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "");
  return status !== "outofstock";
}
