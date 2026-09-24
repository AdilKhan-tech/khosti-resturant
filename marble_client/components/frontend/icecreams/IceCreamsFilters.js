"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import marbleUploadUrl from "@/utils/marbleUploadUrl";
import { getLocalizedLabel, getLocalizedValue } from "@/utils/localizedContent";

function idsFromValue(value) {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item > 0);
}

function toggleId(items, id) {
  return items.includes(id) ? items.filter((item) => item !== id) : [...items, id];
}

function FilterCard({ item, active, onClick, language = "en" }) {
  const image = marbleUploadUrl(item.image_url);
  const itemName = getLocalizedValue(item.name_en, item.name_ar, language);

  return (
    <button
      type="button"
      className={`position-relative text-center p-3 rounded-3 border w-100 h-100 filter-card ${active ? "active" : ""}`}
      aria-pressed={active}
      onClick={onClick}
    >
      {active && (
        <span
          className="position-absolute top-0 end-0 translate-middle badge rounded-circle text-white bg-blue"
        >
          <i className="bi bi-check-lg" aria-hidden="true"></i>
        </span>
      )}
      {image ? (
        <img
          src={image}
          alt={itemName}
          className="object-fit-contain mb-2 size-58"
        />
      ) : (
        <i className="bi bi-image color-brown fs-1 d-block mb-2" aria-hidden="true"></i>
      )}
      <div className="titlediv">
        <h3 className="fs-16 m-0 text-center text-brown font-brandon-bold">{itemName}</h3>
      </div>
    </button>
  );
}

function PortionSizeGrid({ portionSizes, selectedIds, onToggle, language = "en" }) {
  const t = (labelKey, fallback) => getLocalizedLabel(labelKey, language, fallback);

  if (!portionSizes.length) {
    return <p className="text-brown mb-0">{t("lblNoPortionSizesFound")}</p>;
  }

  return (
    <div className="row w-100 mx-auto">
      {portionSizes.map((item) => (
        <div key={item.id} className="col-md-4 mb-2 px-2">
          <FilterCard
            item={item}
            active={selectedIds.includes(item.id)}
            onClick={() => onToggle(item.id)}
            language={language}
          />
        </div>
      ))}
    </div>
  );
}

export default function IceCreamsFilters({ portionSizes = [], selected = {}, language = "en" }) {
  const router = useRouter();
  const t = (labelKey, fallback) => getLocalizedLabel(labelKey, language, fallback);
  const offcanvasSideClass = language === "ar" ? "offcanvas-start" : "offcanvas-end";
  const [portionSizeIds, setPortionSizeIds] = useState(() => idsFromValue(selected.icecream_portion_size_ids));

  const selectedCount = useMemo(() => portionSizeIds.length > 0 ? 1 : 0, [portionSizeIds]);

  const routeWithFilters = (ids) => {
    const params = new URLSearchParams();
    if (ids.length) params.set("icecream_portion_size_ids", ids.join(","));
    return `/product-category/icecreams${params.toString() ? `?${params.toString()}` : ""}`;
  };

  const applyFilters = () => {
    router.push(routeWithFilters(portionSizeIds));
  };

  const clearFilters = () => {
    setPortionSizeIds([]);
    router.push("/product-category/icecreams");
  };

  return (
    <>
      <div className="row py-3 align-items-center border-top">
        <div className="col-md-8 d-none d-sm-block">
          <div className="dropdown d-inline-block">
            <button
              className={`btn rounded-pill border px-3 py-1 fw-semibold text-brown fs-14 bg-transparent dropdown-toggle ${selectedCount ? "filter-toggle-active" : ""}`}
              type="button"
              id="dropdownIceCreamPortionSize"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {t("lblPortionSize")}
              {selectedCount > 0 && (
                <span className="badge rounded-circle text-white ms-2 bg-brand-pink">
                  {selectedCount}
                </span>
              )}
            </button>
            <div
              className="dropdown-menu p-3 border-0 shadow rounded-4 filter-menu"
              aria-labelledby="dropdownIceCreamPortionSize"
            >
              <PortionSizeGrid
                portionSizes={portionSizes}
                selectedIds={portionSizeIds}
                onToggle={(id) => setPortionSizeIds((items) => toggleId(items, id))}
                language={language}
              />
              <hr className="mx-1" />
              <div className="modal-footer border-0 gap-2">
                <button
                  type="button"
                  className="px-0 btn-secondary me-auto bg-transparent border-0 text-brown fs-18 fw-semibold"
                  onClick={clearFilters}
                >
                  {t("lblClearSelection")}
                </button>
                <button
                  type="button"
                  className="btn rounded-pill text-white fw-bold px-3 bg-blue"
                  onClick={applyFilters}
                >
                  {t("lblApply")}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="d-flex justify-content-md-end justify-content-between gap-4">
            <button
              type="button"
              className="px-0 btn-secondary bg-transparent border-0 text-brown fs-18 fw-semibold d-flex align-items-center gap-2"
              onClick={clearFilters}
            >
              <i className="bi bi-slash-circle" aria-hidden="true"></i>
              {t("lblResetFilters")}
              {selectedCount > 0 && (
                <span className="badge rounded-circle text-white bg-brand-pink">
                  {selectedCount}
                </span>
              )}
            </button>
            <button
              className="btn rounded-pill border px-3 py-1 fw-semibold text-brown fs-14 bg-transparent d-sm-none d-flex align-items-center gap-1"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#icecreamMobileFilter"
              aria-controls="icecreamMobileFilter"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17" fill="none">
                <path d="M1.33203 1.33301H14.6654V3.14301C14.6653 3.585 14.4896 4.00885 14.177 4.32134L10.4987 7.99967V13.833L5.4987 15.4997V8.41634L1.76536 4.30967C1.48657 4.00295 1.33208 3.60334 1.33203 3.18884V1.33301Z" stroke="#584340" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t("lblFilters")}
              {selectedCount > 0 && (
                <span className="badge rounded-circle text-white bg-brand-pink">
                  {selectedCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div
        className={`offcanvas ${offcanvasSideClass} filter-offcanvas`}
        tabIndex="-1"
        id="icecreamMobileFilter"
        aria-labelledby="icecreamMobileFilterLabel"
      >
        <div className="offcanvas-header bg-light">
          <div></div>
          <h5 className="offcanvas-title font-brandon-bold fs-20 text-brown m-0" id="icecreamMobileFilterLabel">{t("lblFilters")}</h5>
          <button type="button" className="btn-close pt-1" data-bs-dismiss="offcanvas" aria-label={t("lblClose")}></button>
        </div>
        <div className="offcanvas-body pb-5">
          <div className="portion-sizediv mt-4">
            <h4 className="font-brandon-bold fs-20 text-brown">{t("lblPortionSize")}</h4>
            <PortionSizeGrid
              portionSizes={portionSizes}
              selectedIds={portionSizeIds}
              onToggle={(id) => setPortionSizeIds((items) => toggleId(items, id))}
              language={language}
            />
          </div>

          <div className="modal-footer border-0 position-sticky p-2 w-100 start-0 bottom-0 bg-white gap-2">
            <button
              type="button"
              className="px-0 btn-secondary bg-transparent border-0 text-brown fs-18 fw-semibold"
              onClick={clearFilters}
              data-bs-dismiss="offcanvas"
            >
              {t("lblClearSelection")}
            </button>
            <button
              type="button"
              className="btn rounded-pill text-white fw-bold px-3 flex-grow-1 bg-blue"
              onClick={applyFilters}
              data-bs-dismiss="offcanvas"
            >
              {t("lblApply")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
