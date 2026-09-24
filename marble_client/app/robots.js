import { getSiteUrl } from "@/utils/siteUrl";

/**
 * Storefront robots.txt — allow marketing pages; block account, cart, checkout, admin.
 * Served at /robots.txt
 */
export default function robots() {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/dashboard/",
          "/my-account",
          "/my-account/",
          "/cart",
          "/checkout",
          "/checkout/",
          "/place-order",
          "/order-feedback",
          "/order-feedback/",
          "/feedback-qr-code",
          "/feedback-qr-code/",
          "/api/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
