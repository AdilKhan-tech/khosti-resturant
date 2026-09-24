import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { cookies } from "next/headers";
import { getLocalizedLabel, LANGUAGE_COOKIE, normalizeLanguage } from "@/utils/localizedContent";

const MENU_ITEMS = [
  { href: "/my-account", icon: "bi-person", labelKey: "lblProfileInfo" },
  { href: "/my-account/orders", icon: "bi-bag-check", labelKey: "lblOrdersHistory" },
  { href: "/my-account/wishlist", icon: "bi-heart", labelKey: "lblWishlist" },
  { href: "/my-account/addresses", icon: "bi-geo-alt", labelKey: "lblAddresses" },
  { href: "/my-account/settings", icon: "bi-gear", labelKey: "lblSettings" },
];

function userInitial(name) {
  return String(name || "M").trim().charAt(0).toUpperCase();
}

export default async function MyAccountLayout({ children }) {
  const [session, cookieStore] = await Promise.all([getServerSession(authOptions), cookies()]);
  const language = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);
  const t = (labelKey, fallback) => getLocalizedLabel(labelKey, language, fallback);
  const user = session?.user || {};
  const fullName = user.full_name || t("lblGuest");
  const phone = user.phone_number || "";

  return (
    <section className="pt-5 mt-2 mb-3 my-account-page">
      <div className="my-custom-dashboard container">
        <h2 className="fs-50 text-brown font-brandon-black myaccTitle">{t("lblMyAccount")}</h2>
        <div className="row gx-3">
          <div className="col-md-3 px-sm-2 px-0">
            <p className="fs-25 Brandon_Grotesque mt-3">{t("lblProfileInfo")}</p>
            <div className="bg-white rounded-4 p-3 mb-2 account-profile-card">
              <div className="d-flex justify-content-between pb-1 align-items-start">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center font-brandon-bold bg-blue text-white flex-shrink-0 size-54"
                  >
                    {userInitial(fullName)}
                  </div>
                  <div>
                    <h3 className="font-brandon-bold text-light-dark fs-30 mb-1">{fullName}</h3>
                    {phone && (
                      <p className="fs-20 d-flex align-items-center gap-1 font-brandon-normal text-light-dark m-0">
                        <i className="bi bi-telephone text-muted" aria-hidden="true"></i>
                        {phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <nav className="bg-white rounded-4 order-history px-3 pb-3 pt-1 w-100 account-sidebar" aria-label={t("lblMyAccountNavigation")}>
              <ul className="p-0 m-0">
                {MENU_ITEMS.map((item) => (
                  <li key={item.href} className="fs-20 gap-1 font-brandon-normal text-light-dark m-0 list-unstyled my-2">
                    <Link href={item.href} className="text-brown text-decoration-none d-flex align-items-center gap-2 py-2 px-1">
                      <i className={`bi ${item.icon}`} aria-hidden="true"></i>
                      {t(item.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="col-md-9 px-sm-2 px-0">
            <div className="woocommerce-MyAccount-content w-100">{children}</div>
          </div>
        </div>
      </div>

    </section>
  );
}
