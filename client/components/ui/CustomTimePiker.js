"use client";

import { useEffect, useRef, useState } from "react";

const hourOptions = Array.from({ length: 12 }, (_, index) => index + 1);
const minuteOptions = [0, 15, 30, 45];

function parseTimeValue(value) {
  if (!value) {
    return { hour: 10, minute: 0, period: "AM" };
  }

  const hasPeriod = value.includes(" ");
  const [timePart, rawPeriod] = hasPeriod ? value.split(" ") : [value, ""];
  const [hours, minutes] = timePart.split(":").map((part) => Number(part));

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return { hour: 10, minute: 0, period: "AM" };
  }

  let normalizedPeriod = rawPeriod
    ? rawPeriod.toUpperCase()
    : hours >= 12
      ? "PM"
      : "AM";
  let normalizedHour = hours % 12;

  if (normalizedHour === 0) {
    normalizedHour = 12;
  }

  return {
    hour: normalizedHour,
    minute: minutes,
    period: normalizedPeriod,
  };
}

function formatTime(value) {
  if (!value) return "Select time";

  const { hour, minute, period } = parseTimeValue(value);
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`;
}

function to24Hour(hour, period) {
  const normalizedHour = hour % 12;

  if (period === "PM") {
    return normalizedHour === 0 ? 12 : normalizedHour + 12;
  }

  return normalizedHour === 0 ? 0 : normalizedHour;
}

export default function CustomTimePiker({
  label,
  value,
  onChange,
  placeholder = "Select time",
}) {
  const wrapperRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState(
    parseTimeValue(value || "10:00 AM"),
  );

  useEffect(() => {
    if (value) {
      setSelectedTime(parseTimeValue(value));
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

  const updateTime = (nextHour, nextMinute, nextPeriod) => {
    const timeValue = `${String(to24Hour(nextHour, nextPeriod)).padStart(2, "0")}:${String(nextMinute).padStart(2, "0")}`;
    setSelectedTime({ hour: nextHour, minute: nextMinute, period: nextPeriod });
    onChange(timeValue);
  };

  const handleHourShift = (direction) => {
    const nextHour = ((selectedTime.hour - 1 + direction + 12) % 12) + 1;
    updateTime(nextHour, selectedTime.minute, selectedTime.period);
  };

  const handleMinuteShift = (direction) => {
    const currentMinuteIndex = minuteOptions.indexOf(selectedTime.minute);
    const nextMinuteIndex =
      (currentMinuteIndex + direction + minuteOptions.length) %
      minuteOptions.length;
    const nextMinute = minuteOptions[nextMinuteIndex];
    updateTime(selectedTime.hour, nextMinute, selectedTime.period);
  };

  const handlePeriodShift = (nextPeriod) => {
    updateTime(selectedTime.hour, selectedTime.minute, nextPeriod);
  };

  return (
    <div className="custom-time-field" ref={wrapperRef}>
      {label ? <label className="form-label fw-semibold">{label}</label> : null}

      <button
        type="button"
        className="custom-date-trigger custom-time-trigger"
        onClick={() => setIsOpen((previous) => !previous)}
      >
        <span className="custom-date-icon">
          <i className="bi bi-clock" />
        </span>
        <span className="custom-date-text">
          {value ? formatTime(value) : placeholder}
        </span>
        <span className="custom-date-arrow" aria-hidden="true">
          <i className="bi bi-chevron-down" />
        </span>
      </button>

      {isOpen ? (
        <div
          className="custom-date-popover custom-time-popover"
          role="dialog"
          aria-label={label || "Time picker"}
        >
          <div className="custom-date-header custom-time-header">
            <button
              type="button"
              className="custom-date-nav"
              onClick={() => handleHourShift(-1)}
              aria-label="Previous hour"
            >
              <i className="bi bi-chevron-left" />
            </button>

            <span className="custom-time-display">
              {String(selectedTime.hour).padStart(2, "0")} :{" "}
              {String(selectedTime.minute).padStart(2, "0")}
            </span>

            <button
              type="button"
              className="custom-date-nav"
              onClick={() => handleHourShift(1)}
              aria-label="Next hour"
            >
              <i className="bi bi-chevron-right" />
            </button>
          </div>

          <div className="custom-time-body">
            <div className="custom-time-panel">
              {hourOptions.map((hour) => (
                <button
                  key={hour}
                  type="button"
                  className={`custom-time-option ${selectedTime.hour === hour ? "selected" : ""}`}
                  onClick={() =>
                    updateTime(hour, selectedTime.minute, selectedTime.period)
                  }
                >
                  {String(hour).padStart(2, "0")}
                </button>
              ))}
            </div>

            <div className="custom-time-panel">
              {minuteOptions.map((minute) => (
                <button
                  key={minute}
                  type="button"
                  className={`custom-time-option ${selectedTime.minute === minute ? "selected" : ""}`}
                  onClick={() =>
                    updateTime(selectedTime.hour, minute, selectedTime.period)
                  }
                >
                  {String(minute).padStart(2, "0")}
                </button>
              ))}
            </div>

            <div className="custom-time-periods">
              {["AM", "PM"].map((period) => (
                <button
                  key={period}
                  type="button"
                  className={`custom-time-period ${selectedTime.period === period ? "selected" : ""}`}
                  onClick={() => handlePeriodShift(period)}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
