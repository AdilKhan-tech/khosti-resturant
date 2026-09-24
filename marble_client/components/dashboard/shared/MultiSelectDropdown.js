"use client";
import React, { useEffect, useRef, useState } from "react";

export default function MultiSelectDropdown({
  label,
  items = [],
  selectedIds = [],
  setSelectedIds,
  placeholder = "Select",
}) {
  const wrapperRef = useRef(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleItem = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    if (items.length > 0 && selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((i) => i.id));
    }
  };

  const selectedNames = items
    .filter((i) => selectedIds.includes(i.id))
    .map((i) => i.name_en || i.name);

  return (
    <div className="form-group mt-0 position-relative" ref={wrapperRef}>
      {label ? <label className="form-label">{label}</label> : null}

      <div
        className="form-control d-flex justify-content-between align-items-center cursor-pointer textarea-hover-dark text-secondary"
        role="button"
        tabIndex={0}
        onClick={() => setOpen(!open)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen((current) => !current);
          }
        }}
      >
        <div className="d-flex flex-wrap gap-1">
          {selectedNames.length ? (
            selectedNames.map((name) => (
              <span key={name} className="px-2 py-1 border rounded-2 small fs-14 fnt-color">
                {name}
              </span>
            ))
          ) : (
            <span className="text-secondary">{placeholder}</span>
          )}
        </div>
        <i className={`bi bi-chevron-${open ? "up" : "down"}`} />
      </div>

      {open && (
        <div className="border bg-white p-2 position-absolute mt-1 rounded-3 shadow-sm w-100 dashboard-multiselect-menu">
          <div className="d-flex align-items-start justify-content-between gap-2 mb-2 px-1">
            <small className="text-secondary">
              {selectedIds.length} selected
            </small>
            <button
              type="button"
              className="form-cancel-btn d-inline-flex align-items-center gap-2 bg-white border rounded-3 text-muted fs-14 px-3 py-1"
              disabled={!items.length}
              onClick={(event) => {
                event.stopPropagation();
                toggleAll();
              }}
            >
              Select all
            </button>
          </div>
          <div className="row row-cols-1 g-2">
            {items.map((item) => {
              const inputId = `dropdown-${label}-${item.id}`.replace(/\s+/g, "-");
              return (
                <div className="col" key={item.id}>
                  <div className="form-check border rounded-2 p-2 ps-5">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={inputId}
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleItem(item.id)}
                    />
                    <label
                      className="form-check-label w-100 fs-14 fnt-color"
                      htmlFor={inputId}
                    >
                      {item.name_en || item.name}
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
