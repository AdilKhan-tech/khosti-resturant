import { getBannerBySlugRoute } from "@/utils/apiRoutes";
import apiKeyMapping from "@/configs/apiKeyMapping";
import { headers } from "next/headers";

const FALLBACK_BANNERS = {
  home: "/assets/images/en-home-banner.jpg",
  cake: "/assets/images/en-home-banner.jpg",
  icecream: "/assets/images/en-home-banner.jpg",
  cookies: "/assets/images/en-home-banner.jpg",
  diy: "/assets/images/en-home-banner.jpg",
};

export default async function PageBanner({ slug, lang = "en", className = "" }) {
  const headersList = await headers();
  const currentDomain = headersList.get("host")?.split(":")[0] || "localhost";
  const apiKey = apiKeyMapping[currentDomain] || null;

  let bannerData = null;

  try {
    const res = await fetch(getBannerBySlugRoute(slug), {
      headers: { "X-API-KEY": apiKey },
      cache: "no-store",
    });
    if (res.ok) {
      const json = await res.json();
      bannerData = json.data;
    }
  } catch {
    // API unreachable
  }

  const dynamicUrl = lang === "ar"
    ? bannerData?.banner_ar_url
    : bannerData?.banner_en_url;

  const src = dynamicUrl || FALLBACK_BANNERS[slug] || FALLBACK_BANNERS.home;

  return (
    <div className={`page-banner ${className}`}>
      <img
        src={src}
        className="w-100 h-100 object-fit-cover d-block"
        alt={`${slug} banner`}
      />
    </div>
  );
}
