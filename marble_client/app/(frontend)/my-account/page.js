import { getServerSession } from "next-auth/next";
import { cookies } from "next/headers";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getLocalizedLabel, LANGUAGE_COOKIE, normalizeLanguage } from "@/utils/localizedContent";

export default async function MyAccountProfilePage() {
  const [session, cookieStore] = await Promise.all([getServerSession(authOptions), cookies()]);
  const language = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);
  const t = (labelKey, fallback) => getLocalizedLabel(labelKey, language, fallback);
  const user = session?.user;

  if (!user) {
    return (
      <div className="bg-white rounded-4 p-4 mt-3">
        <p className="m-0">{t("lblLoginToViewProfile")}</p>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <p className="fs-25 Brandon_Grotesque mt-3">{t("lblProfileInfo")}</p>
      <div className="bg-white rounded-4 p-4">
        <div className="row g-4">
          <div className="col-md-6">
            <label className="text-muted small d-block mb-1">{t("lblFullName")}</label>
            <p className="font-brandon-bold fs-20 text-light-dark mb-0">{user.full_name || t("lblNotAvailable")}</p>
          </div>
          <div className="col-md-6">
            <label className="text-muted small d-block mb-1">{t("lblPhoneNumberTitle")}</label>
            <p className="font-brandon-bold fs-20 text-light-dark mb-0">{user.phone_number || t("lblNotAvailable")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
