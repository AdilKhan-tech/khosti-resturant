import apiKeyMapping from "@/configs/apiKeyMapping";
import { getOccasionsRoute, getProductsRoute } from "@/utils/apiRoutes";
import { getSiteUrl } from "@/utils/siteUrl";

/** Static marketing / catalog routes (storefront). */
const STATIC_PATHS = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
  { path: "/product-category/cakes", changeFrequency: "daily", priority: 0.9 },
  { path: "/product-category/icecreams", changeFrequency: "daily", priority: 0.9 },
  { path: "/cookies", changeFrequency: "weekly", priority: 0.8 },
  { path: "/makecake", changeFrequency: "weekly", priority: 0.8 },
  { path: "/makeicecream", changeFrequency: "weekly", priority: 0.8 },
  { path: "/diy", changeFrequency: "weekly", priority: 0.6 },
  { path: "/search", changeFrequency: "weekly", priority: 0.4 },
  { path: "/marble-van", changeFrequency: "monthly", priority: 0.5 },
];

function apiHeaders() {
  return { "X-API-KEY": apiKeyMapping.localhost || null };
}

async function fetchAllProducts() {
  const products = [];
  const limit = 200;
  let page = 1;

  while (page <= 50) {
    try {
      const res = await fetch(`${getProductsRoute}?page=${page}&limit=${limit}`, {
        headers: apiHeaders(),
        next: { revalidate: 3600 },
      });
      if (!res.ok) break;
      const json = await res.json();
      const batch = json.data || [];
      if (!batch.length) break;
      products.push(...batch);
      if (batch.length < limit) break;
      page += 1;
    } catch {
      break;
    }
  }

  return products;
}

async function fetchOccasions() {
  try {
    const res = await fetch(getOccasionsRoute, {
      headers: apiHeaders(),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

/**
 * Dynamic sitemap.xml: static pages + products + occasions.
 * Served at /sitemap.xml
 */
export default async function sitemap() {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const staticEntries = STATIC_PATHS.map(({ path, changeFrequency, priority }) => ({
    url: `${siteUrl}${path === "/" ? "" : path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  const [products, occasions] = await Promise.all([
    fetchAllProducts(),
    fetchOccasions(),
  ]);

  const productEntries = products
    .map((product) => {
      const slug = product.slug || product.id;
      if (!slug) return null;
      return {
        url: `${siteUrl}/product/${encodeURIComponent(String(slug))}`,
        lastModified: product.updated_at ? new Date(product.updated_at) : now,
        changeFrequency: "weekly",
        priority: 0.8,
      };
    })
    .filter(Boolean);

  const occasionEntries = occasions
    .map((occasion) => {
      if (!occasion.slug) return null;
      return {
        url: `${siteUrl}/occasion/${encodeURIComponent(String(occasion.slug))}`,
        lastModified: occasion.updated_at ? new Date(occasion.updated_at) : now,
        changeFrequency: "weekly",
        priority: 0.7,
      };
    })
    .filter(Boolean);

  return [...staticEntries, ...productEntries, ...occasionEntries];
}
