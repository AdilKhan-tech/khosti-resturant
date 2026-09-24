"use client";

import { POPUP_LABEL_CLASS } from "@/components/dashboard/shared/popupFormClasses";

/**
 * Shared active/inactive status switch used in dashboard lists and popups.
 * Label + toggle sit side-by-side; no Active/Inactive text on the switch.
 */
export default function StatusToggle({
  id,
  checked = false,
  onChange,
  showLabel = true,
  label = "Status",
  labelClassName = `${POPUP_LABEL_CLASS} mb-0 d-inline`,
  disabled = false,
  className = "",
  "aria-label": ariaLabel,
}) {
  return (
    <div
      className={`d-flex align-items-center gap-3 popup-status-row ${className}`.trim()}
    >
      {showLabel ? (
        <label className={labelClassName} htmlFor={id}>
          {label}
        </label>
      ) : null}
      <div className="form-check form-switch mb-0 ps-0">
        <input
          id={id}
          className="form-check-input ms-0"
          type="checkbox"
          role="switch"
          checked={Boolean(checked)}
          disabled={disabled}
          aria-label={ariaLabel || label}
          onChange={(event) => onChange?.(event.target.checked, event)}
        />
      </div>
    </div>
  );
}
