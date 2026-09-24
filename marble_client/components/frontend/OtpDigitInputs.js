"use client";

import { useRef } from "react";

const OTP_LENGTH = 4;

/**
 * Multi-box OTP input matching the WP storefront verify popup
 * (`.verification-code-inputs` / `.otp-input`).
 */
export default function OtpDigitInputs({
  value = "",
  onChange,
  disabled = false,
  idPrefix = "otp",
}) {
  const digits = String(value || "")
    .replace(/\D/g, "")
    .slice(0, OTP_LENGTH)
    .padEnd(OTP_LENGTH, " ")
    .split("")
    .map((ch) => (ch === " " ? "" : ch));

  const refs = useRef([]);

  const emit = (nextDigits) => {
    onChange?.(nextDigits.join(""));
  };

  const focusAt = (index) => {
    const el = refs.current[index];
    if (el) el.focus();
  };

  const handleChange = (index, raw) => {
    const cleaned = String(raw || "").replace(/\D/g, "");
    if (!cleaned) {
      const next = [...digits];
      next[index] = "";
      emit(next);
      return;
    }

    // Paste or autofill into one box: distribute digits.
    if (cleaned.length > 1) {
      const next = [...digits];
      cleaned
        .slice(0, OTP_LENGTH - index)
        .split("")
        .forEach((d, i) => {
          next[index + i] = d;
        });
      emit(next);
      focusAt(Math.min(index + cleaned.length, OTP_LENGTH - 1));
      return;
    }

    const next = [...digits];
    next[index] = cleaned;
    emit(next);
    if (index < OTP_LENGTH - 1) focusAt(index + 1);
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault();
      const next = [...digits];
      next[index - 1] = "";
      emit(next);
      focusAt(index - 1);
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pasted = String(event.clipboardData?.getData("text") || "")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((d, i) => {
      next[i] = d;
    });
    emit(next);
    focusAt(Math.min(pasted.length, OTP_LENGTH) - 1);
  };

  return (
    <div
      className="verification-code-inputs d-flex flex-row justify-content-center mt-2 mb-3"
      role="group"
      aria-label="OTP"
    >
      {digits.map((digit, index) => (
        <input
          key={`${idPrefix}-${index}`}
          ref={(el) => {
            refs.current[index] = el;
          }}
          id={index === 0 ? `${idPrefix}_1` : undefined}
          type="tel"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          className="otp-input m-1 text-center form-control rounded"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  );
}

export { OTP_LENGTH };
