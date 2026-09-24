"use client";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import {
  createTimeSlotRoute,
  updateTimeSlotByIdRoute,
} from "@/utils/apiRoutes";
import StatusToggle from "@/components/dashboard/shared/StatusToggle";

const PRODUCT_TYPE_LABELS = {
  ready_products: "Ready products",
  custom_products: "Custom products",
};

const AddTimeSlot = ({
  closePopup,
  slotData = null,
  onAddSlot,
  onUpdateSlot,
}) => {
  const [errors, setErrors] = useState([]);
  const [formData, setFormData] = useState({
    name_en: "",
    name_ar: "",
    start_time: "12:00",
    end_time: "14:00",
    product_type: "ready_products",
    is_active: true,
  });

  useEffect(() => {
    if (slotData) {
      setFormData({
        name_en: slotData.name_en || "",
        name_ar: slotData.name_ar || "",
        start_time: (slotData.start_time || "12:00").slice(0, 5),
        end_time: (slotData.end_time || "14:00").slice(0, 5),
        product_type: slotData.product_type || "ready_products",
        is_active: slotData.is_active !== false,
      });
    }
  }, [slotData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    const next = [];
    if (!formData.name_en) next.push("Name English is required.");
    if (!formData.name_ar) next.push("Name Arabic is required.");
    if (!formData.start_time) next.push("Start time is required.");
    if (!formData.end_time) next.push("End time is required.");
    if (!formData.product_type) next.push("Product type is required.");
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);
    if (validationErrors.length > 0) return;

    const payload = {
      name_en: formData.name_en.trim(),
      name_ar: formData.name_ar.trim(),
      start_time: formData.start_time,
      end_time: formData.end_time,
      product_type: formData.product_type,
      is_active: Boolean(formData.is_active),
    };

    try {
      if (slotData) {
        const res = await axios.put(updateTimeSlotByIdRoute(slotData.id), payload);
        toast.success("Time slot updated successfully!", {
          autoClose: 1000,
          onClose: closePopup,
        });
        onUpdateSlot(res.data);
      } else {
        const res = await axios.post(createTimeSlotRoute, payload);
        toast.success("Time slot added successfully!", {
          autoClose: 1000,
          onClose: closePopup,
        });
        onAddSlot(res.data);
      }
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.[0] ||
        "Something went wrong!";
      toast.error(backendMessage);
    }
  };

  useEffect(() => {
    if (errors.length > 0) {
      errors.forEach((err) => toast.error(err));
      setErrors([]);
    }
  }, [errors]);

  return (
    <form className="mt-0 popup-form-grid" onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Name English</label>
        <input
          name="name_en"
          type="text"
          className="form-control form-control-lg textarea-hover-dark text-secondary"
          value={formData.name_en}
          onChange={handleChange}
        />
      </div>

      <div className="form-group mt-3">
        <label className="form-label">Name Arabic</label>
        <input
          name="name_ar"
          type="text"
          className="form-control form-control-lg textarea-hover-dark text-secondary"
          value={formData.name_ar}
          onChange={handleChange}
        />
      </div>

      <div className="row mt-3">
        <div className="form-group col-md-6">
          <label className="form-label">Start time</label>
          <input
            name="start_time"
            type="time"
            className="form-control form-control-lg textarea-hover-dark text-secondary"
            value={formData.start_time}
            onChange={handleChange}
          />
        </div>
        <div className="form-group col-md-6">
          <label className="form-label">End time</label>
          <input
            name="end_time"
            type="time"
            className="form-control form-control-lg textarea-hover-dark text-secondary"
            value={formData.end_time}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-group mt-3">
        <label className="form-label">Product type</label>
        <select
          name="product_type"
          className="form-select form-select-lg text-secondary"
          value={formData.product_type}
          onChange={handleChange}
        >
          {Object.entries(PRODUCT_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3">
        <StatusToggle
          id="time-slot-active"
          checked={Boolean(formData.is_active)}
          onChange={(checked) =>
            setFormData((prev) => ({ ...prev, is_active: checked }))
          }
        />
      </div>

      <hr className="mt-4 mb-3" />
      <div className="d-flex align-items-center justify-content-between">
        <button
          type="submit"
          className="form-submit-btn form-submit-btn-size d-inline-flex align-items-center justify-content-center gap-2 border-0 text-white fs-16 fw-medium rounded-3"
        >
          <i className="bi bi-send-fill" aria-hidden="true"></i> Save
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
};

export default AddTimeSlot;
