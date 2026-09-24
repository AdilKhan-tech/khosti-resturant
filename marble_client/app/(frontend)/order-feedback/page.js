"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getOrderFeedbackContextRoute,
  submitOrderFeedbackRoute,
} from "@/utils/apiRoutes";
import apiKeyMapping from "@/configs/apiKeyMapping";
import axios from "axios";

const REVIEW_TYPES = ["Review", "Complaint", "Inquiry", "Suggestion"];

function getApiKey() {
  if (typeof window === "undefined") return apiKeyMapping.localhost;
  const hostName = window.location.hostname;
  return apiKeyMapping[hostName] || apiKeyMapping.localhost;
}

function OrderFeedbackForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [context, setContext] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    rating: 5,
    comments: "",
    review_type: "Review",
  });

  useEffect(() => {
    if (!token) {
      setError("Missing feedback token.");
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(getOrderFeedbackContextRoute(token), {
          headers: { "X-API-KEY": getApiKey() },
        });
        setContext(res.data?.data ?? res.data);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            "This feedback link is invalid or expired.",
        );
        setContext(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.comments.trim()) {
      setError("Comments are required.");
      return;
    }

    setSaving(true);
    try {
      await axios.post(
        submitOrderFeedbackRoute,
        {
          token,
          rating: Number(form.rating),
          comments: form.comments.trim(),
          review_type: form.review_type || undefined,
        },
        { headers: { "X-API-KEY": getApiKey() } },
      );
      router.push("/order-feedback/thank-you");
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

  if (loading) {
    return (
      <div className="container py-5 text-center text-secondary">
        Loading…
      </div>
    );
  }

  if (!token || (error && !context)) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="alert alert-warning mb-0" role="alert">
              {error || "Invalid feedback link."}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-6">
          <h1 className="fw-bold mb-2">Order feedback</h1>
          <p className="text-secondary mb-4">
            {context?.order_number
              ? `Tell us about order #${context.order_number}.`
              : "Tell us about your recent order."}
          </p>

          {context ? (
            <div className="small text-secondary mb-3">
              {[context.customer_name, context.branch, context.city]
                .filter(Boolean)
                .join(" · ")}
            </div>
          ) : null}

          {error ? (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          ) : null}

          <form
            onSubmit={handleSubmit}
            className="bg-white p-4 rounded-3 shadow-sm"
          >
            <div className="mb-3">
              <label className="form-label fw-semibold">Rating</label>
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

            <div className="mb-3">
              <label className="form-label fw-semibold">Type (optional)</label>
              <select
                className="form-select"
                value={form.review_type}
                onChange={(e) => setField("review_type", e.target.value)}
              >
                {REVIEW_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">Comments</label>
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
              disabled={saving}
            >
              {saving ? "Submitting…" : "Submit feedback"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function OrderFeedbackPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-5 text-center text-secondary">
          Loading…
        </div>
      }
    >
      <OrderFeedbackForm />
    </Suspense>
  );
}
