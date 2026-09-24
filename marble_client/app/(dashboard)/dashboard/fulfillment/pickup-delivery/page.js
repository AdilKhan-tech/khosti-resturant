"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import useAxiosConfig from "@/hooks/useAxiosConfig";
import {
  getPickupDeliverySettingsRoute,
  updatePickupDeliverySettingsRoute,
} from "@/utils/apiRoutes";
import StatusToggle from "@/components/dashboard/shared/StatusToggle";

export default function PickupDeliverySettingsPage() {
  const { token } = useAxiosConfig();
  const [settings, setSettings] = useState({
    delivery_enabled: true,
    pickup_enabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    let active = true;
    axios
      .get(getPickupDeliverySettingsRoute)
      .then((response) => {
        if (active) {
          setSettings({
            delivery_enabled: response.data.delivery_enabled !== false,
            pickup_enabled: response.data.pickup_enabled !== false,
          });
        }
      })
      .catch((error) => {
        toast.error(
          error?.response?.data?.message ||
            "Failed to load pickup and delivery settings.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await axios.put(
        updatePickupDeliverySettingsRoute,
        settings,
      );
      setSettings({
        delivery_enabled: response.data.delivery_enabled,
        pickup_enabled: response.data.pickup_enabled,
      });
      toast.success("Pickup and delivery settings saved!", {
        autoClose: 1000,
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to save pickup and delivery settings.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-fluid py-4 product-add-page">
      <p className="pagetitle mb-3 fnt-color">Pickup &amp; Delivery</p>
      <form onSubmit={handleSubmit}>
        <div className="card product-form-card mb-4">
          <div className="card-header bg-white border-0 py-3">
            <h5 className="mb-1 fs-18 fw-semibold fnt-color">
              Storefront receiving options
            </h5>
            <p className="text-secondary mb-0 small">
              Choose which options customers can use in the pickup and delivery
              popup.
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
                <div className="col-12 col-md-6">
                  <div className="border rounded-3 p-3 h-100">
                    <StatusToggle
                      id="delivery-enabled"
                      label="Enable Delivery"
                      checked={settings.delivery_enabled}
                      onChange={(checked) =>
                        setSettings((current) => ({
                          ...current,
                          delivery_enabled: checked,
                        }))
                      }
                    />
                    <p className="small text-secondary mb-0 mt-2">
                      Customers can select an address on the map for delivery.
                    </p>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="border rounded-3 p-3 h-100">
                    <StatusToggle
                      id="pickup-enabled"
                      label="Enable Pickup"
                      checked={settings.pickup_enabled}
                      onChange={(checked) =>
                        setSettings((current) => ({
                          ...current,
                          pickup_enabled: checked,
                        }))
                      }
                    />
                    <p className="small text-secondary mb-0 mt-2">
                      Customers can select a city and collect from a branch.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!loading &&
              !settings.delivery_enabled &&
              !settings.pickup_enabled && (
                <div className="alert alert-warning mt-3 mb-0">
                  Both options are disabled. Customers will not be able to save
                  receiving details.
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
