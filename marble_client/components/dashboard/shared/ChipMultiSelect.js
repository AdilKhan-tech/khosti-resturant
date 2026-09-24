"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Searchable multi-select with optional thumbnails and removable chips
 * (HRM task assignee style, with type-ahead for large lists).
 *
 * Option shape: { id, label, image?: string|null, searchText?: string }
 */
export default function ChipMultiSelect({
  label,
  options = [],
  selectedIds = [],
  onChange,
  placeholder = "Search and select…",
  disabled = false,
  showImages = false,
}) {
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedSet = useMemo(
    () => new Set(selectedIds.map((id) => String(id))),
    [selectedIds],
  );

  const selectedOptions = useMemo(() => {
    const byId = new Map(options.map((option) => [String(option.id), option]));
    return selectedIds.map(
      (id) => byId.get(String(id)) || { id, label: `#${id}`, image: null },
    );
  }, [options, selectedIds]);

  const filteredOptions = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return options.filter((option) => {
      if (selectedSet.has(String(option.id))) return false;
      if (!needle) return true;
      const haystack = `${option.label || ""} ${option.searchText || ""} ${option.id}`
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [options, query, selectedSet]);

  const addId = (id) => {
    if (disabled || id == null || id === "") return;
    const nextId = Number.isNaN(Number(id)) ? id : Number(id);
    if (selectedSet.has(String(nextId))) return;
    onChange?.([...selectedIds, nextId]);
    setQuery("");
    inputRef.current?.focus();
  };

  const removeId = (id) => {
    if (disabled) return;
    onChange?.(selectedIds.filter((current) => String(current) !== String(id)));
  };

  return (
    <div
      className={`position-relative ${disabled ? "opacity-50" : ""}`}
      ref={wrapperRef}
    >
      {label ? <label className="form-label">{label}</label> : null}

      <div
        className="form-control d-flex align-items-center gap-2 textarea-hover-dark"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => {
          if (disabled) return;
          setOpen(true);
          inputRef.current?.focus();
        }}
      >
        <i className="bi bi-search text-secondary" aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          className="border-0 flex-grow-1 bg-transparent text-secondary chip-multiselect-input"
          value={query}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (!disabled) setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
              setQuery("");
            }
            if (event.key === "Enter") {
              event.preventDefault();
              if (filteredOptions[0]) addId(filteredOptions[0].id);
            }
          }}
        />
        <i
          className={`bi bi-chevron-${open ? "up" : "down"} text-secondary`}
          aria-hidden="true"
        />
      </div>

      {open && !disabled ? (
        <div
          className="border bg-white position-absolute mt-1 rounded-3 shadow-sm w-100 chip-multiselect-menu"
          role="listbox"
        >
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-secondary fs-14">No matches</div>
          ) : (
            filteredOptions.slice(0, 100).map((option) => (
              <button
                key={option.id}
                type="button"
                role="option"
                className="btn btn-light w-100 text-start d-flex align-items-center gap-2 rounded-0 border-0 px-3 py-2 chip-multiselect-option"
                onClick={() => addId(option.id)}
              >
                {showImages ? (
                  <img
                    src={option.image || "/assets/images/Cake-type.svg"}
                    alt=""
                    className="chip-multiselect-thumb rounded object-fit-cover flex-shrink-0"
                  />
                ) : null}
                <span className="fs-14 fnt-color text-truncate">{option.label}</span>
              </button>
            ))
          )}
          {filteredOptions.length > 100 ? (
            <div className="px-3 py-2 text-secondary small border-top">
              Showing first 100 matches — type more to narrow results
            </div>
          ) : null}
        </div>
      ) : null}

      {selectedOptions.length > 0 ? (
        <div className="mt-2 d-flex flex-wrap gap-2 mb-1">
          {selectedOptions.map((option) => (
            <div
              key={option.id}
              className="d-flex gap-2 align-items-center bg-light border py-1 px-2 rounded-2"
            >
              {showImages ? (
                <img
                  src={option.image || "/assets/images/Cake-type.svg"}
                  alt=""
                  className="chip-multiselect-chip-thumb rounded object-fit-cover flex-shrink-0"
                />
              ) : null}
              <span className="fs-14 fw-normal fnt-color text-nowrap">
                {option.label}
              </span>
              <button
                type="button"
                className="btn btn-link p-0 text-secondary lh-1"
                aria-label={`Remove ${option.label}`}
                disabled={disabled}
                onClick={() => removeId(option.id)}
              >
                <i className="bi bi-x-lg fs-12" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
