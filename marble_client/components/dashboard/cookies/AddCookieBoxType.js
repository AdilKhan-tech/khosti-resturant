"use client";
import React, { use } from "react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { createCookieBoxTypeRoute, updateCookieTypeByIdRoute } from "@/utils/apiRoutes";
import FileUploadBox from "@/components/dashboard/shared/FileUploadBox";
import StatusToggle from "@/components/dashboard/shared/StatusToggle";

const AddCookieBoxType = ({ closePopup, cookieBoxTypeData = null, onAddCookieBoxType, onUpdateCookieBoxType }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errors, setErrors] = useState([]);
  const [formData, setFormData] = useState({
    name_en:"",
    name_ar:"",
    slug:"",
    sort:"",
    status:"active",
    image_url:"",
  })

  useEffect(() => {
    if (cookieBoxTypeData) {
      setFormData({
        name_en: cookieBoxTypeData.name_en || "",
        name_ar: cookieBoxTypeData.name_ar || "",
        slug: cookieBoxTypeData.slug || "",
        sort: cookieBoxTypeData.sort || "",
        status: cookieBoxTypeData.status || "active",
        image_url: cookieBoxTypeData.image_url || "",
      });
    }
  }, [cookieBoxTypeData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.name_en) errors.push("Name English is required.");
    if (!formData.name_ar) errors.push("Name Arabic is required.");
    if (!formData.slug) errors.push("Slug is required.");
    if (!formData.sort) errors.push("Sort is required.");

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

      if (selectedFiles && selectedFiles.length > 0) {
        payload.append("image_url", selectedFiles[0]);
      }


      if (cookieBoxTypeData) {
        const res = await axios.put(updateCookieTypeByIdRoute(cookieBoxTypeData.id), payload);

        if (res.status === 200) {
          toast.success("Cookie box type updated successfully!", {
            autoClose: 1000,
          });

          if (onUpdateCookieBoxType) {
            onUpdateCookieBoxType(res.data);
          }

          closePopup();
        }
      }

      //  CREATE
      else {
        const res = await axios.post(createCookieBoxTypeRoute, payload);

        if (res.status === 201 || res.status === 200) {
          toast.success("Cookie Box Type created successfully!");

          if (onAddCookieBoxType) {
            onAddCookieBoxType(res.data);
          }

          closePopup();
        }
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
        <label className="form-label">Sort</label>
        <input
          name="sort"
          type="number"
          className="form-control form-control-lg textarea-hover-dark text-secondary"
          value={formData.sort}
          onChange={handleChange}
        />
      </div>
      </div>

      <div className="col-md-12 mt-3">
        <StatusToggle
          id="cookie-box-type-status"
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
          inputId="cookieBoxTypeFileInput"
          selectedFiles={selectedFiles}
          onChange={handleFileChange}
          multiple={false}
        />
        <div className="text-danger">
        <i className="bi bi-info-circle me-2"></i>
        <span className="fs-14 fw-normal">Supported files : GIF ,JPG , PNG, PDF , DOC , or DOCX</span>
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
};

export default AddCookieBoxType;
