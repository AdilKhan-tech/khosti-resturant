"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import {createIceCreamBucketRoute,updateIceCreamBucketByIdRoute,} from "@/utils/apiRoutes";
import React from "react";
import FileUploadBox from "@/components/dashboard/shared/FileUploadBox";
import StatusToggle from "@/components/dashboard/shared/StatusToggle";

const AddIceCreamBucket = ({closePopup,iceCreamBucketData,onAddIceCreamBucket,onUpdateIceCreamBucket}) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errors, setErrors] = useState([]);
  const [formData, setFormData] = useState({
    name_en: "",
    name_ar: "",
    slug: "",
    size: "",
    price: "",
    calories: "",
    status: "active",
  });

  useEffect(() => {
    if (iceCreamBucketData) {
      setFormData({
        name_en: iceCreamBucketData.name_en || "",
        name_ar: iceCreamBucketData.name_ar || "",
        slug: iceCreamBucketData.slug || "",
        size: iceCreamBucketData.size || "",
        price: iceCreamBucketData.price || "",
        calories: iceCreamBucketData.calories || "",
        status: iceCreamBucketData.status || "active",
      });
    }
  }, [iceCreamBucketData]);

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.name_en) errors.push("Name English is required.");
    if (!formData.name_ar) errors.push("Name Arabic is required.");
    if (!formData.slug) errors.push("Slug is required.");
    if (!formData.size) errors.push("Size is required.");
    if (!formData.price) errors.push("Price is required.");

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
        if (key !== "id") {
          payload.append(key, value);
        }
      });

      if (selectedFiles.length > 0) {
        payload.append("image_url", selectedFiles[0]);
      }

      //------------ UPDATE
      if (iceCreamBucketData) {
        const res = await axios.put(updateIceCreamBucketByIdRoute(iceCreamBucketData.id), payload);

        if (res.status === 200) {
          toast.success("IceCream Bucket updated successfully!");

          if (onUpdateIceCreamBucket) {
            onUpdateIceCreamBucket(res.data);
          }

          closePopup();
        }
      }

      // ------------CREATE
      else {
        const res = await axios.post(createIceCreamBucketRoute, payload);

        if (res.status === 201 || res.status === 200) {
          toast.success("IceCream Bucket added successfully!");

          if (onAddIceCreamBucket) {
            onAddIceCreamBucket(res.data);
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
      <div className="form-group mt-3">
        <label className="form-label">
          Name English
        </label>
        <input
          name="name_en"
          type="text"
          className="form-control form-control-lg textarea-hover-dark text-secondary"
          value={formData.name_en}
          onChange={(e) =>
            setFormData({ ...formData, name_en: e.target.value })
          }
        />
      </div>
      <div className="form-group mt-3">
        <label className="form-label">
          Name Arabic
        </label>
        <input
          name="name_ar"
          type="text"
          className="form-control form-control-lg textarea-hover-dark text-secondary"
          value={formData.name_ar}
          onChange={(e) =>
            setFormData({ ...formData, name_ar: e.target.value })
          }
        />
      </div>
      <div className="row">
      <div className="form-group mt-3 col-md-6">
        <label className="form-label">
          Slug
        </label>
        <input
          name="slug"
          type="text"
          className="form-control form-control-lg textarea-hover-dark text-secondary"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
        />
      </div>
      <div className="form-group mt-3 col-md-6">
        <label className="form-label">
          Size
        </label>
        <input
          name="size"
          type="text"
          className="form-control form-control-lg textarea-hover-dark text-secondary"
          value={formData.size}
          onChange={(e) => setFormData({ ...formData, size: e.target.value })}
        />
      </div>
      </div>
  <div className="row">
      <div className="form-group mt-3 col-md-6">
        <label className="form-label">
          Price
        </label>
        <input
          name="price"
          type="number"
          className="form-control form-control-lg textarea-hover-dark text-secondary"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
        />
      </div>
      <div className="form-group mt-3 col-md-6">
        <label className="form-label">
          Calories
        </label>
        <input
          name="calories"
          type="number"
          className="form-control form-control-lg textarea-hover-dark text-secondary"
          value={formData.calories}
          onChange={(e) =>
            setFormData({ ...formData, calories: e.target.value })
          }
        />
      </div>
    </div>
      <div className="col-md-12 mt-3">
        <StatusToggle
          id="ice-cream-bucket-status"
          checked={formData.status === "active"}
          onChange={(checked) =>
            setFormData((prev) => ({
              ...prev,
              status: checked ? "active" : "inactive",
            }))
          }
        />
      </div>
      <div className="col-md-12 px-1 mt-2 popup-form-full popup-upload-row">
        <FileUploadBox
          inputId="iceCreamBucketFileInput"
          selectedFiles={selectedFiles}
          onChange={handleFileChange}
        />
        <div className="text-danger">
          <i className="bi bi-info-circle me-2"></i>
          <span className="fs-14 fw-normal">
            Supported files : GIF ,JPG , PNG, PDF , DOC , or DOCX
          </span>
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

export default AddIceCreamBucket;
