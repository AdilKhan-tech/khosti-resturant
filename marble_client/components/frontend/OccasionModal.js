"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import marbleUploadUrl from "@/utils/marbleUploadUrl";
import { getLocalizedLabel, getLocalizedValue } from "@/utils/localizedContent";

export default function OccasionModal({ occasions = [], language = "en" }) {
  const router = useRouter();
  const t = (labelKey, fallback) => getLocalizedLabel(labelKey, language, fallback);

  const handleOccasionClick = (event, slug) => {
    event.preventDefault();

    const modalEl = document.getElementById("occassionModal");
    const bootstrapModal = window.bootstrap?.Modal?.getInstance(modalEl);

    if (bootstrapModal) {
      bootstrapModal.hide();
    } else if (modalEl) {
      modalEl.classList.remove("show");
      modalEl.style.display = "none";
      modalEl.setAttribute("aria-hidden", "true");
      modalEl.removeAttribute("aria-modal");
      document.body.classList.remove("modal-open");
      document.querySelectorAll(".modal-backdrop").forEach((backdrop) => backdrop.remove());
    }

    router.push(`/occasion/${slug}`);
  };

  return (
    <div className="modal occasion-modal" id="occassionModal" aria-labelledby="occasionModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content occasion-modal-content">
          <button
            type="button"
            className="btn-close position-absolute top-0 end-0 me-3 mt-3 bg-dark rounded-circle p-2 occasion-close"
            data-bs-dismiss="modal"
            aria-label={t("lblClose")}
          ></button>
          <h2 id="occasionModalLabel" className="text-center text-brown font-brandon-bold mb-1 fs-32">
            {t("lblOccasionsTitle")}
          </h2>
          <p className="text-center text-brown mb-4 fs-18">
            {t("lblOccasionsSubtitle")}
          </p>
          <div className="d-flex flex-wrap px-2 gap-12px">
            {occasions.map((occasion) => (
              <div key={occasion.id} className="text-center">
                <Link
                  href={`/occasion/${occasion.slug}`}
                  className="rounded-4 d-flex flex-column align-items-center justify-content-center text-decoration-none occasion-card"
                  onClick={(event) => handleOccasionClick(event, occasion.slug)}
                >
                  {marbleUploadUrl(occasion.image_url) ? (
                    <img
                      src={marbleUploadUrl(occasion.image_url)}
                      alt={getLocalizedValue(occasion.name_en, occasion.name_ar, language)}
                      className="object-fit-contain occasion-card-image"
                    />
                  ) : (
                    <i className="bi bi-image color-brown fs-1" aria-hidden="true"></i>
                  )}
                  <p className="mt-1 mb-0 color-brown occasion-card-title">
                    {getLocalizedValue(occasion.name_en, occasion.name_ar, language)}
                  </p>
                </Link>
              </div>
            ))}
          </div>
          <hr className="mt-4 mb-3" />
          <div className="d-flex justify-content-between align-items-center px-2">
            <span role="button" className="text-dark fs-14">
              {t("lblClearSelection")}
            </span>
            <button
              className="btn rounded-3 text-white px-4 py-2 border-0 bg-blue fs-14 fw-semibold"
            >
              {t("lblApply")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
