import Link from 'next/link'
import React from 'react'
import { getLocalizedLabel } from "@/utils/localizedContent";

function Moregift({ language = "en" }) {
  const t = (labelKey, fallback) => getLocalizedLabel(labelKey, language, fallback);

  return (
    <section>
      <div className="row g-0 align-items-center bg-more-gift-blue">
        <div className="col-12 col-md-5 p-4 p-md-5">
          <h2 className="font-brandon-black fs-72 text-brown">{t("lblMoreGiftOptions")}</h2>
          <p className="fs-3 fw-medium text-brown py-3">{t("lblMoreGiftDescription")}</p>
          <Link href="/product-category/icecreams" className="btn hero-btn rounded-5 px-4 py-2">{t("lblViewIceCreamCollections")}</Link>
        </div>
        <div className="col-12 col-md-7 p-0">
          <img src="/assets/images/ice2.webp" className="w-100" alt={t("lblViewIceCreamCollections")} />
        </div>
      </div>
      <div className="row g-0 align-items-center bg-more-gift-pink">
        <div className="col-12 col-md-5 p-4 p-md-5">
          <h2 className="font-brandon-black fs-72 text-brown">{t("lblMakeCookiesBox")}</h2>
          <p className="fs-3 fw-medium text-brown py-3">{t("lblMakeCookiesBoxDescription")}</p>
          <Link href="/cookies" className="btn hero-btn rounded-5 px-4 py-2">{t("lblMakeYourOwnBox")}</Link>
        </div>
        <div className="col-12 col-md-7 p-0">
          <img src="/assets/images/cookbox1.png" className="w-100" alt={t("lblCookieBox")} />
        </div>
      </div>
    </section>
  )
}

export default Moregift
