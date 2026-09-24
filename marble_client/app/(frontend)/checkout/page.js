import { cookies, headers } from "next/headers";
import CheckoutClient from "@/components/frontend/checkout/CheckoutClient";
import { getCartByUserRoute, getCitiesRoute } from "@/utils/apiRoutes";
import apiKeyMapping from "@/configs/apiKeyMapping";
import { LANGUAGE_COOKIE, normalizeLanguage } from "@/utils/localizedContent";

const EMPTY_CART = {
  total: 0,
  sub_total: 0,
  tax: 0,
  currency: "SR",
  data: [],
};

function parseReceivingInfo(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw));
  } catch {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}

function flattenCityBranches(cities = []) {
  return cities.flatMap((city) =>
    (city.branches || []).map((branch) => ({
      ...branch,
      city: branch.city || city.name_en || city.name || "",
      city_id: branch.city_id || city.id,
      name_en: branch.name_en || branch.name || "",
      name_ar: branch.name_ar || branch.name || "",
    })),
  );
}

export default async function CheckoutPage() {
  const cookieStore = await cookies();
  const headersList = await headers();
  const cartUserId = cookieStore.get("marble_cart_user_id")?.value || "";
  const receivingInfo = parseReceivingInfo(cookieStore.get("marble_receiving_info")?.value);
  const currentDomain = headersList.get("host")?.split(":")[0] || "localhost";
  const apiKey = apiKeyMapping[currentDomain] || null;
  const language = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);

  let cart = EMPTY_CART;
  let branches = [];

  try {
    const [cartRes, citiesRes] = await Promise.all([
      cartUserId
        ? fetch(getCartByUserRoute(cartUserId), {
            headers: { "X-API-KEY": apiKey },
            cache: "no-store",
          })
        : null,
      fetch(`${getCitiesRoute}?lang=${encodeURIComponent(language)}`, {
        headers: { "X-API-KEY": apiKey },
        cache: "no-store",
      }),
    ]);

    if (cartRes?.ok) {
      cart = await cartRes.json();
    }

    if (citiesRes.ok) {
      const json = await citiesRes.json();
      branches = flattenCityBranches(json.cities || []);
    }
  } catch {
    // Keep the checkout renderable if the API is temporarily unavailable.
  }

  return (
    <CheckoutClient
      initialCart={cart}
      initialBranches={branches}
      initialReceivingInfo={receivingInfo}
      initialUserId={cartUserId}
      language={language}
    />
  );
}
