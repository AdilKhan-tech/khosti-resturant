"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import useAxiosConfig from "@/hooks/useAxiosConfig";
import {
  getCsWhatsappSettingsRoute,
  updateCsWhatsappSettingsRoute,
} from "@/utils/apiRoutes";
import StatusToggle from "@/components/dashboard/shared/StatusToggle";

const EMPTY = {
  call_center_token: "",
  complaint_numbers: "",
  inquiry_numbers: "",
  suggestions_numbers: "",
  van_numbers: "",
  order_numbers: "",
  marketing_numbers: "",
  post_order_enabled: false,
  post_order_token: "",
  post_order_message: "",
  post_order_delay_hours: 24,
};

const NUMBER_PAIRS = [
  [
    {
      key: "complaint_numbers",
      label: "Complaint",
      help: "New Complaint tickets. Also used when any ticket is Resolved.",
    },
    {
      key: "inquiry_numbers",
      label: "Inquiry",
      help: "New Inquiry tickets.",
    },
  ],
  [
    {
      key: "suggestions_numbers",
      label: "Suggestions",
      help: "New Suggestions tickets.",
    },
    {
      key: "van_numbers",
      label: "Van",
      help: "New Van tickets (agent or website form).",
    },
  ],
  [
    {
      key: "order_numbers",
      label: "Order (CS ticket)",
      help: "CS tickets typed “Order” — not checkout alerts.",
    },
    {
      key: "marketing_numbers",
      label: "Marketing",
      help: "New Marketing tickets.",
    },
  ],
];

export default function CsWhatsappSettingsPage() {
  const { token } = useAxiosConfig();
  const [settings, setSettings] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [runningJob, setRunningJob] = useState(false);

  useEffect(() => {
    if (!token) return;
    let active = true;
    axios
      .get(getCsWhatsappSettingsRoute)
      .then((response) => {
        if (!active) return;
        setSettings({ ...EMPTY, ...(response.data?.data || {}) });
      })
      .catch((error) => {
        toast.error(
          error?.response?.data?.message ||
            "Failed to load WhatsApp settings.",
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
      const response = await axios.put(updateCsWhatsappSettingsRoute, {
        ...settings,
        post_order_delay_hours: Number(settings.post_order_delay_hours) || 24,
        post_order_enabled: Boolean(settings.post_order_enabled),
      });
      setSettings({ ...EMPTY, ...(response.data?.data || {}) });
      toast.success("WhatsApp settings saved!", { autoClose: 1000 });
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to save WhatsApp settings.",
      );
    } finally {
      setSaving(false);
    }
  };

  const runPostOrderJob = async () => {
    setRunningJob(true);
    try {
      const res = await axios.post(
        `${updateCsWhatsappSettingsRoute}/run-post-order-job`,
      );
      const data = res.data?.data || {};
      toast.success(
        `Job done: sent ${data.sent || 0}, scanned ${data.scanned || 0}, errors ${data.errors || 0}`,
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to run post-order job.",
      );
    } finally {
      setRunningJob(false);
    }
  };

  return (
    <div className="container-fluid py-4 product-add-page">
      <p className="pagetitle mb-3 fnt-color">WhatsApp Settings</p>

      <form onSubmit={handleSubmit}>
        <div className="card product-form-card mb-4">
          <div className="card-header bg-white border-0 py-3">
            <h5 className="mb-1 fs-18 fw-semibold fnt-color">
              1. Ticket alerts
            </h5>
            <p className="text-secondary mb-0 small">
              Apploxa token and staff phones for CS tickets.
            </p>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="d-flex align-items-center gap-2 text-secondary">
                <span className="spinner-border spinner-border-sm"></span>
                Loading settings...
              </div>
            ) : (
              <>
                <div className="row g-3 mb-1">
                  <div className="col-12">
                    <label className="form-label" htmlFor="call_center_token">
                      Apploxa token (tickets)
                    </label>
                    <input
                      id="call_center_token"
                      type="text"
                      className="form-control form-control-lg textarea-hover-dark text-secondary"
                      value={settings.call_center_token}
                      onChange={(e) =>
                        setField("call_center_token", e.target.value)
                      }
                      autoComplete="off"
                    />
                    <p className="small text-secondary mb-0 mt-1">
                      Sends ticket create/resolve alerts and agent WhatsApp.
                    </p>
                  </div>
                </div>

                <hr className="my-4" />
                <h6 className="fw-semibold fnt-color mb-1">
                  Staff phones by ticket type
                </h6>
                <p className="small text-secondary mb-3">
                  Comma-separated Saudi numbers. Empty = no alert for that type.
                </p>

                {NUMBER_PAIRS.map((pair) => (
                  <div className="row g-3 mb-3" key={pair[0].key}>
                    {pair.map((field) => (
                      <div className="col-12 col-md-6" key={field.key}>
                        <label className="form-label" htmlFor={field.key}>
                          {field.label}
                        </label>
                        <textarea
                          id={field.key}
                          className="form-control form-control-lg textarea-hover-dark text-secondary"
                          rows={2}
                          value={settings[field.key]}
                          onChange={(e) => setField(field.key, e.target.value)}
                          placeholder="9665xxxxxxx, 9665yyyyyyy"
                        />
                        <p className="small text-secondary mb-0 mt-1">
                          {field.help}
                        </p>
                      </div>
                    ))}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        <div className="card product-form-card mb-4">
          <div className="card-header bg-white border-0 py-3">
            <h5 className="mb-1 fs-18 fw-semibold fnt-color">
              2. Post-order feedback
            </h5>
            <p className="text-secondary mb-0 small">
              WhatsApp survey link after an order is completed.
            </p>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="d-flex align-items-center gap-2 text-secondary">
                <span className="spinner-border spinner-border-sm"></span>
                Loading settings...
              </div>
            ) : (
              <>
                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-6">
                    <div className="border rounded-3 p-3 h-100">
                      <StatusToggle
                        id="cs-post-order-enabled"
                        label="Enable feedback WhatsApp"
                        checked={Boolean(settings.post_order_enabled)}
                        onChange={(checked) =>
                          setField("post_order_enabled", checked)
                        }
                      />
                      <p className="small text-secondary mb-0 mt-2">
                        Off = job sends nothing (including manual run).
                      </p>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <label
                      className="form-label"
                      htmlFor="post_order_delay_hours"
                    >
                      Delay after completed (hours)
                    </label>
                    <input
                      id="post_order_delay_hours"
                      type="number"
                      min={1}
                      max={168}
                      className="form-control form-control-lg textarea-hover-dark text-secondary"
                      value={settings.post_order_delay_hours}
                      onChange={(e) =>
                        setField("post_order_delay_hours", e.target.value)
                      }
                    />
                    <p className="small text-secondary mb-0 mt-1">
                      Wait this long after completed before sending.
                    </p>
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="post_order_token">
                      Apploxa token (feedback only)
                    </label>
                    <input
                      id="post_order_token"
                      type="text"
                      className="form-control form-control-lg textarea-hover-dark text-secondary"
                      value={settings.post_order_token}
                      onChange={(e) =>
                        setField("post_order_token", e.target.value)
                      }
                      autoComplete="off"
                    />
                    <p className="small text-secondary mb-0 mt-1">
                      Required when enabled. Not shared with ticket token.
                    </p>
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="post_order_message">
                      Message (before feedback link)
                    </label>
                    <textarea
                      id="post_order_message"
                      className="form-control form-control-lg textarea-hover-dark text-secondary"
                      rows={3}
                      value={settings.post_order_message}
                      onChange={(e) =>
                        setField("post_order_message", e.target.value)
                      }
                      placeholder="Thank you for your order…"
                    />
                    <p className="small text-secondary mb-0 mt-1">
                      Feedback URL is appended automatically.
                    </p>
                  </div>
                </div>
              </>
            )}

            <div className="mt-4 d-flex flex-wrap gap-2 align-items-center">
              <button
                type="submit"
                className="form-submit-btn form-submit-btn-size d-inline-flex align-items-center justify-content-center gap-2 border-0 text-white fs-16 fw-medium rounded-3"
                disabled={loading || saving}
              >
                <i className="bi bi-send-fill" aria-hidden="true"></i>
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                className="form-cancel-btn bg-white border rounded-3 text-muted fs-14 px-3 py-2"
                disabled={loading || runningJob}
                onClick={runPostOrderJob}
                title="Process eligible completed orders once"
              >
                {runningJob ? "Running…" : "Run feedback job now"}
              </button>
            </div>
          </div>
        </div>
      </form>

      <ToastContainer />
    </div>
  );
}
