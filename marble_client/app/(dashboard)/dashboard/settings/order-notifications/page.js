"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import useAxiosConfig from "@/hooks/useAxiosConfig";
import {
  getOrderNotificationSettingsRoute,
  updateOrderNotificationSettingsRoute,
} from "@/utils/apiRoutes";
import StatusToggle from "@/components/dashboard/shared/StatusToggle";

/** Human labels + when each message fires (order lifecycle). */
const TEMPLATE_GROUPS = [
  {
    title: "Checkout & custom cake",
    items: [
      {
        key: "new-order",
        label: "New order",
        help: "Sent when a normal checkout order is placed.",
      },
      {
        key: "cstm-cake-request",
        label: "Custom cake request",
        help: "Sent when a customer submits a custom cake (before pricing).",
      },
      {
        key: "qfa",
        label: "Quotation sent",
        help: "Sent when admin sends/updates the cake price. Use {payment_url} so the customer can review the quote.",
      },
      {
        key: "pending",
        label: "Pending payment",
        help: "Sent after the customer accepts the quote (or when status is pending payment).",
      },
    ],
  },
  {
    title: "Fulfillment",
    items: [
      {
        key: "processing",
        label: "Processing",
        help: "Optional — when staff move the order to processing.",
      },
      {
        key: "ready-to-pickup",
        label: "Ready for pickup",
        help: "Use {branch_name}, {branch_number}, {branch_map}.",
      },
      {
        key: "ready-to-deliver",
        label: "Ready for delivery",
        help: "Sent when the order is ready for the driver.",
      },
    ],
  },
  {
    title: "Finished / cancelled",
    items: [
      {
        key: "completed",
        label: "Completed",
        help: "Optional confirmation when the order is completed.",
      },
      {
        key: "cancelled",
        label: "Cancelled",
        help: "Optional notice when an order is cancelled.",
      },
      {
        key: "refunded",
        label: "Refunded",
        help: "Optional notice when a refund is issued.",
      },
      {
        key: "failed",
        label: "Payment failed",
        help: "Optional notice when payment fails.",
      },
    ],
  },
];

const EMPTY_TEMPLATE = {
  enabled: false,
  whatsapp: true,
  sms: false,
  message: "",
};

const EMPTY = {
  apploxa_token: "",
  msegat_username: "marbleslab",
  msegat_api_key: "",
  msegat_sender: "Marblestore",
  whatsapp_enabled: true,
  sms_enabled: true,
  storefront_base_url: "",
  staff_notify_numbers: "",
  staff_notify_on_new_order: true,
  staff_notify_on_custom_cake: true,
  templates: {},
};

function normalizeSettings(data = {}) {
  return {
    ...EMPTY,
    ...data,
    apploxa_token: data.apploxa_token || "",
    msegat_username: data.msegat_username || "marbleslab",
    msegat_api_key: data.msegat_api_key || "",
    msegat_sender: data.msegat_sender || "Marblestore",
    storefront_base_url: data.storefront_base_url || "",
    staff_notify_numbers: data.staff_notify_numbers || "",
    templates: data.templates || {},
  };
}

function PlaceholderHint() {
  return (
    <p className="small text-secondary mb-0">
      You can insert: <code>{"{first_name}"}</code>, <code>{"{order_id}"}</code>,{" "}
      <code>{"{total}"}</code>, <code>{"{payment_url}"}</code>,{" "}
      <code>{"{branch_name}"}</code>, <code>{"{branch_number}"}</code>,{" "}
      <code>{"{branch_map}"}</code>
    </p>
  );
}

export default function OrderNotificationsSettingsPage() {
  const { token } = useAxiosConfig();
  const [settings, setSettings] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeKey, setActiveKey] = useState("new-order");

  const activeMeta =
    TEMPLATE_GROUPS.flatMap((group) => group.items).find(
      (item) => item.key === activeKey,
    ) || TEMPLATE_GROUPS[0].items[0];

  const activeTemplate = {
    ...EMPTY_TEMPLATE,
    ...(settings.templates?.[activeKey] || {}),
  };

  useEffect(() => {
    if (!token) return;
    let active = true;
    axios
      .get(getOrderNotificationSettingsRoute)
      .then((response) => {
        if (!active) return;
        setSettings(normalizeSettings(response.data?.data || response.data));
      })
      .catch((error) => {
        toast.error(
          error?.response?.data?.message || "Failed to load settings.",
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

  const setTemplateField = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      templates: {
        ...(prev.templates || {}),
        [activeKey]: {
          ...EMPTY_TEMPLATE,
          ...(prev.templates?.[activeKey] || {}),
          [key]: value,
        },
      },
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await axios.put(
        updateOrderNotificationSettingsRoute,
        settings,
      );
      setSettings(normalizeSettings(response.data?.data || response.data));
      toast.success("Order notification settings saved!", { autoClose: 1200 });
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to save settings.",
      );
    } finally {
      setSaving(false);
    }
  };

  const whatsappReady = Boolean(settings.apploxa_token?.trim());
  const smsReady = Boolean(
    settings.msegat_username?.trim() && settings.msegat_api_key?.trim(),
  );

  const inputClass =
    "form-control form-control-lg textarea-hover-dark text-secondary";

  return (
    <div className="container-fluid py-4 product-add-page">
      <p className="pagetitle mb-1 fnt-color">Order Notifications</p>
      <p className="text-secondary small mb-3">
        Messages sent to customers (and optional staff alerts) when an order is
        created or its status changes. Separate from Customer Service → WhatsApp
        Settings (ticket routing).
      </p>

      <form onSubmit={handleSave}>
        <div className="card product-form-card mb-4">
          <div className="card-header bg-white border-0 py-3">
            <h5 className="mb-1 fs-18 fw-semibold fnt-color">1. Connections</h5>
            <p className="text-secondary mb-0 small">
              Turn channels on/off and enter API credentials. Customer templates
              below only send if the matching channel is on here.
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
                <div className="col-lg-6">
                  <div className="border rounded-3 p-3 h-100">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <strong className="fnt-color">WhatsApp (Apploxa)</strong>
                      <span
                        className={`badge ${
                          settings.whatsapp_enabled && whatsappReady
                            ? "text-bg-success"
                            : "text-bg-secondary"
                        }`}
                      >
                        {settings.whatsapp_enabled && whatsappReady
                          ? "Ready"
                          : "Not ready"}
                      </span>
                    </div>
                    <StatusToggle
                      id="wa-enabled"
                      label="Enable WhatsApp for orders"
                      checked={settings.whatsapp_enabled}
                      onChange={(checked) =>
                        setField("whatsapp_enabled", checked)
                      }
                    />
                    <label className="form-label mt-3" htmlFor="apploxa_token">
                      Apploxa API token
                    </label>
                    <input
                      id="apploxa_token"
                      className={inputClass}
                      value={settings.apploxa_token}
                      onChange={(e) =>
                        setField("apploxa_token", e.target.value)
                      }
                      placeholder="Paste Apploxa bearer token"
                      disabled={!settings.whatsapp_enabled}
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="border rounded-3 p-3 h-100">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <strong className="fnt-color">SMS (Msegat)</strong>
                      <span
                        className={`badge ${
                          settings.sms_enabled && smsReady
                            ? "text-bg-success"
                            : "text-bg-secondary"
                        }`}
                      >
                        {settings.sms_enabled && smsReady
                          ? "Ready"
                          : "Not ready"}
                      </span>
                    </div>
                    <StatusToggle
                      id="sms-enabled"
                      label="Enable SMS for orders"
                      checked={settings.sms_enabled}
                      onChange={(checked) => setField("sms_enabled", checked)}
                    />
                    <div className="row g-2 mt-2">
                      <div className="col-md-4">
                        <label className="form-label" htmlFor="msegat_username">
                          Username
                        </label>
                        <input
                          id="msegat_username"
                          className={inputClass}
                          value={settings.msegat_username}
                          onChange={(e) =>
                            setField("msegat_username", e.target.value)
                          }
                          disabled={!settings.sms_enabled}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label" htmlFor="msegat_api_key">
                          API key
                        </label>
                        <input
                          id="msegat_api_key"
                          className={inputClass}
                          value={settings.msegat_api_key}
                          onChange={(e) =>
                            setField("msegat_api_key", e.target.value)
                          }
                          disabled={!settings.sms_enabled}
                          autoComplete="off"
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label" htmlFor="msegat_sender">
                          Sender name
                        </label>
                        <input
                          id="msegat_sender"
                          className={inputClass}
                          value={settings.msegat_sender}
                          onChange={(e) =>
                            setField("msegat_sender", e.target.value)
                          }
                          disabled={!settings.sms_enabled}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <label className="form-label" htmlFor="storefront_base_url">
                    Website URL (for payment links)
                  </label>
                  <input
                    id="storefront_base_url"
                    className={inputClass}
                    value={settings.storefront_base_url}
                    onChange={(e) =>
                      setField("storefront_base_url", e.target.value)
                    }
                    placeholder="https://marblestore.com"
                  />
                  <p className="small text-secondary mb-0 mt-1">
                    Builds <code>{"{payment_url}"}</code> as{" "}
                    <code>…/my-account/orders/ORDER_NUMBER</code>. Leave blank
                    only for local testing.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card product-form-card mb-4">
          <div className="card-header bg-white border-0 py-3">
            <h5 className="mb-1 fs-18 fw-semibold fnt-color">
              2. Staff alerts (WhatsApp)
            </h5>
            <p className="text-secondary mb-0 small">
              Short alerts to your team — not customer templates. Uses the
              Apploxa token from Connections above.
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
                <label className="form-label" htmlFor="staff_notify_numbers">
                  Staff phone numbers
                </label>
                <input
                  id="staff_notify_numbers"
                  className={inputClass}
                  value={settings.staff_notify_numbers}
                  onChange={(e) =>
                    setField("staff_notify_numbers", e.target.value)
                  }
                  placeholder="9665xxxxxxx, 9665yyyyyyy"
                />
                <p className="small text-secondary mb-3 mt-1">
                  Comma-separated Saudi numbers. Example message: “New Order
                  (Order 12345) Received at Marbleslab Olaya Branch.”
                </p>
                <div className="d-flex flex-wrap gap-4">
                  <StatusToggle
                    id="staff-new-order"
                    label="Alert staff when a new order is placed"
                    checked={settings.staff_notify_on_new_order}
                    onChange={(checked) =>
                      setField("staff_notify_on_new_order", checked)
                    }
                  />
                  <StatusToggle
                    id="staff-custom-cake"
                    label="Alert staff when a custom cake is requested"
                    checked={settings.staff_notify_on_custom_cake}
                    onChange={(checked) =>
                      setField("staff_notify_on_custom_cake", checked)
                    }
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="card product-form-card mb-4">
          <div className="card-header bg-white border-0 py-3">
            <h5 className="mb-1 fs-18 fw-semibold fnt-color">
              3. Customer messages by status
            </h5>
            <p className="text-secondary mb-0 small">
              Pick a status on the left, then write the customer message. Turn
              WhatsApp and/or SMS on for that status only.
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
                <PlaceholderHint />

                <div className="row g-3 mt-2">
                  <div className="col-lg-4 pe-lg-3 border-end">
                    {TEMPLATE_GROUPS.map((group) => (
                      <div key={group.title} className="mb-3">
                        <div className="fw-bold mb-2 px-2">{group.title}</div>
                        <div className="d-flex flex-column gap-1">
                          {group.items.map((item) => {
                            const row = settings.templates?.[item.key];
                            const on = Boolean(row?.enabled);
                            const isActive = activeKey === item.key;
                            return (
                              <button
                                key={item.key}
                                type="button"
                                className={`w-100 text-start px-2 py-2 border-start-0 border-end-0 border-bottom-0 border-top rounded-2 fw-medium d-flex justify-content-between align-items-center ${
                                  isActive
                                    ? "btn-orange text-white"
                                    : "bg-transparent fnt-color"
                                }`}
                                style={{ width: "100%", minWidth: 0 }}
                                onClick={() => setActiveKey(item.key)}
                              >
                                <span className="text-start pe-2">
                                  {item.label}
                                </span>
                                <span
                                  className={`badge ${
                                    isActive
                                      ? on
                                        ? "bg-white text-dark"
                                        : "bg-white text-secondary"
                                      : on
                                        ? "text-bg-success"
                                        : "text-bg-light text-secondary"
                                  }`}
                                >
                                  {on ? "On" : "Off"}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="col-lg-8">
                    <div className="border rounded-3 p-3">
                      <h6 className="fnt-color mb-1">{activeMeta.label}</h6>
                      <p className="small text-secondary mb-3">
                        {activeMeta.help}
                      </p>

                      <StatusToggle
                        id={`tpl-enabled-${activeKey}`}
                        label="Send this message when order reaches this status"
                        checked={Boolean(activeTemplate.enabled)}
                        onChange={(checked) =>
                          setTemplateField("enabled", checked)
                        }
                      />

                      <div
                        className={`d-flex flex-wrap gap-4 my-3 ${
                          activeTemplate.enabled ? "" : "opacity-50"
                        }`}
                      >
                        <StatusToggle
                          id={`tpl-wa-${activeKey}`}
                          label="WhatsApp"
                          checked={activeTemplate.whatsapp !== false}
                          onChange={(checked) =>
                            setTemplateField("whatsapp", checked)
                          }
                          disabled={
                            !activeTemplate.enabled ||
                            !settings.whatsapp_enabled
                          }
                        />
                        <StatusToggle
                          id={`tpl-sms-${activeKey}`}
                          label="SMS"
                          checked={Boolean(activeTemplate.sms)}
                          onChange={(checked) =>
                            setTemplateField("sms", checked)
                          }
                          disabled={
                            !activeTemplate.enabled || !settings.sms_enabled
                          }
                        />
                      </div>

                      {!settings.whatsapp_enabled &&
                      activeTemplate.whatsapp !== false ? (
                        <p className="small text-warning mb-2">
                          WhatsApp is off in Connections — this template will not
                          send via WhatsApp until you enable it there.
                        </p>
                      ) : null}
                      {!settings.sms_enabled && activeTemplate.sms ? (
                        <p className="small text-warning mb-2">
                          SMS is off in Connections — this template will not send
                          SMS until you enable it there.
                        </p>
                      ) : null}

                      <label
                        className="form-label"
                        htmlFor={`tpl-message-${activeKey}`}
                      >
                        Message text
                      </label>
                      <textarea
                        id={`tpl-message-${activeKey}`}
                        className={inputClass}
                        rows={8}
                        value={activeTemplate.message || ""}
                        onChange={(e) =>
                          setTemplateField("message", e.target.value)
                        }
                        disabled={!activeTemplate.enabled}
                        placeholder="Write the customer message…"
                      />
                    </div>
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
              <span className="small text-secondary">
                Changes apply to the next order status update.
              </span>
            </div>
          </div>
        </div>
      </form>

      <ToastContainer />
    </div>
  );
}
