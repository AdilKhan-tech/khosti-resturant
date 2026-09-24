"use client";
import React, { useState, useEffect, useRef } from "react";

const BranchTimeRangePicker = ({ value, onChange, className = "" }) => {
  const amHours = ["1 AM","2 AM","3 AM","4 AM","5 AM","6 AM","7 AM","8 AM","9 AM","10 AM","11 AM","12 PM"];
  const pmHours = ["1 PM","2 PM","3 PM","4 PM","5 PM","6 PM","7 PM","8 PM","9 PM","10 PM","11 PM","12 AM"];

  const [isOpen, setIsOpen] = useState(false);
  const [selectedFrom, setSelectedFrom] = useState("");
  const [selectedTo, setSelectedTo] = useState("");
  const pickerRef = useRef(null);

  useEffect(() => {
    if (value) {
      const [from, to] = value.split(" - ");
      setSelectedFrom(from || "");
      setSelectedTo(to || "");
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectFrom = (hour) => {
    setSelectedFrom(hour);
    onChange(`${hour} - ${selectedTo}`);
  };

  const handleSelectTo = (hour) => {
    setSelectedTo(hour);
    onChange(`${selectedFrom} - ${hour}`);
  };

  const handleClear = () => {
    setSelectedFrom("");
    setSelectedTo("");
    onChange("");
    setIsOpen(false);
  };

  const handleDone = () => setIsOpen(false);

  return (
    <div className={`position-relative ${className}`} ref={pickerRef}>
      <input
        type="text"
        className="form-select input-hover-dark text-secondary fs-16 inputs-bg time-picker-input"
        placeholder="Select Time"
        value={selectedFrom && selectedTo ? `${selectedFrom} - ${selectedTo}` : ""}
        readOnly
        onClick={() => setIsOpen(!isOpen)}
      />

      {isOpen && (
        <div className="position-absolute bottom-100 start-0 mb-1 bg-white border rounded-3 shadow-lg time-picker-popup">
          <div className="d-flex justify-content-center align-items-center px-3 py-3 border-bottom fw-semibold fs-16 fnt-color">
            Select Time
          </div>

          <div className="d-flex gap-2 px-3 py-2">
            {/* From Column (AM) */}
            <div className="w-50">
              <div className="fw-medium fs-12 mb-1 text-dark text-center border rounded-2 py-1">Timing From</div>
              <div className="time-picker-list">
                {amHours.map(hour => (
                  <div
                    key={hour}
                    className={`time-picker-option rounded-3 mb-1 border text-center fs-12 py-1 ${selectedFrom === hour ? 'active text-white' : 'btn-outline-secondary'}`}
                    onClick={() => handleSelectFrom(hour)}
                  >
                    {hour}
                  </div>
                ))}
              </div>
            </div>

            {/* To Column (PM) */}
            <div className="w-50">
              <div className="fw-medium fs-12 mb-1 text-dark text-center border rounded-2 py-1">Timing To</div>
              <div className="time-picker-list">
                {pmHours.map(hour => (
                  <div
                    key={hour}
                    className={`time-picker-option rounded-3 mb-1 border text-center fs-12 py-1 ${selectedTo === hour ? 'active text-white' : 'btn-outline-secondary'}`}
                    onClick={() => handleSelectTo(hour)}
                  >
                    {hour}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="d-flex justify-content-between py-2 px-3 border-top">
            <div
              role="button"
              className="calender-clear-btn time-picker-clear px-1 rounded-3 border mb-1 fs-16 fw-medium text-secondary text-center py-2"
              onClick={handleClear}
            >
              Clear
            </div>

            <div
              role="button"
              className="calender-done-btn time-picker-done rounded-3 border mb-1 text-center fs-16 fw-medium text-white text-center py-2"
              onClick={handleDone}
            >
              Done
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchTimeRangePicker;
