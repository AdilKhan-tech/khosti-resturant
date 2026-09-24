/**
 * Absolute storefront origin for sitemap / robots / canonical URLs.
 * Set NEXT_PUBLIC_SITE_URL in production (e.g. https://marblestore.com).
 */
export function getSiteUrl() {
  const fromEnv = (process.env.NEXT_PUBLIC_SITE_URL || "").trim().replace(/\/$/, "");
  return fromEnv || "http://localhost:3000";
}
