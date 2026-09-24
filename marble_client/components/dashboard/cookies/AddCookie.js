"use client";
import React from "react";
import { useEffect, useState } from "react";
import useAxiosConfig from "@/hooks/useAxiosConfig";
import { toast } from "react-toastify";
import axios from "axios";
import { createCookieRoute, updateCookieByIdRoute, getCookieBoxTypesRoute } from "@/utils/apiRoutes";
import FileUploadBox from "@/components/dashboard/shared/FileUploadBox";
import StatusToggle from "@/components/dashboard/shared/StatusToggle";
import CheckboxMultiSelect from "@/components/dashboard/shared/CheckboxMultiSelect";

const AddCookie = ({ closePopup, cookieData = null, onAddCookie, onUpdateCookie }) => {
  const { token } = useAxiosConfig();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errors, setErrors] = useState([]);
  const [cookieBoxTypes, setCookieBoxTypes] = useState([]);

  const [selectedTypeIds, setSelectedTypeIds] = useState([]);
  const [formData, setFormData] = useState({
      name_en:"",
      name_ar:"",
      slug:"",
      sort:"",
      status:"active",
      image_url:"",
  })

  useEffect(() => {
    if (cookieData) {
      setFormData({
        name_en: cookieData.name_en || "",
        name_ar: cookieData.name_ar || "",
        slug: cookieData.slug || "",
        sort: cookieData.sort || "",
        status: cookieData.status || "active",
        image_url: cookieData.image_url || "",
      });
      const typeIds = cookieData.cookieBoxTypes
        ? cookieData.cookieBoxTypes.map((t) => t.id)
        : cookieData.type
          ? [cookieData.type.id]
          : [];
      setSelectedTypeIds(typeIds);
    }
  }, [cookieData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const fetchCookieBoxTypes = async () => {
    try {
      const response = await axios.get(getCookieBoxTypesRoute);
      setCookieBoxTypes(response?.data?.data);
    }catch(error){
      console.error("Error fetching cookie", error)
    }
  }

  useEffect (() =>{
    if(!token) return;
    fetchCookieBoxTypes();
  }, [token])

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const validateForm = () => {
    const errors = [];
    if (!formData.name_en) errors.push("Name English is required.");
    if (!formData.name_ar) errors.push("Name Arabic is required.");
    if (selectedTypeIds.length === 0) errors.push("At least one cookie type is required.");
    if (!formData.slug) errors.push("Slug is required.");
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

      payload.append("cookie_type_ids", selectedTypeIds.join(","));

      if (selectedFiles && selectedFiles.length > 0) {
        payload.append("image_url", selectedFiles[0]);
      }


      if (cookieData) {
        const res = await axios.put(updateCookieByIdRoute(cookieData.id), payload);

        if (res.status === 200) {
          toast.success("Cookie updated successfully!", {
            autoClose: 1000,
          });

          if (onUpdateCookie) {
            onUpdateCookie(res.data);
          }

          closePopup();
        }
      }

      else {
        const res = await axios.post(createCookieRoute, payload);

        if (res.status === 201 || res.status === 200) {
          toast.success("Cookie added successfully!", {
            autoClose: 1000,
            onClose: closePopup,
          });
          if (onAddCookie) onAddCookie(res.data);
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
    if (errors.length) {
      errors.forEach((err) => toast.error(err));
      setErrors([]);
    }
  }, [errors]);

  return (
    <form className="mt-0 popup-form-grid" onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Name English</label>
        <input
          name="name_en" type="text"
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

      <CheckboxMultiSelect
        label="Cookie Types"
        items={cookieBoxTypes}
        selectedIds={selectedTypeIds}
        onChange={setSelectedTypeIds}
        idPrefix="cookie-type"
        emptyMessage="No cookie types found."
      />

      <div className="row mt-3">
      <div className="form-group col-md-6">
        <label className="form-label">Slug</label>
        <input
          name="slug" type="text"
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
          id="cookie-status"
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
          inputId="cookieFileInput"
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

export default AddCookie;
