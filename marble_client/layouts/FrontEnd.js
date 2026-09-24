import Header from "@/components/frontend/Header";
import Footer from "@/components/frontend/Footer";
import { Suspense } from "react";
import { cookies, headers } from "next/headers";
import {
  getCartByUserRoute,
  getOccasionsRoute,
  getStorefrontPublicRoute,
} from "@/utils/apiRoutes";
import apiKeyMapping from "@/configs/apiKeyMapping";

const EMPTY_CART_COUNT = 0;

const DEFAULT_STOREFRONT = {
  hotline: "920011480",
  whatsapp: "+966594064708",
  email: "info@marblestore.com",
  social_instagram: "https://www.instagram.com/marbleslabksa/",
  social_facebook:
    "https://www.facebook.com/people/Marble-Slab-Creamery-Saudi/100069378470018/",
  social_tiktok: "https://www.tiktok.com/@marbleslabksa",
};

async function getCartCount() {
    const cookieStore = await cookies();
    const headersList = await headers();
    const cartUserId = cookieStore.get("marble_cart_user_id")?.value || "";
    const currentDomain = headersList.get("host")?.split(":")[0] || "localhost";
    const apiKey = apiKeyMapping[currentDomain] || null;

    if (!cartUserId) return EMPTY_CART_COUNT;

    try {
        const res = await fetch(getCartByUserRoute(cartUserId), {
            headers: { "X-API-KEY": apiKey },
            cache: "no-store",
        });
        if (!res.ok) return EMPTY_CART_COUNT;
        const cart = await res.json();
        return (cart.data || []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    } catch {
        return EMPTY_CART_COUNT;
    }
}

async function getHeaderOccasions() {
    const headersList = await headers();
    const currentDomain = headersList.get("host")?.split(":")[0] || "localhost";
    const apiKey = apiKeyMapping[currentDomain] || null;

    try {
        const res = await fetch(`${getOccasionsRoute}?limit=100&sortOrder=ASC`, {
            headers: { "X-API-KEY": apiKey },
            cache: "no-store",
        });
        if (!res.ok) return [];
        const json = await res.json();
        return json.data || [];
    } catch {
        return [];
    }
}

async function getStorefrontPublic() {
    const headersList = await headers();
    const currentDomain = headersList.get("host")?.split(":")[0] || "localhost";
    const apiKey = apiKeyMapping[currentDomain] || null;

    try {
        const res = await fetch(getStorefrontPublicRoute, {
            headers: { "X-API-KEY": apiKey },
            cache: "no-store",
        });
        if (!res.ok) return DEFAULT_STOREFRONT;
        const json = await res.json();
        const data = json?.data || {};
        return {
            hotline: data.hotline || DEFAULT_STOREFRONT.hotline,
            whatsapp: data.whatsapp || DEFAULT_STOREFRONT.whatsapp,
            email: data.email || DEFAULT_STOREFRONT.email,
            // Empty string hides the icon — do not re-apply defaults.
            social_instagram: String(data.social_instagram || "").trim(),
            social_facebook: String(data.social_facebook || "").trim(),
            social_tiktok: String(data.social_tiktok || "").trim(),
        };
    } catch {
        return DEFAULT_STOREFRONT;
    }
}

const FrontEnd = async ({ children, language = "en" }) => {
    const [cartCount, occasions, storefront] = await Promise.all([
        getCartCount(),
        getHeaderOccasions(),
        getStorefrontPublic(),
    ]);

    return <div className="marble-frontend">
    <Suspense fallback={null}>
      <Header cartCount={cartCount} occasions={occasions} language={language} />
    </Suspense>
    {children}
     <Footer language={language} storefront={storefront} />
    </div>
};

export default FrontEnd;
