import { cookies } from "next/headers";
import { getLocalizedLabel, LANGUAGE_COOKIE, normalizeLanguage } from "@/utils/localizedContent";

const ADDRESSES = [
  {
    typeLabelKey: "lblHomeAddress",
    addressLabelKey: "lblNoSavedAddress",
    isDefault: true,
  },
];

export default async function MyAccountAddressesPage() {
  const cookieStore = await cookies();
  const language = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);
  const t = (labelKey, fallback) => getLocalizedLabel(labelKey, language, fallback);

  return (
    <div className="mt-3">
      <p className="fs-25 Brandon_Grotesque mt-3">{t("lblMyAddresses")}</p>
      <div className="bg-white rounded-4 p-4">
        {ADDRESSES.map((address) => (
          <div className="rounded-4 border p-4 mb-3" key={address.typeLabelKey}>
            <div className="d-flex align-items-start gap-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center bg-blue text-white flex-shrink-0 size-48"
              >
                <i className="bi bi-geo-alt"></i>
              </div>
              <div>
                <span className="badge rounded-pill bg-secondary mb-2">
                  {t(address.typeLabelKey)}
                  {address.isDefault ? ` • ${t("lblDefault")}` : ""}
                </span>
                <p className="mb-0 text-muted small lh-base">{t(address.addressLabelKey)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
