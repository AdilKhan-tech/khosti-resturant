"use client"
import React, { useEffect, useState } from 'react'
import { toast } from "react-toastify";
import axios from "axios";
import { createBranchRoute, getCitiesListRoute, updateBranchByIdRoute } from "@/utils/apiRoutes";
import {
  BRANCH_STATUS,
  BRANCH_STATUS_LABELS,
  normalizeBranchStatus,
} from "@/utils/branchStatus";
import StatusToggle from "@/components/dashboard/shared/StatusToggle";

const AddBranch = ({ closePopup, branchData = null, onAddBranch, onUpdateBranch }) => {
    const [errors, setErrors] = useState([]);
    const [cities, setCities] = useState([]);
    const [formData, setFormData] = useState({
        name_en: "",
        name_ar: "",
        slug: "",
        city_id: "",
        address: "",
        latitude: "",
        longitude: "",
        number: "",
        branch_store_id: "",
        status: BRANCH_STATUS.ACTIVE_FOR_BOTH,
        hide_first_slot: false,
    });

    useEffect(() => {
        const loadCities = async () => {
          try {
            const res = await axios.get(getCitiesListRoute, {
              params: { limit: 200, sortField: "name_en", sortOrder: "ASC" },
            });
            setCities(res.data?.data || []);
          } catch {
            setCities([]);
          }
        };
        loadCities();
    }, []);

    useEffect(() => {
        if (branchData) {
          setFormData({
            name_en: branchData.name_en || "",
            name_ar: branchData.name_ar || "",
            slug: branchData.slug || "",
            city_id: branchData.city_id || "",
            address: branchData.address || "",
            latitude: branchData.latitude || "",
            longitude: branchData.longitude || "",
            number: branchData.number || "",
            branch_store_id: branchData.branch_store_id || "",
            status: normalizeBranchStatus(branchData.status) || BRANCH_STATUS.ACTIVE_FOR_BOTH,
            hide_first_slot: branchData.hide_first_slot === true,
          });
        }
    }, [branchData]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
    };

    const validateForm = () => {
        const errors = [];

        if (!formData.name_en) errors.push("Name English is required.");
        if (!formData.name_ar) errors.push("Name Arabic is required.");
        if (!formData.slug) errors.push("Slug is required.");
        if (!formData.city_id) errors.push("City is required.");
        if (!formData.address) errors.push("Address is required.");
        if (!formData.latitude) errors.push("Latitude is required.");
        if (!formData.longitude) errors.push("Longitude is required.");
        if (!formData.number) errors.push("Contact number is required.");

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm();
        setErrors(validationErrors);
        if (validationErrors.length > 0) return;

        const payload = {
          ...formData,
          city_id: Number(formData.city_id),
          branch_store_id: formData.branch_store_id
            ? Number(formData.branch_store_id)
            : undefined,
        };

        try {
          if (branchData) {
            const res = await axios.put(updateBranchByIdRoute(branchData.id), payload);

            toast.success("Branch updated successfully!", {
              autoClose: 1000,
              onClose: closePopup,
            });

            onUpdateBranch(res.data);
          } else {
            const res = await axios.post(createBranchRoute, payload);

            toast.success("Branch added successfully!", {
              autoClose: 1000,
              onClose: closePopup,
            });

            onAddBranch(res.data);
          }
        }catch (error) {
            const backendMessage =
              error?.response?.data?.message ||
              error?.response?.data?.errors?.[0] ||
              "Something went wrong!";

            toast.error(backendMessage);
        }
    };

    useEffect(() => {
        if (errors.length > 0) {
          errors.forEach(err => toast.error(err));
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

        <div className="form-group">
            <label className="form-label">Name Arabic</label>
            <input
                name="name_ar"
                type="text"
                className="form-control form-control-lg textarea-hover-dark text-secondary"
                value={formData.name_ar}
                onChange={handleChange}
            />
        </div>

        <div className='row mt-3'>
        <div className="form-group col-md-6">
            <label className="form-label">Slug</label>
            <input
                name="slug"
                type="text"
                className="form-control form-control-lg textarea-hover-dark text-secondary"
                value={formData.slug}
                onChange={handleChange}
            />
        </div>

        <div className="form-group col-md-6">
            <label className="form-label">City</label>
            <select
                name="city_id"
                className="form-control form-control-lg textarea-hover-dark text-secondary"
                value={formData.city_id}
                onChange={handleChange}
            >
                <option value="">Select city</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name_en}
                  </option>
                ))}
            </select>
        </div>
        </div>

        <div className="form-group popup-form-full">
        <label className="form-label">Address</label>
        <textarea
            name="address"
            rows="2"
            className="form-control textarea-hover-dark text-secondary"
            value={formData.address}
            onChange={handleChange}
        />
        </div>

        <div className="row mt-3">
        <div className="form-group col-md-6">
            <label className="form-label">Latitude</label>
            <input
                name="latitude"
                type="number"
                step="any"
                className="form-control form-control-lg textarea-hover-dark text-secondary"
                value={formData.latitude}
                onChange={handleChange}
            />
        </div>

        <div className="form-group col-md-6">
            <label className="form-label">Longitude</label>
            <input
                name="longitude"
                type="number"
                step="any"
                className="form-control form-control-lg textarea-hover-dark text-secondary"
                value={formData.longitude}
                onChange={handleChange}
            />
        </div>
        </div>

        <div className="form-group popup-form-full">
            <label className="form-label">Number</label>
            <input
                name="number"
                type="text"
                className="form-control form-control-lg textarea-hover-dark text-secondary"
                value={formData.number}
                onChange={handleChange}
            />
        </div>

        <div className='row mt-3'>
        <div className="form-group col-md-6">
            <label className="form-label">Branch Store Id</label>
            <input
                name="branch_store_id"
                type="text"
                className="form-control form-control-lg textarea-hover-dark text-secondary"
                value={formData.branch_store_id}
                onChange={handleChange}
            />
        </div>
        <div className="form-group col-md-6">
            <label className="form-label">Status</label>
            <select
                name="status"
                className="form-select form-select-lg text-secondary"
                value={formData.status}
                onChange={handleChange}
            >
                <option value="">Select Status</option>
                {Object.entries(BRANCH_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
            </select>
        </div>
        </div>

        <div className="form-group popup-form-full mt-3">
            <StatusToggle
                id="hide_first_slot"
                label="Hide first time slot"
                checked={formData.hide_first_slot}
                onChange={(checked) =>
                    setFormData((prev) => ({
                        ...prev,
                        hide_first_slot: checked,
                    }))
                }
            />
            <p className="small text-muted mb-0 mt-1">
                Removes the earliest daily time slot for this branch (e.g. Rabwah).
            </p>
        </div>

        <hr className="mt-4 mb-3" />
        <div className="d-flex align-items-center justify-content-between">
          <button type="submit" className="form-submit-btn form-submit-btn-size d-inline-flex align-items-center justify-content-center gap-2 border-0 text-white fs-16 fw-medium rounded-3">
            <i className="bi bi-send-fill" aria-hidden="true"></i> Save
          </button>
          <button type="button" className="form-cancel-btn form-cancel-btn-size d-inline-flex align-items-center gap-2 bg-white border rounded-3 text-muted fs-14 px-3" onClick={closePopup}>
            <i className="bi bi-x-circle" aria-hidden="true"></i> Cancel
          </button>
        </div>

        </form>
    );
};

export default AddBranch;
