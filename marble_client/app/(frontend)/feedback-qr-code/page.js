"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import PublicFeedbackForm from "@/components/frontend/feedback/PublicFeedbackForm";
import {
  getFeedbackQrPublicRoute,
} from "@/utils/apiRoutes";
import apiKeyMapping from "@/configs/apiKeyMapping";
import axios from "axios";

function getApiKey() {
  if (typeof window === "undefined") return apiKeyMapping.localhost;
  const hostName = window.location.hostname;
  return apiKeyMapping[hostName] || apiKeyMapping.localhost;
}

function FeedbackQrForm() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("branch") || "";
  const [qr, setQr] = useState(null);
  const [loading, setLoading] = useState(Boolean(slug));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) {
      setError("Missing branch parameter.");
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(getFeedbackQrPublicRoute(slug), {
          headers: { "X-API-KEY": getApiKey() },
        });
        setQr(res.data?.data ?? res.data);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            "This feedback QR is invalid or inactive.",
        );
        setQr(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="container py-5 text-center text-secondary">
        Loading…
      </div>
    );
  }

  if (error || !qr) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="alert alert-warning mb-0" role="alert">
              {error || "Feedback QR not found."}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PublicFeedbackForm
      branch={qr.slug || slug}
      source="Website"
      thankYouPath="/feedback-qr-code/thank-you"
      title="Share your feedback"
      subtitle={
        qr.branch
          ? `Feedback for ${qr.branch}${qr.qr_name ? ` (${qr.qr_name})` : ""}`
          : null
      }
    />
  );
}

export default function FeedbackQrCodePage() {
  return (
    <Suspense
      fallback={
        <div className="container py-5 text-center text-secondary">
          Loading…
        </div>
      }
    >
      <FeedbackQrForm />
    </Suspense>
  );
}
