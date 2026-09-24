import { getRiyadhDate } from "@/utils/riyadhDate";

function toYmd(value) {
  if (!value) return null;
  return String(value).slice(0, 10);
}

/**
 * WP special-day / pre-order window evaluation for the storefront PDP.
 */
export function getSpecialDayState(product, today = getRiyadhDate()) {
  const active = !(
    product?.special_day_active === false ||
    product?.special_day_active === 0 ||
    product?.special_day_active === "0" ||
    product?.special_day_active === "false"
  );
  const start = toYmd(product?.special_day_start);
  const end = toYmd(product?.special_day_end);

  if (!active || !start || !end) {
    return {
      configured: false,
      inWindow: false,
      canAddToCart: true,
      start: null,
      end: null,
    };
  }

  const inWindow = today >= start && today <= end;
  return {
    configured: true,
    inWindow,
    canAddToCart: inWindow,
    start,
    end,
  };
}

export function formatSpecialDayLabel(ymd, language = "en") {
  if (!ymd) return "";
  const date = new Date(`${ymd}T12:00:00`);
  return date.toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
    month: "long",
    day: "numeric",
  });
}
