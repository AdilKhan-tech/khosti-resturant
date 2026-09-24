import { cookies, headers } from "next/headers";
import { getCartByUserRoute, getProductsRoute } from "@/utils/apiRoutes";
import apiKeyMapping from "@/configs/apiKeyMapping";
import CartClient from "@/components/frontend/cart/CartClient";
import { LANGUAGE_COOKIE, normalizeLanguage } from "@/utils/localizedContent";

const ADD_ONS_CATEGORY_SLUG = "add-ons";

const EMPTY_CART = {
  total: 0,
  sub_total: 0,
  tax: 0,
  currency: "SR",
  data: [],
};

export default async function CartPage() {
  const cookieStore = await cookies();
  const headersList = await headers();
  const cartUserId = cookieStore.get("marble_cart_user_id")?.value || "";
  const currentDomain = headersList.get("host")?.split(":")[0] || "localhost";
  const apiKey = apiKeyMapping[currentDomain] || null;
  const language = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);

  let cart = EMPTY_CART;
  let addOnProducts = [];

  try {
    const addOnsUrl = new URL(getProductsRoute);
    addOnsUrl.searchParams.set("category_slug", ADD_ONS_CATEGORY_SLUG);
    addOnsUrl.searchParams.set("limit", "4");
    addOnsUrl.searchParams.set("sortField", "id");
    addOnsUrl.searchParams.set("sortOrder", "ASC");

    const [cartRes, addOnsRes] = await Promise.all([
      cartUserId
        ? fetch(getCartByUserRoute(cartUserId), {
            headers: { "X-API-KEY": apiKey },
            cache: "no-store",
          })
        : null,
      fetch(addOnsUrl.toString(), {
        headers: { "X-API-KEY": apiKey },
        cache: "no-store",
      }),
    ]);

    if (cartRes?.ok) {
      cart = await cartRes.json();
    }

    if (addOnsRes.ok) {
      const json = await addOnsRes.json();
      addOnProducts = json.data || [];
    }
  } catch {
    // API unreachable
  }

  return (
    <CartClient
      initialCart={cart}
      initialUserId={cartUserId}
      addOnProducts={addOnProducts}
      language={language}
    />
  );
}
