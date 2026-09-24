"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  submitPublicFeedbackRoute,
} from "@/utils/apiRoutes";
import apiKeyMapping from "@/configs/apiKeyMapping";
import axios from "axios";

const PUBLIC_REVIEW_TYPES = ["Review", "Complaint", "Inquiry", "Suggestion"];

function getApiKey() {
  if (typeof window === "undefined") return apiKeyMapping.localhost;
  const hostName = window.location.hostname;
  return apiKeyMapping[hostName] || apiKeyMapping.localhost;
}

/**
 * Shared public feedback form for QR code and Marble Van pages.
 */
export default function PublicFeedbackForm({
  branch,
  fixedReviewType = null,
  source = "Website",
  thankYouPath = "/feedback-qr-code/thank-you",
  title = "Share your feedback",
  subtitle = null,
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    customer_name: "",
    phone: "",
    city: "",
    review_type: fixedReviewType || "Review",
    rating: 5,
    comments: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!branch) {
      setError("Branch is required.");
      return;
    }
    if (!form.customer_name.trim() || !form.phone.trim() || !form.comments.trim()) {
      setError("Name, phone, and comments are required.");
      return;
    }

    const payload = {
      customer_name: form.customer_name.trim(),
      phone: form.phone.trim(),
      city: form.city.trim() || undefined,
      branch,
      review_type: fixedReviewType || form.review_type,
      rating: Number(form.rating),
      comments: form.comments.trim(),
      entry_type: "website",
      source,
    };

    setSaving(true);
    try {
      await axios.post(submitPublicFeedbackRoute, payload, {
        headers: { "X-API-KEY": getApiKey() },
      });
      router.push(thankYouPath);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.errors?.[0] ||
          "Failed to submit feedback. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-6">
          <h1 className="font-brandon-bold text-brown fs-35 mb-2">{title}</h1>
          {subtitle ? (
            <p className="text-brown-50 fs-18 mb-4">{subtitle}</p>
          ) : (
            <p className="text-brown-50 fs-18 mb-4">
              We appreciate your feedback and will follow up if needed.
            </p>
          )}

          {error ? (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="bg-white p-4 rounded-3 shadow-sm">
            <div className="mb-3">
              <label className="form-label font-brandon-bold text-brown">Name</label>
              <input
                type="text"
                className="form-control"
                value={form.customer_name}
                onChange={(e) => setField("customer_name", e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label font-brandon-bold text-brown">Phone</label>
              <input
                type="tel"
                className="form-control"
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label font-brandon-bold text-brown">City</label>
              <input
                type="text"
                className="form-control"
                value={form.city}
                onChange={(e) => setField("city", e.target.value)}
              />
            </div>

            {!fixedReviewType ? (
              <div className="mb-3">
                <label className="form-label font-brandon-bold text-brown">Type</label>
                <select
                  className="form-select"
                  value={form.review_type}
                  onChange={(e) => setField("review_type", e.target.value)}
                >
                  {PUBLIC_REVIEW_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div className="mb-3">
              <label className="form-label font-brandon-bold text-brown">Rating</label>
              <select
                className="form-select"
                value={form.rating}
                onChange={(e) => setField("rating", e.target.value)}
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "star" : "stars"}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="form-label font-brandon-bold text-brown">Comments</label>
              <textarea
                className="form-control"
                rows={4}
                value={form.comments}
                onChange={(e) => setField("comments", e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={saving || !branch}
            >
              {saving ? "Submitting…" : "Submit feedback"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
