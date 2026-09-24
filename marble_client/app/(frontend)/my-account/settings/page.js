import { cookies } from "next/headers";
import { getLocalizedLabel, LANGUAGE_COOKIE, normalizeLanguage } from "@/utils/localizedContent";

const SETTINGS = [
  {
    titleLabelKey: "lblOrderDeliveryUpdates",
    descriptionLabelKey: "lblOrderDeliveryUpdatesDescription",
    enabled: true,
  },
  {
    titleLabelKey: "lblPromotionsOffers",
    descriptionLabelKey: "lblPromotionsOffersDescription",
    enabled: true,
  },
  {
    titleLabelKey: "lblSmsNotifications",
    descriptionLabelKey: "lblSmsNotificationsDescription",
    enabled: false,
  },
];

export default async function MyAccountSettingsPage() {
  const cookieStore = await cookies();
  const language = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);
  const t = (labelKey, fallback) => getLocalizedLabel(labelKey, language, fallback);

  return (
    <div className="mt-3">
      <p className="fs-25 Brandon_Grotesque mt-3">{t("lblAccountSettings")}</p>
      <div className="bg-white rounded-4 p-4">
        <h6 className="font-brandon-bold mb-3 text-uppercase small text-muted">{t("lblNotifications")}</h6>
        <div className="list-group list-group-flush border rounded-3">
          {SETTINGS.map((setting) => (
            <div className="list-group-item d-flex justify-content-between align-items-center px-4 py-3" key={setting.titleLabelKey}>
              <div>
                <h6 className="mb-1 font-brandon-bold">{t(setting.titleLabelKey)}</h6>
                <small className="text-muted">{t(setting.descriptionLabelKey)}</small>
              </div>
              <span className={`badge rounded-pill ${setting.enabled ? "bg-success" : "bg-secondary"}`}>
                {setting.enabled ? t("lblEnabled") : t("lblDisabled")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
