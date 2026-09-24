"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import LoginModal from "./LoginModal";
import OccasionModal from "./OccasionModal";
import { CART_UPDATED_EVENT } from "@/utils/cartEvents";
import LanguageSwitcher from "./LanguageSwitcher";
import { getLocalizedLabel } from "@/utils/localizedContent";

const NAV_ITEMS = [
  { labelKey: "lblNavHome", href: "/", activePaths: ["/"] },
  { labelKey: "lblNavCakes", href: "/product-category/cakes", activePaths: ["/product-category/cakes", "/makecake"] },
  { labelKey: "lblNavIceCreams", href: "/product-category/icecreams", activePaths: ["/product-category/icecreams", "/makeicecream"] },
  { labelKey: "lblNavCookies", href: "/cookies", activePaths: ["/cookies"] },
  { labelKey: "lblNavDiy", href: "/diy", activePaths: ["/diy"] },
];

function Header({ cartCount = 0, occasions = [], language = "en" }) {
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const { status } = useSession();
  const [visibleCartCount, setVisibleCartCount] = useState(cartCount);
  const isAuthenticated = status === "authenticated";
  const isOccasionsActive = pathname === "/occasion" || pathname.startsWith("/occasion/");
  const t = (labelKey, fallback) => getLocalizedLabel(labelKey, language, fallback);
  const headerSearchValue =
    pathname === "/search"
      ? searchParams.get("q") || searchParams.get("s") || ""
      : searchParams.get("s") || "";

  useEffect(() => {
    setVisibleCartCount(cartCount);
  }, [cartCount]);

  useEffect(() => {
    const handleCartUpdated = (event) => {
      setVisibleCartCount(Number(event.detail?.count) || 0);
    };

    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdated);
    return () => window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdated);
  }, []);

  const isActive = (item) =>
    item.activePaths.some((path) =>
      path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(`${path}/`)
    );

  return (
    <header>
      <section className="bg-sky py-1 header font-brandon">
        <div className="container-fluid px-3 px-xl-4">
          <div className="frontend-header-row d-flex align-items-center">
            {/* Logo */}
            <div className="frontend-header-logo flex-shrink-0">
              <Link href="/" className="d-inline-flex align-items-center">
                <img src="/assets/images/marble_slab_logo_en.svg" className="img-fluid" alt={t("lblLogoAlt")} />
              </Link>
            </div>

            {/* Nav */}
            <nav className="frontend-header-nav flex-grow-1 text-center" aria-label={t("lblMainNavigation")}>
              <ul className="d-none d-lg-flex list-unstyled justify-content-center align-items-center gap-3 gap-xl-4 mb-0 nav-custom">
                {NAV_ITEMS.slice(0, 1).map((item) => (
                  <li key={item.href} className={isActive(item) ? "active" : ""}>
                    <Link className="nav-link fw-bold fs-18" href={item.href}>{t(item.labelKey)}</Link>
                  </li>
                ))}
                <li className={isOccasionsActive ? "active" : ""}>
                  <a className="nav-link fw-bold fs-18" data-bs-toggle="modal" data-bs-target="#occassionModal" role="button">{t("lblNavOccasions")}</a>
                </li>
                {NAV_ITEMS.slice(1).map((item) => (
                  <li key={item.href} className={isActive(item) ? "active" : ""}>
                    <Link className="nav-link fw-bold fs-18" href={item.href}>{t(item.labelKey)}</Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Search */}
            {/* Search — site-wide results at /search */}
            <div className="frontend-header-search flex-shrink-0">
              <form className="header-search-group d-flex align-items-center" role="search" method="GET" action="/search">
                <div className="header-search-control d-flex align-items-center">
                  <input
                    type="search"
                    name="q"
                    key={headerSearchValue}
                    defaultValue={headerSearchValue}
                    className="header-search-input form-control bg-white border-0 text-brown"
                    placeholder={t("lblSearchPlaceholder")}
                    aria-label={t("lblSearchProducts")}
                  />
                  <button className="header-search-clear btn bg-white border-0 text-brown d-inline-flex align-items-center justify-content-center" type="reset" aria-label={t("lblClearSearch")}>
                    <i className="bi bi-x" aria-hidden="true"></i>
                  </button>
                  <button className="header-search-submit btn border-0 text-white d-inline-flex align-items-center justify-content-center" type="submit" aria-label={t("lblSearchPlaceholder")}>
                    <i className="bi bi-search" aria-hidden="true"></i>
                  </button>
                </div>
                <LanguageSwitcher language={language} />
              </form>
            </div>

            {/* Right */}
            <div className="frontend-header-actions flex-shrink-0">
              <div className="d-flex justify-content-end align-items-center gap-2 gap-xl-3">
                {isAuthenticated ? (
                  <>
                    <Link href="/my-account" className="cursor d-flex align-items-center" aria-label={t("lblMyAccount")}>
                      <img src="/assets/images/useri.svg" alt={t("lblUserAccount")} />
                    </Link>
                    <button
                      type="button"
                      className="cursor d-none d-md-inline-flex align-items-center bg-transparent border-0 p-0 text-white"
                      aria-label={t("lblLogout")}
                      onClick={() => signOut({ callbackUrl: "/" })}
                    >
                      <i className="bi bi-box-arrow-right fs-5" aria-hidden="true"></i>
                    </button>
                  </>
                ) : (
                  <div
                    data-bs-toggle="modal"
                    data-bs-target="#myModal"
                    className="cursor d-flex align-items-center"
                  >
                    <img src="/assets/images/useri.svg" alt={t("lblUserAccount")} />
                  </div>
                )}
                <Link href="/cart" className="cursor d-flex align-items-center text-decoration-none position-relative">
                  <img src="/assets/images/carti.svg" alt={t("lblShoppingCart")} />
                  <span className="position-absolute translate-middle badge rounded-pill bg-danger position-top-cart-badge">
                    {visibleCartCount}
                  </span>
                </Link>
                <button className="cursor bg-transparent border-0 p-0" aria-label={t("lblOpenMenu")} data-bs-toggle="offcanvas" data-bs-target="#offcanvasRight" aria-controls="offcanvasRight">
                  <i className="bi bi-list text-white fs-3" aria-hidden="true"></i>
                </button>
              </div>
            </div>

            {/* Offcanvas */}
            <div className="offcanvas offcanvas-end" tabIndex={-1} id="offcanvasRight" aria-labelledby="offcanvasRightLabel">
              <div className="offcanvas-header">
                <h5 className="offcanvas-title" id="offcanvasRightLabel">{t("lblQuickLinks")}</h5>
                <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label={t("lblClose")}></button>
              </div>
              <div className="offcanvas-body mt-5">
                <div className="d-flex flex-column">
                  <Link href="/about" className="text-decoration-none text-dark fs-18 mb-3">
                    <i className="bi bi-info-circle mx-2"></i>{t("lblAboutUs")}
                  </Link>
                  <Link href="/contact" className="text-decoration-none text-dark fs-18 mb-3">
                    <i className="bi bi-envelope mx-2"></i>{t("lblContact")}
                  </Link>
                  <Link href="/product-category/icecreams" className="text-decoration-none text-dark fs-18 mb-3">
                    <i className="bi bi-snow2 mx-2"></i>{t("lblNavIceCreams")}
                  </Link>
                  <Link href="/contact" className="text-decoration-none text-dark fs-18 mb-3">
                    <i className="bi bi-question-circle mx-2"></i>{t("lblFaq")}
                  </Link>
                  {isAuthenticated && (
                    <button
                      type="button"
                      className="text-decoration-none text-dark fs-18 mb-3 bg-transparent text-start"
                      onClick={() => signOut({ callbackUrl: "/" })}
                    >
                      <i className="bi bi-box-arrow-right mx-2"></i>{t("lblLogout")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {!isAuthenticated && <LoginModal language={language} />}
      <OccasionModal occasions={occasions} language={language} />
    </header>
  );
}

export default Header;
