"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { createGenderRoute, updateGenderByIdRoute } from "@/utils/apiRoutes";
import FileUploadBox from "@/components/dashboard/shared/FileUploadBox";
const AddGender = ({ closePopup, genderData = null, onAddGender, onUpdateGender }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errors, setErrors] = useState([]);
  const [formData, setFormData] = useState({
    name_en: "",
    name_ar: "",
    parent_gender: "",
    slug: "",
  });
  //load data
  useEffect(() => {
    if (genderData) {
      setFormData({
        name_en: genderData.name_en || "",
        name_ar: genderData.name_ar || "",
        parent_gender: genderData.parent_gender || "",
        slug: genderData.slug || "",
      });
    }
  }, [genderData]);

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.name_en) errors.push("Name English is required.");
    if (!formData.name_ar) errors.push("Name Arabic is required.");
    if (!formData.slug) errors.push("Slug is required.");
    if (!formData.parent_gender) errors.push("Parent Gender is required.");

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);
    if (validationErrors.length > 0) return;

    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => payload.append(key, value));

      if (selectedFiles.length > 0) {
        payload.append("image_url", selectedFiles[0]);
      }

      if (genderData) {
        const res = await axios.put(updateGenderByIdRoute(genderData.id), payload);
        if (res.status === 200 || res.status === 201) {
          toast.success("Gender updated successfully!", { autoClose: 1000, onClose: closePopup });
          onUpdateGender(res.data);
        }
      } else {
        const res = await axios.post(createGenderRoute, payload);
        if (res.status === 200 || res.status === 201) {
          toast.success("Gender added successfully!", { autoClose: 1000, onClose: closePopup });
          onAddGender(res.data);
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
      errors.forEach(err => toast.error(err));
      setErrors([]);
    }
  }, [errors]);

  return (
    <form className="mt-0 popup-form-grid" onSubmit={handleSubmit}>
      <div className="form-group">
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
      <div className="from-group mt-3">
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

      <div className="form-group mt-3">
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

      <div className="form-group mt-3">
        <label className="form-label">
          Parent Gender
        </label>
        <select
          name="parent_gender"
          className="form-select textarea-hover-dark text-secondary"
          value={formData.parent_gender}
          onChange={(e) =>
            setFormData({ ...formData, parent_gender: e.target.value })
          }
        >
          <option value="">Select Parent Gender</option>
          <option value="None">None</option>
          <option value="Boy">Boy</option>
          <option value="Girl">Girl</option>
        </select>
      </div>

      <div className="col-md-12 px-1 mt-2 popup-form-full popup-upload-row">
        <FileUploadBox
          inputId="genderFileInput"
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

export default AddGender;
