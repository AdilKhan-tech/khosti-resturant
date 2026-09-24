import { getOccasionsRoute } from "@/utils/apiRoutes";
import apiKeyMapping from "@/configs/apiKeyMapping";
import { headers } from "next/headers";
import marbleUploadUrl from "@/utils/marbleUploadUrl";
import { getLocalizedLabel, getLocalizedValue } from "@/utils/localizedContent";

export default async function Occasions({ language = "en" }) {
  const headersList = await headers();
  const currentDomain = headersList.get("host")?.split(":")[0] || "localhost";
  const apiKey = apiKeyMapping[currentDomain] || null;
  const t = (labelKey, fallback) => getLocalizedLabel(labelKey, language, fallback);

  let occasions = [];

  try {
    const res = await fetch(getOccasionsRoute, {
      headers: { "X-API-KEY": apiKey },
      cache: "no-store",
    });
    if (res.ok) {
      const json = await res.json();
      occasions = json.data || [];
    }
  } catch {
    // API unreachable
  }

  return (
    <section>
      <div className="bg-light-white">
        <div className="container py-5">
          <h1 className="text-center text-brown mb-5 fs-44 font-brandon-bold">{t("lblByOccasions")}</h1>
          <div className="row justify-content-center gx-3 gx-md-5 gy-4">
            {occasions.map((occasion) => {
              const occasionName = getLocalizedValue(occasion.name_en, occasion.name_ar, language);
              return (
                <div key={occasion.id} role="button" className="col-4 col-sm-3 col-md text-center">
                  <img
                    src={marbleUploadUrl(occasion.image_url)}
                    alt={occasionName}
                    className="img-fluid object-fit-contain img-max-w-150px h-auto"
                  />
                  <h3 className="mt-2 mb-0 fs-25 font-brandon-bold text-brown">
                    {occasionName}
                  </h3>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
