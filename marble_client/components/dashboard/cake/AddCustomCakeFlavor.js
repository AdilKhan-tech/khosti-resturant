"use client";
import React from "react";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import useAxiosConfig from "@/hooks/useAxiosConfig";
import axios from "axios";
import { updateCustomCakeFlavorByIdRoute, createCustomCakeFlavorRoute, getCustomCakeTypesRoute } from "@/utils/apiRoutes";
import FileUploadBox from "@/components/dashboard/shared/FileUploadBox";
import StatusToggle from "@/components/dashboard/shared/StatusToggle";
import CheckboxMultiSelect from "@/components/dashboard/shared/CheckboxMultiSelect";

function AddCustomCakeFlavor({ closePopup, customCakeFlavorData = null, onUpdateCustomCakeFlavor, onAddCustomCakeFlavor }) {
  const { token } = useAxiosConfig();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errors, setErrors] = useState([]);
  const [customCakeTypes, setCustomCakeTypes] = useState([]);
  const [selectedTypeIds, setSelectedTypeIds] = useState([]);
  const [formData, setFormData] = useState({
    name_en: "",
    name_ar: "",
    slug: "",
    status: "active",
  });

  useEffect(() => {
    if (customCakeFlavorData) {
      setFormData({
        name_en: customCakeFlavorData.name_en || "",
        name_ar: customCakeFlavorData.name_ar || "",
        slug: customCakeFlavorData.slug || "",
        status: customCakeFlavorData.status || "active",
      });
      const typeIds = customCakeFlavorData.customCakeTypes
        ? customCakeFlavorData.customCakeTypes.map((t) => t.id)
        : [];
      setSelectedTypeIds(typeIds);
    }
  }, [customCakeFlavorData]);

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const validateForm = () => {
    const errors = [];
    if (!formData.name_en) errors.push("Name English is required.");
    if (!formData.name_ar) errors.push("Name Arabic is required.");
    if (!formData.slug) errors.push("Slug is required.");
    if (selectedTypeIds.length === 0) errors.push("At least one cake type is required.");
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);
    if (validationErrors.length > 0) return;

    try {
      const payload = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, value);
      });

      payload.append("cake_type_ids", selectedTypeIds.join(","));

      if (selectedFiles && selectedFiles.length > 0) {
        payload.append("image_url", selectedFiles[0]);
      }

      if (customCakeFlavorData) {
        const res = await axios.put(
          updateCustomCakeFlavorByIdRoute(customCakeFlavorData.id),
          payload
        );

        if (res.status === 200) {
          toast.success("Custom Cake Flavor updated successfully!", { autoClose: 1000 });
          if (onUpdateCustomCakeFlavor) onUpdateCustomCakeFlavor(res.data);
          closePopup();
        }
      } else {
        const res = await axios.post(createCustomCakeFlavorRoute, payload);

        if (res.status === 201 || res.status === 200) {
          toast.success("Custom Cake Flavor added successfully!", {
            autoClose: 1000,
            onClose: closePopup,
          });
          if (onAddCustomCakeFlavor) onAddCustomCakeFlavor(res.data);
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

  const fetchAllCustomCakeTypes = async () => {
    try {
      const response = await axios.get(getCustomCakeTypesRoute);
      setCustomCakeTypes(response.data.data);
    } catch (error) {
      console.error("Error fetching custom cake types", error);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchAllCustomCakeTypes();
  }, [token]);

  return (
    <form className="mt-0 popup-form-grid" onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Name English</label>
        <input
          name="name_en"
          type="text"
          className="form-control form-control-lg textarea-hover-dark text-secondary"
          value={formData.name_en}
          onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
        />
      </div>

      <div className="form-group mt-3">
        <label className="form-label">Name Arabic</label>
        <input
          name="name_ar"
          type="text"
          className="form-control form-control-lg textarea-hover-dark text-secondary"
          value={formData.name_ar}
          onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
        />
      </div>

      <div className="form-group mt-3">
        <label className="form-label">Slug</label>
        <input
          name="slug"
          type="text"
          className="form-control text-secondary"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
        />
      </div>

      <CheckboxMultiSelect
        label="Cake Types"
        items={customCakeTypes}
        selectedIds={selectedTypeIds}
        onChange={setSelectedTypeIds}
        idPrefix="flavor-type"
        emptyMessage="No cake types found."
      />

      <div className="col-md-12 mt-3">
        <StatusToggle
          id="custom-cake-flavor-status"
          checked={formData.status === "active"}
          onChange={(checked) =>
            setFormData((prev) => ({
              ...prev,
              status: checked ? "active" : "inactive",
            }))
          }
        />
      </div>

      <div className="col-md-12 px-1 mt-3 popup-form-full popup-upload-row">
        <FileUploadBox
          inputId="customCakeFlavorFileInput"
          selectedFiles={selectedFiles}
          onChange={handleFileChange}
          multiple={false}
        />
        <div className="text-danger">
          <i className="bi bi-info-circle me-2"></i>
          <span className="fs-14 fw-normal">Supported files: GIF, JPG, PNG</span>
        </div>
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

export default AddCustomCakeFlavor;
