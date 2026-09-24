"use client";

import { useEffect } from "react";
import { setBrandSku } from "@/utils/brandSku";

/** Persists scanned QR brand SKU for checkout attribution (WP session brand_sku). */
export default function BrandSkuCapture({ sku }) {
  useEffect(() => {
    if (sku) setBrandSku(sku);
  }, [sku]);

  return null;
}
