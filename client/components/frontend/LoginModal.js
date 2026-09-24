"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginModal({ show, onClose }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (!show) {
    return null;
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    window.localStorage.setItem(
      "sona-auth",
      JSON.stringify({ email, loggedIn: true }),
    );
    onClose();
    router.push("/dashboard");
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
          <p className="section-tag mb-2">SONA PRIVATE ACCESS</p>
          <h2 id="login-modal-title">Welcome back.</h2>
          <p>Sign in to manage reservations and access your hotel dashboard.</p>
        </div>

        <form className="login-modal-form" onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="login-email" className="form-label">
              Email address
            </label>
            <input
              id="login-email"
              type="email"
              className="form-control form-control-lg"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
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
          >
            Sign in <i className="bi bi-arrow-right ms-2"></i>
          </button>
          <p className="login-modal-note mb-0 mt-3">
            Demo access accepts any valid email and non-empty password.
          </p>
        </form>
      </div>
    </div>
  );
}
