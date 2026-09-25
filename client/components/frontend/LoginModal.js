"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginModal({ show, onClose }) {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!show) {
    return null;
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!phoneNumber || !password) {
      setError("Please enter your phone number and password.");
      return;
    }

    setLoading(true);
    setError("");

    fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/users/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number: phoneNumber,
          password,
        }),
      },
    )
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.message || "Invalid login credentials.");
        }
        return data;
      })
      .then((data) => {
        window.localStorage.setItem(
          "sona-auth",
          JSON.stringify({
            token: data.token,
            user: data.user,
            loggedIn: true,
          }),
        );
        onClose();
        router.push("/dashboard");
      })
      .catch((requestError) => {
        setError(requestError.message || "Unable to sign in.");
      })
      .finally(() => setLoading(false));
  }

  return (
    <div
      className="login-modal-backdrop"
      role="presentation"
      onMouseDown={onClose}
    >
      <div
        className="login-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="login-modal-close"
          aria-label="Close login"
          onClick={onClose}
        >
          <i className="bi bi-x-lg"></i>
        </button>

        <div className="login-modal-intro">
          <span className="brand-mark mb-4">S</span>
          <p className="section-tag mb-2">KHOSTI PRIVATE ACCESS</p>
          <h2 id="login-modal-title">Welcome back.</h2>
          <p>Sign in to manage reservations and access your hotel dashboard.</p>
        </div>

        <form className="login-modal-form" onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="login-phone" className="form-label">
              Phone number
            </label>
            <input
              id="login-phone"
              type="tel"
              className="form-control form-control-lg"
              placeholder="0500000000"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              autoComplete="tel"
            />
          </div>
          <div className="mb-2">
            <label htmlFor="login-password" className="form-label">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              className="form-control form-control-lg"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
          </div>
          {error ? <p className="login-error mb-3">{error}</p> : null}
          <button
            type="submit"
            className="btn btn-primary w-100 py-3 fw-semibold"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
            <i className="bi bi-arrow-right ms-2"></i>
          </button>
          <p className="login-modal-note mb-0 mt-3">
            Use the phone number and password stored in your account.
          </p>
        </form>
      </div>
    </div>
  );
}
