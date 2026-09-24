"use client";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  createBranchAvailabilityRoute,
  getBranchesRoute,
  getCitiesListRoute,
  getTimeSlotsListRoute,
  updateBranchAvailabilityByIdRoute,
} from "@/utils/apiRoutes";
import StatusToggle from "@/components/dashboard/shared/StatusToggle";

const EMPTY_FORM = {
  city_id: "",
  branch_ids: [],
  product_type: "ready_products",
  slot_date: "",
  pickup_enabled: true,
  delivery_enabled: true,
  pickup_slot_ids: [],
  delivery_slot_ids: [],
  is_active: true,
};

export default function AddBranchAvailability({
  closePopup,
  availabilityData,
  onSaved,
}) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [cities, setCities] = useState([]);
  const [branches, setBranches] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormData(
      availabilityData
        ? {
            city_id: String(availabilityData.city_id),
            branch_ids: availabilityData.branch_ids || [],
            product_type:
              availabilityData.product_type || "ready_products",
            slot_date: availabilityData.slot_date || "",
            pickup_enabled: availabilityData.pickup_enabled !== false,
            delivery_enabled: availabilityData.delivery_enabled !== false,
            pickup_slot_ids: availabilityData.pickup_slot_ids || [],
            delivery_slot_ids: availabilityData.delivery_slot_ids || [],
            is_active: availabilityData.is_active !== false,
          }
        : EMPTY_FORM,
    );
  }, [availabilityData]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoadingOptions(true);
      try {
        const [cityResponse, branchResponse] = await Promise.all([
          axios.get(getCitiesListRoute, { params: { page: 1, limit: 500 } }),
          axios.get(getBranchesRoute, { params: { page: 1, limit: 1000 } }),
        ]);
        if (!active) return;
        setCities(cityResponse.data.data || []);
        setBranches(branchResponse.data.data || []);
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Failed to load cities and branches.",
        );
      } finally {
        if (active) setLoadingOptions(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const loadSlots = async () => {
      try {
        const response = await axios.get(getTimeSlotsListRoute, {
          params: {
            page: 1,
            limit: 500,
            product_type: formData.product_type,
            sortField: "start_time",
            sortOrder: "ASC",
          },
        });
        if (active) setSlots(response.data.data || []);
      } catch (error) {
        if (active) {
          toast.error(
            error?.response?.data?.message || "Failed to load time slots.",
          );
        }
      }
    };
    loadSlots();
    return () => {
      active = false;
    };
  }, [formData.product_type]);

  const cityBranches = useMemo(
    () =>
      branches.filter(
        (branch) => String(branch.city_id) === String(formData.city_id),
      ),
    [branches, formData.city_id],
  );

  const updateBoolean = (name, checked) => {
    setFormData((current) => ({ ...current, [name]: checked }));
  };

  const toggleId = (field, id) => {
    setFormData((current) => ({
      ...current,
      [field]: current[field].includes(id)
        ? current[field].filter((value) => value !== id)
        : [...current[field], id],
    }));
  };

  const toggleAll = (field, options) => {
    const ids = options.map((option) => option.id);
    setFormData((current) => ({
      ...current,
      [field]: ids.every((id) => current[field].includes(id)) ? [] : ids,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.city_id) {
      toast.error("City is required.");
      return;
    }
    if (!formData.branch_ids.length) {
      toast.error("Select at least one branch.");
      return;
    }

    const payload = {
      ...formData,
      city_id: Number(formData.city_id),
      slot_date: formData.slot_date || null,
    };
    setSaving(true);
    try {
      const response = availabilityData
        ? await axios.put(
            updateBranchAvailabilityByIdRoute(availabilityData.id),
            payload,
          )
        : await axios.post(createBranchAvailabilityRoute, payload);
      toast.success(
        availabilityData
          ? "Branch availability updated successfully!"
          : "Branch availability created successfully!",
        { autoClose: 1000 },
      );
      onSaved(response.data);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to save branch availability.",
      );
    } finally {
      setSaving(false);
    }
  };

  const renderSlotPicker = (field, title, enabled) => (
    <div className="col-12 col-lg-6">
      <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
        <div>
          <label className="form-label mb-0 d-block">{title}</label>
          <small className="d-block text-secondary">
            {formData[field].length} selected
          </small>
        </div>
        <button
          type="button"
          className="form-cancel-btn d-inline-flex align-items-center gap-2 bg-white border rounded-3 text-muted fs-14 px-3 py-1"
          onClick={() => toggleAll(field, slots)}
          disabled={!enabled || !slots.length}
        >
          Select all
        </button>
      </div>
      <div className={`border rounded-2 ${enabled ? "" : "opacity-75"}`}>
        <div className="overflow-y-auto" style={{ maxHeight: "320px" }}>
          {!enabled && (
            <div className="px-3 py-2 small text-secondary">
              Enable {title.toLowerCase()} to select slots.
            </div>
          )}
          {!slots.length && (
            <div className="p-3 text-secondary small">
              No slots exist for this product type.
            </div>
          )}
          <div className="list-group list-group-flush">
            {slots.map((slot) => (
              <label
                className="list-group-item list-group-item-action d-flex gap-2 py-2"
                htmlFor={`${field}-${slot.id}`}
                key={`${field}-${slot.id}`}
              >
                <input
                  className="form-check-input flex-shrink-0 mt-1"
                  type="checkbox"
                  id={`${field}-${slot.id}`}
                  checked={formData[field].includes(slot.id)}
                  disabled={!enabled}
                  onChange={() => toggleId(field, slot.id)}
                />
                <span className="fs-14 fnt-color">
                  <span className="d-block fw-medium">{slot.name_en}</span>
                  <span className="text-secondary small">
                    {slot.start_time} – {slot.end_time}
                    {!slot.is_active ? " · Inactive" : ""}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <form className="mt-0" onSubmit={handleSubmit}>
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6">
          <label
            className="form-label"
            htmlFor="availability-city"
          >
            City
          </label>
          <select
            id="availability-city"
            className="form-select form-select-lg text-secondary"
            value={formData.city_id}
            disabled={loadingOptions}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                city_id: event.target.value,
                branch_ids: [],
              }))
            }
          >
            <option value="">Select city</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name_en}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-6">
          <label
            className="form-label"
            htmlFor="availability-product-type"
          >
            Product type
          </label>
          <select
            id="availability-product-type"
            className="form-select form-select-lg text-secondary"
            value={formData.product_type}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                product_type: event.target.value,
                pickup_slot_ids: [],
                delivery_slot_ids: [],
              }))
            }
          >
            <option value="ready_products">Ready products</option>
            <option value="custom_products">Custom products</option>
          </select>
        </div>
        <div className="col-12 col-md-6">
          <label
            className="form-label"
            htmlFor="availability-date"
          >
            Date override
          </label>
          <input
            id="availability-date"
            type="date"
            className="form-control form-control-lg textarea-hover-dark text-secondary"
            value={formData.slot_date}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                slot_date: event.target.value,
              }))
            }
          />
          <p className="small text-secondary mb-0 mt-1">
            Leave blank to use this as the default rule.
          </p>
        </div>
        <div className="col-12 col-md-6">
          <span className="form-label mb-2">
            Availability status
          </span>
          <div className="d-flex flex-column gap-2">
            {[
              ["pickup_enabled", "Pickup"],
              ["delivery_enabled", "Delivery"],
              ["is_active", "Rule active"],
            ].map(([name, label]) => (
              <StatusToggle
                key={name}
                id={`availability-${name}`}
                label={label}
                className="justify-content-between w-100"
                checked={formData[name]}
                onChange={(checked) => updateBoolean(name, checked)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
        <div>
          <label className="form-label mb-0 d-block">Branches</label>
          <small className="d-block text-secondary">
            {formData.branch_ids.length} selected
          </small>
        </div>
        <button
          type="button"
          className="form-cancel-btn d-inline-flex align-items-center gap-2 bg-white border rounded-3 text-muted fs-14 px-3 py-1"
          disabled={!cityBranches.length}
          onClick={() => toggleAll("branch_ids", cityBranches)}
        >
          Select all
        </button>
      </div>
      <div className="mb-4">
        {!formData.city_id && (
          <p className="small text-secondary mb-0">
            Select a city to see its branches.
          </p>
        )}
        {formData.city_id && !cityBranches.length && (
          <p className="small text-secondary mb-0">
            No branches found for this city.
          </p>
        )}
        <div className="row row-cols-1 row-cols-sm-2 g-2">
          {cityBranches.map((branch) => (
            <div className="col" key={branch.id}>
              <div className="form-check border rounded-2 p-2 ps-5 h-100">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`availability-branch-${branch.id}`}
                  checked={formData.branch_ids.includes(branch.id)}
                  onChange={() => toggleId("branch_ids", branch.id)}
                />
                <label
                  className="form-check-label w-100 fs-14 fnt-color"
                  htmlFor={`availability-branch-${branch.id}`}
                >
                  {branch.name_en}
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="row g-3 mb-4">
        {renderSlotPicker(
          "pickup_slot_ids",
          "Pickup time slots",
          formData.pickup_enabled,
        )}
        {renderSlotPicker(
          "delivery_slot_ids",
          "Delivery time slots",
          formData.delivery_enabled,
        )}
      </div>

      <hr className="mt-4 mb-3" />
      <div className="d-flex align-items-center justify-content-between">
        <button
          type="submit"
          className="form-submit-btn form-submit-btn-size d-inline-flex align-items-center justify-content-center gap-2 border-0 text-white fs-16 fw-medium rounded-3"
          disabled={saving}
        >
          <i className="bi bi-send-fill" aria-hidden="true"></i>
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          className="form-cancel-btn form-cancel-btn-size d-inline-flex align-items-center gap-2 bg-white border rounded-3 text-muted fs-14 px-3"
          onClick={closePopup}
        >
          <i className="bi bi-x-circle" aria-hidden="true"></i> Cancel
        </button>
      </div>
    </form>
  );
}
