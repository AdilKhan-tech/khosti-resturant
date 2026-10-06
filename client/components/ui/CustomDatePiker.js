"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthLabels = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function toLocalISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value) {
  if (!value) return "Select date";

  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function buildMonthGrid(viewDate) {
  const firstDayOfMonth = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth(),
    1,
  );
  const startOffset = firstDayOfMonth.getDay();
  const firstGridDate = new Date(firstDayOfMonth);
  firstGridDate.setDate(firstDayOfMonth.getDate() - startOffset);

  const days = [];

  for (let index = 0; index < 42; index += 1) {
    const date = new Date(firstGridDate);
    date.setDate(firstGridDate.getDate() + index);

    days.push({
      date,
      inMonth: date.getMonth() === viewDate.getMonth(),
    });
  }

  return days;
}

export default function CustomDatePiker({
  label,
  value,
  onChange,
  placeholder = "Select date",
  minDate,
}) {
  const wrapperRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(
    value ? new Date(`${value}T12:00:00`) : new Date(),
  );

  useEffect(() => {
    if (value) {
      setCurrentMonth(new Date(`${value}T12:00:00`));
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const monthDays = useMemo(() => buildMonthGrid(currentMonth), [currentMonth]);
  const selectedDate = value ? new Date(`${value}T12:00:00`) : null;

  const handleSelect = (date) => {
    const nextValue = toLocalISO(date);
    onChange(nextValue);
    setCurrentMonth(new Date(date));
    setIsOpen(false);
  };

  return (
    <div className="custom-date-field" ref={wrapperRef}>
      {label ? <label className="form-label fw-semibold">{label}</label> : null}

      <button
        type="button"
        className="custom-date-trigger"
        onClick={() => setIsOpen((previous) => !previous)}
      >
        <span className="custom-date-icon">
          <i className="bi bi-calendar3" />
        </span>
        <span className="custom-date-text">
          {value ? formatDisplayDate(value) : placeholder}
        </span>
        <span className="custom-date-arrow" aria-hidden="true">
          <i className="bi bi-chevron-down" />
        </span>
      </button>

      {isOpen ? (
        <div
          className="custom-date-popover"
          role="dialog"
          aria-label={label || "Date picker"}
        >
          <div className="custom-date-header">
            <button
              type="button"
              className="custom-date-nav"
              onClick={() =>
                setCurrentMonth(
                  new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() - 1,
                    1,
                  ),
                )
              }
              aria-label="Previous month"
            >
              <i className="bi bi-chevron-left" />
            </button>

            <span className="custom-date-month-label">
              {monthLabels[currentMonth.getMonth()]}{" "}
              {currentMonth.getFullYear()}
            </span>

            <button
              type="button"
              className="custom-date-nav"
              onClick={() =>
                setCurrentMonth(
                  new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() + 1,
                    1,
                  ),
                )
              }
              aria-label="Next month"
            >
              <i className="bi bi-chevron-right" />
            </button>
          </div>

          <div className="custom-date-weekdays">
            {weekdayLabels.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="custom-date-grid">
            {monthDays.map(({ date, inMonth }) => {
              const isSelected =
                selectedDate &&
                selectedDate.getFullYear() === date.getFullYear() &&
                selectedDate.getMonth() === date.getMonth() &&
                selectedDate.getDate() === date.getDate();

              const isDisabled =
                !!minDate && date < new Date(`${minDate}T00:00:00`);

              return (
                <button
                  key={toLocalISO(date)}
                  type="button"
                  className={`custom-date-day ${inMonth ? "" : "is-other-month"} ${
                    isSelected ? "selected" : ""
                  }`}
                  onClick={() => !isDisabled && !!inMonth && handleSelect(date)}
                  disabled={isDisabled || !inMonth}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
