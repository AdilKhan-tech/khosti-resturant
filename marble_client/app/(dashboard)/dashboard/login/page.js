"use client";

import React, { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { hasDashboardAccess } from "@/utils/rbac/rbacAccess";

export default function AdminLoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const user = session?.user;
  const authenticated = status === "authenticated";
  const authorized = authenticated && hasDashboardAccess(user);

  // Authorized staff who land here go straight to the dashboard.
  useEffect(() => {
    if (authorized) {
      router.replace("/dashboard");
    }
  }, [authorized, router]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        auth_mode: "admin",
        phone_number: phone.trim(),
        password,
      });

      if (result?.ok) {
        router.replace("/dashboard");
        router.refresh();
      } else {
        setError("Invalid credentials or this account cannot access the dashboard.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3">
      <div
        className="bg-white border-0 shadow-sm rounded-4 p-4 p-md-5 w-100"
        style={{ maxWidth: 420 }}
      >
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center gap-2 fs-4 fw-semibold fnt-color">
            <i className="bi bi-grid text-orange"></i>
            <span>Marble Dashboard</span>
          </div>
          <p className="text-secondary small mb-0 mt-2">
            Sign in with your phone number and password.
          </p>
        </div>

        {authenticated && !authorized ? (
          <div className="alert alert-warning" role="alert">
            You are signed in as a customer account, which cannot access the admin
            dashboard.
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary w-100 mt-2"
              onClick={() => signOut({ redirect: false })}
            >
              Sign out and use another account
            </button>
          </div>
        ) : null}

        <form onSubmit={handleSubmit}>
          <label className="form-label" htmlFor="admin-phone">
            Phone number
          </label>
          <input
            id="admin-phone"
            type="tel"
            className="form-control mb-3"
            placeholder="05XXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="username"
            required
          />

          <label className="form-label" htmlFor="admin-password">
            Password
          </label>
          <div className="position-relative mb-3">
            <input
              id="admin-password"
              type={showPassword ? "text" : "password"}
              className="form-control pe-5"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="btn position-absolute top-50 end-0 translate-middle-y border-0 text-secondary"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
            </button>
          </div>

          {error ? (
            <div className="alert alert-danger py-2 small" role="alert">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            className="btn-orange text-white fs-16 w-100 text-nowrap"
            disabled={submitting}
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
