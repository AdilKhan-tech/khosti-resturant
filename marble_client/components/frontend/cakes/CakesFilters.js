"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import marbleUploadUrl from "@/utils/marbleUploadUrl";
import { getLocalizedLabel, getLocalizedValue } from "@/utils/localizedContent";

const FILTER_KEYS = ["cake_type_ids", "occasion_ids", "portion_size_ids", "gender_ids"];

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

function FilterCard({ item, active, onClick, className = "", language = "en" }) {
  const image = item.image_url ? marbleUploadUrl(item.image_url) : "/assets/images/placeholder.png";
  const itemName = getLocalizedValue(item.name_en, item.name_ar, language);

  return (
    <button
      type="button"
      className={`position-relative text-center p-3 rounded-3 border w-100 h-100 filter-card ${active ? "active" : ""} ${className}`}
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
      <img
        src={image}
        alt={itemName}
        className="object-fit-contain mb-2 size-58"
      />
      <div className="titlediv">
        <h3 className="fs-16 m-0 text-center text-brown font-brandon-bold">{itemName}</h3>
      </div>
    </button>
  );
}

function FilterSection({ title, items, selectedIds, onToggle, columns = "col-md-4", language = "en" }) {
  if (!items.length) return null;

  return (
    <div className="filterdiv mt-4">
      <h4 className="font-brandon-bold fs-20 text-brown">{title}</h4>
      <div className="row w-100 mx-auto">
        {items.map((item) => (
          <div key={item.id} className={`${columns} mb-2 px-2`}>
            <FilterCard
              item={item}
              active={selectedIds.includes(item.id)}
              onClick={() => onToggle(item.id)}
              language={language}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CakesFilters({
  cakeTypes = [],
  occasions = [],
  portionSizes = [],
  genders = [],
  selected = {},
  language = "en",
}) {
  const router = useRouter();
  const t = (labelKey, fallback) => getLocalizedLabel(labelKey, language, fallback);
  const offcanvasSideClass = language === "ar" ? "offcanvas-start" : "offcanvas-end";
  const [cakeTypeIds, setCakeTypeIds] = useState(() => idsFromValue(selected.cake_type_ids));
  const [occasionIds, setOccasionIds] = useState(() => idsFromValue(selected.occasion_ids));
  const [portionSizeIds, setPortionSizeIds] = useState(() => idsFromValue(selected.portion_size_ids));
  const [genderIds, setGenderIds] = useState(() => idsFromValue(selected.gender_ids));

  const selectedCount = useMemo(() => {
    return [cakeTypeIds, occasionIds, portionSizeIds, genderIds].filter((items) => items.length > 0).length;
  }, [cakeTypeIds, occasionIds, portionSizeIds, genderIds]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (selected.s) params.set("s", selected.s);
    if (cakeTypeIds.length) params.set("cake_type_ids", cakeTypeIds.join(","));
    if (occasionIds.length) params.set("occasion_ids", occasionIds.join(","));
    if (portionSizeIds.length) params.set("portion_size_ids", portionSizeIds.join(","));
    if (genderIds.length) params.set("gender_ids", genderIds.join(","));

    router.push(`/product-category/cakes${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const clearFilters = () => {
    setCakeTypeIds([]);
    setOccasionIds([]);
    setPortionSizeIds([]);
    setGenderIds([]);

    const params = new URLSearchParams();
    if (selected.s) params.set("s", selected.s);
    router.push(`/product-category/cakes${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const clearSearch = () => {
    const params = new URLSearchParams();
    if (selected.cake_type_ids) params.set("cake_type_ids", selected.cake_type_ids);
    if (selected.occasion_ids) params.set("occasion_ids", selected.occasion_ids);
    if (selected.portion_size_ids) params.set("portion_size_ids", selected.portion_size_ids);
    if (selected.gender_ids) params.set("gender_ids", selected.gender_ids);
    router.push(`/product-category/cakes${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <>
      <div className="row py-3 align-items-center border-top product-list-toolbar-row">
        <div className="col-md-12">
          <div className="product-list-toolbar d-flex align-items-center gap-2 flex-nowrap">
            <button
              className="btn product-list-filter-btn rounded-pill border px-3 py-1 fw-semibold text-brown fs-14 bg-transparent d-flex align-items-center gap-1"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#mobilefilter"
              aria-controls="mobilefilter"
              id="filteraddClass"
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
            <form
              className="product-list-search d-flex searchform search-form-compact"
              role="search"
              method="GET"
              action="/product-category/cakes"
            >
              {FILTER_KEYS.map((key) => selected[key] ? (
                <input key={key} type="hidden" name={key} value={selected[key]} />
              ) : null)}
              <input
                className="form-control rounded-pill border px-3 py-1 text-brown fs-14 rounded-end-0 border-end-0"
                id="search-bar"
                type="search"
                placeholder={t("lblSearchPlaceholder")}
                aria-label={t("lblSearchPlaceholder")}
                name="s"
                defaultValue={selected.s || ""}
              />
              <button
                id="clear-search"
                className="btn bg-transparent border border-start-0 border-end-0 rounded-0 px-1 py-1 text-brown fs-14"
                type="button"
                aria-label={t("lblClearSearch")}
                onClick={clearSearch}
              >
                <i className="bi bi-x"></i>
              </button>
              <button
                className="btn rounded-pill border px-3 py-1 text-white fs-14 rounded-start-0 bg-brand-pink border-brand-pink"
                type="submit"
                aria-label={t("lblSearchPlaceholder")}
              >
                <i className="bi bi-search"></i>
              </button>
            </form>
          </div>
        </div>
      </div>

      <div
        className={`offcanvas ${offcanvasSideClass} filter-offcanvas`}
        tabIndex="-1"
        id="mobilefilter"
        aria-labelledby="mobilefilterLabel"
      >
        <div className="offcanvas-header bg-light">
          <div></div>
          <h5 className="offcanvas-title font-brandon-bold fs-20 text-brown m-0" id="mobilefilterLabel">{t("lblFilters")}</h5>
          <button type="button" className="btn-close pt-1" data-bs-dismiss="offcanvas" aria-label={t("lblClose")}>
          </button>
        </div>
        <div className="offcanvas-body pb-5">
          <FilterSection
            title={t("lblCakeType")}
            items={cakeTypes}
            selectedIds={cakeTypeIds}
            onToggle={(id) => setCakeTypeIds((items) => toggleId(items, id))}
            language={language}
          />
          <FilterSection
            title={t("lblOccasionsTitle")}
            items={occasions}
            selectedIds={occasionIds}
            onToggle={(id) => setOccasionIds((items) => toggleId(items, id))}
            columns="col-md-3"
            language={language}
          />
          <FilterSection
            title={t("lblPortionSize")}
            items={portionSizes}
            selectedIds={portionSizeIds}
            onToggle={(id) => setPortionSizeIds((items) => toggleId(items, id))}
            columns="col-md-3"
            language={language}
          />
          <FilterSection
            title={t("lblFor")}
            items={genders}
            selectedIds={genderIds}
            onToggle={(id) => setGenderIds((items) => toggleId(items, id))}
            language={language}
          />
          <div className="modal-footer border-0 position-sticky p-2 w-100 start-0 bottom-0 bg-white gap-2">
            <button
              type="button"
              id="clearall-filters"
              className="px-0 btn-secondary bg-transparent border-0 text-brown fs-18 fw-semibold clearSelectedCook"
              onClick={clearFilters}
              data-bs-dismiss="offcanvas"
            >
              {t("lblClearSelection")}
            </button>
            <button
              type="button"
              id="apply-filters-btn"
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
