"use client";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { createCityRoute, updateCityByIdRoute } from "@/utils/apiRoutes";
import StatusToggle from "@/components/dashboard/shared/StatusToggle";

const AddCity = ({ closePopup, cityData = null, onAddCity, onUpdateCity }) => {
  const [errors, setErrors] = useState([]);
  const [formData, setFormData] = useState({
    name_en: "",
    name_ar: "",
    slug: "",
    status: "active",
  });

  useEffect(() => {
    if (cityData) {
      setFormData({
        name_en: cityData.name_en || "",
        name_ar: cityData.name_ar || "",
        slug: cityData.slug || "",
        status: cityData.status || "active",
      });
    }
  }, [cityData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const next = [];
    if (!formData.name_en) next.push("Name English is required.");
    if (!formData.name_ar) next.push("Name Arabic is required.");
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
      slug: formData.slug.trim() || undefined,
      status: formData.status,
    };

    try {
      if (cityData) {
        const res = await axios.put(updateCityByIdRoute(cityData.id), payload);
        toast.success("City updated successfully!", {
          autoClose: 1000,
          onClose: closePopup,
        });
        onUpdateCity(res.data);
      } else {
        const res = await axios.post(createCityRoute, payload);
        toast.success("City added successfully!", {
          autoClose: 1000,
          onClose: closePopup,
        });
        onAddCity(res.data);
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

      <div className="form-group mt-3">
        <label className="form-label">Slug</label>
        <input
          name="slug"
          type="text"
          className="form-control form-control-lg textarea-hover-dark text-secondary"
          value={formData.slug}
          onChange={handleChange}
        />
      </div>

      <div className="mt-3">
        <StatusToggle
          id="city-status"
          checked={formData.status === "active"}
          onChange={(checked) =>
            setFormData((prev) => ({
              ...prev,
              status: checked ? "active" : "inactive",
            }))
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

export default AddCity;
