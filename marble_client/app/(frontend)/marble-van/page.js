"use client";

import PublicFeedbackForm from "@/components/frontend/feedback/PublicFeedbackForm";

/**
 * Marble Van public feedback — same form as QR, fixed review_type VAN.
 */
export default function MarbleVanPage() {
  return (
    <PublicFeedbackForm
      branch="marble-van"
      fixedReviewType="VAN"
      source="Website"
      thankYouPath="/feedback-qr-code/thank-you"
      title="Marble Van feedback"
      subtitle="Tell us about your Marble Van experience."
    />
  );
}
