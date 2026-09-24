"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import useAxiosConfig from "@/hooks/useAxiosConfig";
import {
  getShippingSettingsRoute,
  updateShippingSettingsRoute,
} from "@/utils/apiRoutes";
import { parseShippingRules, SHIPPING_RULE_KEYS } from "@/utils/shipping";

const EMPTY_SETTINGS = Object.fromEntries(
  SHIPPING_RULE_KEYS.map((key) => [key, ""]),
);

const FIELDS = [
  {
    key: "free_shipping_threshold",
    label: "Free delivery from (SR)",
    help: "Cart subtotal at or above this amount gets free delivery.",
    step: "1",
  },
  {
    key: "base_shipping_cost",
    label: "Base delivery fee (SR)",
    help: "Fee charged for deliveries within the base distance.",
    step: "1",
  },
  {
    key: "base_shipping_distance_km",
    label: "Base distance (km)",
    help: "Distance covered by the base delivery fee.",
    step: "0.1",
  },
  {
    key: "extra_shipping_cost_per_km",
    label: "Extra fee per km (SR)",
    help: "Added for each kilometer beyond the base distance.",
    step: "0.1",
  },
  {
    key: "max_delivery_distance_km",
    label: "Maximum delivery distance (km)",
    help: "Addresses farther than this cannot be delivered.",
    step: "0.1",
  },
  {
    key: "no_address_shipping_cost",
    label: "No-address / send-for-someone fee (SR)",
    help: "Flat fee when delivery is chosen without a map address.",
    step: "1",
  },
];

export default function ShippingSettingsPage() {
  const { token } = useAxiosConfig();
  const [settings, setSettings] = useState(EMPTY_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    let active = true;
    axios
      .get(getShippingSettingsRoute)
      .then((response) => {
        if (!active) return;
        const rules = parseShippingRules(response.data);
        if (!rules) throw new Error("Incomplete shipping settings");
        setSettings(rules);
      })
      .catch((error) => {
        toast.error(
          error?.response?.data?.message ||
            "Failed to load shipping settings.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token]);

  const handleChange = (key, value) => {
    setSettings((current) => ({
      ...current,
      [key]: value === "" ? "" : Number(value),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = parseShippingRules(settings);
    if (!payload) {
      toast.error("Please enter valid non-negative values for all fields.");
      return;
    }
    setSaving(true);
    try {
      const response = await axios.put(updateShippingSettingsRoute, payload);
      const rules = parseShippingRules(response.data);
      if (rules) setSettings(rules);
      toast.success("Shipping settings saved!", { autoClose: 1000 });
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to save shipping settings.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-fluid py-4 product-add-page">
      <p className="pagetitle mb-3 fnt-color">Shipping Charges</p>
      <form onSubmit={handleSubmit}>
        <div className="card product-form-card mb-4">
          <div className="card-header bg-white border-0 py-3">
            <h5 className="mb-1 fs-18 fw-semibold fnt-color">
              Delivery fee rules
            </h5>
            <p className="text-secondary mb-0 small">
              These values are used by the pickup and delivery popup and are
              recalculated on the server when an order is placed.
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
                {FIELDS.map((field) => (
                  <div className="col-12 col-md-6" key={field.key}>
                    <label
                      className="form-label"
                      htmlFor={field.key}
                    >
                      {field.label}
                    </label>
                    <input
                      id={field.key}
                      type="number"
                      min="0"
                      step={field.step}
                      className="form-control form-control-lg textarea-hover-dark text-secondary"
                      value={settings[field.key]}
                      onChange={(event) =>
                        handleChange(field.key, event.target.value)
                      }
                      required
                    />
                    <p className="small text-secondary mb-0 mt-1">
                      {field.help}
                    </p>
                  </div>
                ))}
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
