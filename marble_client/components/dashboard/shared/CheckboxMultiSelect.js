"use client";

import {
  POPUP_HELP_CLASS,
  POPUP_LABEL_CLASS,
} from "@/components/dashboard/shared/popupFormClasses";

/**
 * Checkbox multi-select grid used in dashboard popups.
 * Matches Cake Types / Branch Availability selection layout.
 */
export default function CheckboxMultiSelect({
  label,
  items = [],
  selectedIds = [],
  onChange,
  idPrefix = "multi",
  emptyMessage = "No options found.",
  getLabel = (item) => item.name_en || item.name || String(item.id),
  className = "",
}) {
  const toggleId = (id) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((value) => value !== id)
      : [...selectedIds, id];
    onChange?.(next);
  };

  const toggleAll = () => {
    const allIds = items.map((item) => item.id);
    const allSelected =
      allIds.length > 0 && allIds.every((id) => selectedIds.includes(id));
    onChange?.(allSelected ? [] : allIds);
  };

  return (
    <div className={`form-group mt-3 popup-form-full ${className}`.trim()}>
      <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
        <div>
          <label className={`${POPUP_LABEL_CLASS} mb-0 d-block`}>
            {label}
          </label>
          <small className="d-block text-secondary">
            {selectedIds.length} selected
          </small>
        </div>
        <button
          type="button"
          className="form-cancel-btn d-inline-flex align-items-center gap-2 bg-white border rounded-3 text-muted fs-14 px-3 py-1"
          disabled={!items.length}
          onClick={toggleAll}
        >
          Select all
        </button>
      </div>
      {!items.length ? (
        <p className={POPUP_HELP_CLASS}>{emptyMessage}</p>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 g-2">
          {items.map((item) => {
            const inputId = `${idPrefix}-${item.id}`;
            return (
              <div className="col" key={item.id}>
                <div className="form-check border rounded-2 p-2 ps-5 h-100">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={inputId}
                    checked={selectedIds.includes(item.id)}
                    onChange={() => toggleId(item.id)}
                  />
                  <label
                    className="form-check-label w-100 fs-14 fnt-color"
                    htmlFor={inputId}
                  >
                    {getLabel(item)}
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
