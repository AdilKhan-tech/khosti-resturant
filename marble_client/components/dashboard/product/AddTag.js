"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { createTagRoute, updateTagByIdRoute } from "@/utils/apiRoutes";

function AddTag({ closePopup, tagData = null, onAddTag, onUpdateTag }) {
  const [errors, setErrors] = useState([]);
  const [formData, setFormData] = useState({
    name_en: "",
    name_ar: "",
    slug: "",
  });

  useEffect(() => {
    if (tagData) {
      setFormData({
        name_en: tagData.name_en || "",
        name_ar: tagData.name_ar || "",
        slug: tagData.slug || "",
      });
    }
  }, [tagData]);

  const validateForm = () => {
    const errors = [];
    if (!formData.name_en) errors.push("Name English is required.");
    if (!formData.name_ar) errors.push("Name Arabic is required.");
    if (!formData.slug) errors.push("Slug is required.");
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);
    if (validationErrors.length > 0) return;

    try {
      if (tagData) {
        const res = await axios.put(updateTagByIdRoute(tagData.id), formData);
        if (res.status === 200) {
          toast.success("Tag updated successfully!", { autoClose: 1000 });
          if (onUpdateTag) onUpdateTag(res.data);
          closePopup();
        }
      } else {
        const res = await axios.post(createTagRoute, formData);
        if (res.status === 201 || res.status === 200) {
          toast.success("Tag created successfully!");
          if (onAddTag) onAddTag(res.data);
          closePopup();
        }
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
          className="form-control form-control-lg text-secondary"
          value={formData.name_en}
          onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Name Arabic</label>
        <input
          name="name_ar"
          className="form-control form-control-lg text-secondary"
          value={formData.name_ar}
          onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
        />
      </div>

      <div className="form-group popup-form-full">
        <label className="form-label">Slug</label>
        <input
          name="slug"
          className="form-control form-control-lg text-secondary"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
        />
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
}

export default AddTag;
