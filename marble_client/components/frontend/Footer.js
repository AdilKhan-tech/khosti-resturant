import React from "react";
import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";
import { getLocalizedLabel } from "@/utils/localizedContent";

const FOOTER_COLUMNS = [
  {
    titleKey: "lblCollection",
    links: [
      { labelKey: "lblReadyCakes", href: "/product-category/cakes" },
      { labelKey: "lblNavIceCreams", href: "/product-category/icecreams" },
      { labelKey: "lblCookieBox", href: "/cookies" },
    ],
  },
  {
    titleKey: "lblServices",
    links: [
      { labelKey: "lblCustomCake", href: "/makecake" },
      { labelKey: "lblCustomIceCream", href: "/makeicecream" },
      { labelKey: "lblMarbleVan", href: "/contact" },
    ],
  },
  {
    titleKey: "lblCompany",
    links: [
      { labelKey: "lblAbout", href: "/about" },
      { labelKey: "lblContact", href: "/contact" },
      { labelKey: "lblFaq", href: "/contact" },
    ],
  },
];

const DEFAULT_STOREFRONT = {
  hotline: "920011480",
  whatsapp: "+966594064708",
  email: "info@marblestore.com",
  social_instagram: "https://www.instagram.com/marbleslabksa/",
  social_facebook:
    "https://www.facebook.com/people/Marble-Slab-Creamery-Saudi/100069378470018/",
  social_tiktok: "https://www.tiktok.com/@marbleslabksa",
};

function whatsappHref(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "#";
}

function telHref(raw) {
  const value = String(raw || "").trim();
  if (!value) return "#";
  return `tel:${value.replace(/\s+/g, "")}`;
}

function Footer({ language = "en", storefront = DEFAULT_STOREFRONT }) {
  const t = (labelKey, fallback) => getLocalizedLabel(labelKey, language, fallback);
  const hotline = storefront.hotline || DEFAULT_STOREFRONT.hotline;
  const whatsapp = storefront.whatsapp || DEFAULT_STOREFRONT.whatsapp;
  const email = storefront.email || DEFAULT_STOREFRONT.email;
  const instagram = String(storefront.social_instagram || "").trim();
  const facebook = String(storefront.social_facebook || "").trim();
  const tiktok = String(storefront.social_tiktok || "").trim();

  return (
    <>
    <a href={whatsappHref(whatsapp)} className="whatsapp-chat" target="_blank" rel="noopener noreferrer">
      <img className="w-60px" src="/assets/images/whatsapp_chat.png" alt={t("lblWhatsappUs")} />
    </a>
    <footer className="footer bg-brown p-4 p-md-5 pb-3">
      <div className="container">
        
        {/* Top Section */}
        <div className="row gy-4 align-items-start">

          {/* Logo */}
          <div className="col-12 col-md-3 text-center text-md-start">
            <Link href="/">
              <img
                src="/assets/images/slabfooterlogo.svg"
                className="img-fluid"
                alt={t("lblLogoAlt")}
              />
            </Link>
          </div>

          {/* Links */}
          <div className="col-12 col-md-9">
            <div className="row gy-4">
              {FOOTER_COLUMNS.map((column) => (
                <div className="col-6 col-md-3" key={column.titleKey}>
                  <h6 className="footer-text">{t(column.titleKey)}</h6>
                  {column.links.map((link) => (
                    <Link className="footerlink d-block mb-2" href={link.href} key={link.labelKey}>
                      {t(link.labelKey)}
                    </Link>
                  ))}
                </div>
              ))}

              {/* Contact */}
              <div className="col-12 col-md-3">
                <h6 className="footer-text">{t("lblContactUs")}</h6>
                <div className="d-flex gap-2 flex-wrap">
                  <a href={telHref(hotline)} aria-label={t("lblCallUs")}><img src="/assets/images/phoni.svg" alt={t("lblCallUs")} /></a>
                  <a href={whatsappHref(whatsapp)} target="_blank" rel="noopener noreferrer" aria-label={t("lblWhatsappUs")}><img src="/assets/images/whatsappi.svg" alt={t("lblWhatsappUs")} /></a>
                  <a href={`mailto:${email}`} aria-label={t("lblEmailUs")}><img src="/assets/images/maili.svg" alt={t("lblEmailUs")} /></a>
                </div>

                {(instagram || facebook || tiktok) && (
                  <>
                    <h6 className="footer-text mt-3">{t("lblFollowUs")}</h6>
                    <div className="d-flex gap-2 flex-wrap">
                      {instagram ? (
                        <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label={t("lblInstagram")}><img src="/assets/images/insta.png" alt={t("lblInstagram")} /></a>
                      ) : null}
                      {facebook ? (
                        <a href={facebook} target="_blank" rel="noopener noreferrer" aria-label={t("lblFacebook")}><img src="/assets/images/faceb.png" alt={t("lblFacebook")} /></a>
                      ) : null}
                      {tiktok ? (
                        <a href={tiktok} target="_blank" rel="noopener noreferrer" aria-label={t("lblTiktok")}><img src="/assets/images/tiktok.png" alt={t("lblTiktok")} /></a>
                      ) : null}
                    </div>
                  </>
                )}

                <h6 className="footer-text mt-3">{t("lblLanguage")}</h6>
                <LanguageSwitcher language={language} className="footer-language-switcher" />
              </div>

            </div>
          </div>

        </div>

        {/* Bottom */}
        <hr className="mt-4 border-black" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
          <p className="m-0 footerlink text-brown text-center text-md-start">
            {t("lblCopyright")}
          </p>
          <Link href="/about" className="text-decoration-none footerlink text-brown mt-2 mt-md-0">
            {t("lblPrivacyPolicy")}
          </Link>
        </div>

      </div>
    </footer>
    </>
  );
}

export default Footer;
