"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import StatusToggle from "@/components/dashboard/shared/StatusToggle";
import useAxiosConfig from "@/hooks/useAxiosConfig";
import {
  getStorefrontSettingsRoute,
  updateStorefrontSettingsRoute,
} from "@/utils/apiRoutes";

const EMPTY = {
  customer_hotline: "",
  customer_whatsapp: "",
  customer_email: "",
  social_instagram: "",
  social_facebook: "",
  social_tiktok: "",
  otp_login_enabled: false,
  strong_password_enabled: false,
  otp_test_mode_enabled: false,
  otp_test_code: "1234",
};

export default function StorefrontSettingsPage() {
  const { token } = useAxiosConfig();
  const [settings, setSettings] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    let active = true;
    axios
      .get(getStorefrontSettingsRoute)
      .then((response) => {
        if (!active) return;
        setSettings({ ...EMPTY, ...(response.data?.data || {}) });
      })
      .catch((error) => {
        toast.error(
          error?.response?.data?.message ||
            "Failed to load storefront settings.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token]);

  const setField = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await axios.put(updateStorefrontSettingsRoute, settings);
      setSettings({ ...EMPTY, ...(response.data?.data || {}) });
      toast.success("Storefront settings saved!", { autoClose: 1000 });
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to save storefront settings.",
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "form-control form-control-lg textarea-hover-dark text-secondary";

  return (
    <div className="container-fluid py-4 product-add-page">
      <p className="pagetitle mb-3 fnt-color">Storefront</p>

      <form onSubmit={handleSubmit}>
        <div className="card product-form-card mb-4">
          <div className="card-header bg-white border-0 py-3">
            <h5 className="mb-1 fs-18 fw-semibold fnt-color">Authentication</h5>
            <p className="text-secondary mb-0 small">
              Choose how customers log in and register on the storefront.
            </p>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="d-flex align-items-center gap-2 text-secondary">
                <span className="spinner-border spinner-border-sm"></span>
                Loading settings...
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                <div>
                  <StatusToggle
                    id="otp_login_enabled"
                    label="Enable OTP login"
                    checked={settings.otp_login_enabled}
                    onChange={(checked) => {
                      setSettings((prev) => ({
                        ...prev,
                        otp_login_enabled: checked,
                        // Test mode only makes sense with OTP login.
                        ...(checked
                          ? {}
                          : { otp_test_mode_enabled: false }),
                      }));
                    }}
                  />
                  <p className="text-secondary small mb-0 mt-2">
                    {settings.otp_login_enabled
                      ? "Customers use phone number + OTP (Msegat). Configure credentials under Order Notifications."
                      : "Customers use phone number + password."}
                  </p>
                </div>
                <div>
                  <StatusToggle
                    id="otp_test_mode_enabled"
                    label="OTP test mode"
                    checked={settings.otp_test_mode_enabled}
                    disabled={!settings.otp_login_enabled}
                    onChange={(checked) =>
                      setField("otp_test_mode_enabled", checked)
                    }
                  />
                  <p className="text-secondary small mb-0 mt-2">
                    When enabled, Msegat is not called. Use the fixed test code
                    below for login/register OTP (for local testing). Requires
                    OTP login to be on.
                  </p>
                  <label className="form-label mt-3" htmlFor="otp_test_code">
                    Test OTP code
                  </label>
                  <input
                    id="otp_test_code"
                    type="text"
                    inputMode="numeric"
                    className={inputClass}
                    style={{ maxWidth: 220 }}
                    value={settings.otp_test_code}
                    onChange={(e) =>
                      setField(
                        "otp_test_code",
                        e.target.value.replace(/\D/g, "").slice(0, 4),
                      )
                    }
                    placeholder="1234"
                    maxLength={4}
                    disabled={
                      !settings.otp_login_enabled ||
                      !settings.otp_test_mode_enabled
                    }
                    autoComplete="off"
                  />
                  <p className="text-secondary small mb-0 mt-1">
                    Use a 4-digit code to match the storefront OTP inputs.
                  </p>
                </div>
                <div>
                  <StatusToggle
                    id="strong_password_enabled"
                    label="Require strong password"
                    checked={settings.strong_password_enabled}
                    onChange={(checked) =>
                      setField("strong_password_enabled", checked)
                    }
                  />
                  <p className="text-secondary small mb-0 mt-2">
                    Applies only when creating an account with phone + password.
                    Login is not affected.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card product-form-card mb-4">
          <div className="card-header bg-white border-0 py-3">
            <h5 className="mb-1 fs-18 fw-semibold fnt-color">Contact</h5>
            <p className="text-secondary mb-0 small">
              Contact page, footer call / WhatsApp / email icons.
            </p>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="d-flex align-items-center gap-2 text-secondary">
                <span className="spinner-border spinner-border-sm"></span>
                Loading settings...
              </div>
            ) : (
              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <label className="form-label" htmlFor="customer_hotline">
                    Hotline
                  </label>
                  <input
                    id="customer_hotline"
                    type="text"
                    className={inputClass}
                    value={settings.customer_hotline}
                    onChange={(e) =>
                      setField("customer_hotline", e.target.value)
                    }
                    placeholder="920011480"
                  />
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label" htmlFor="customer_whatsapp">
                    WhatsApp
                  </label>
                  <input
                    id="customer_whatsapp"
                    type="text"
                    className={inputClass}
                    value={settings.customer_whatsapp}
                    onChange={(e) =>
                      setField("customer_whatsapp", e.target.value)
                    }
                    placeholder="+9665…"
                  />
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label" htmlFor="customer_email">
                    Email
                  </label>
                  <input
                    id="customer_email"
                    type="email"
                    className={inputClass}
                    value={settings.customer_email}
                    onChange={(e) =>
                      setField("customer_email", e.target.value)
                    }
                    placeholder="info@marblestore.com"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card product-form-card mb-4">
          <div className="card-header bg-white border-0 py-3">
            <h5 className="mb-1 fs-18 fw-semibold fnt-color">Social links</h5>
            <p className="text-secondary mb-0 small">
              Footer “Follow us” icons. Leave blank to hide a network.
            </p>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="d-flex align-items-center gap-2 text-secondary">
                <span className="spinner-border spinner-border-sm"></span>
                Loading settings...
              </div>
            ) : (
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label" htmlFor="social_instagram">
                    Instagram URL
                  </label>
                  <input
                    id="social_instagram"
                    type="url"
                    className={inputClass}
                    value={settings.social_instagram}
                    onChange={(e) =>
                      setField("social_instagram", e.target.value)
                    }
                    placeholder="https://www.instagram.com/…"
                  />
                </div>
                <div className="col-12">
                  <label className="form-label" htmlFor="social_facebook">
                    Facebook URL
                  </label>
                  <input
                    id="social_facebook"
                    type="url"
                    className={inputClass}
                    value={settings.social_facebook}
                    onChange={(e) =>
                      setField("social_facebook", e.target.value)
                    }
                    placeholder="https://www.facebook.com/…"
                  />
                </div>
                <div className="col-12">
                  <label className="form-label" htmlFor="social_tiktok">
                    TikTok URL
                  </label>
                  <input
                    id="social_tiktok"
                    type="url"
                    className={inputClass}
                    value={settings.social_tiktok}
                    onChange={(e) => setField("social_tiktok", e.target.value)}
                    placeholder="https://www.tiktok.com/…"
                  />
                </div>
              </div>
            )}

            <div className="mt-4">
              <button
                type="submit"
                className="form-submit-btn form-submit-btn-size d-inline-flex align-items-center justify-content-center gap-2 border-0 text-white fs-16 fw-medium rounded-3"
                disabled={loading || saving}
              >
                <i className="bi bi-send-fill" aria-hidden="true"></i>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      </form>

      <ToastContainer />
    </div>
  );
}
