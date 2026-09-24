"use client";
import React from "react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import useAxiosConfig from "@/hooks/useAxiosConfig";
import axios from "axios";
import { createCakeSizeRoute, updateCakeSizeByIdRoute, getCategoryChildrenRoute } from "@/utils/apiRoutes";
import FileUploadBox from "@/components/dashboard/shared/FileUploadBox";
import StatusToggle from "@/components/dashboard/shared/StatusToggle";

const AddCakeSize = ({ closePopup, cakeSizeData = null, onAddCakeSize, onUpdateCakeSize }) => {
  const {token} = useAxiosConfig();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errors, setErrors] = useState([]);
  const [cakeCategories, setCakeCategories] = useState([]);

  const [formData, setFormData] = useState({
    cake_category_id: "",
    name_en: "",
    name_ar: "",
    slug: "",
    scoop_size: "",
    additional_price: "",
    calories: "",
    status: "active",
  });

  useEffect(() => {
    if (cakeSizeData) {
      setFormData({
        cake_category_id: cakeSizeData.cake_category_id || "",
        name_en: cakeSizeData.name_en || "",
        name_ar: cakeSizeData.name_ar || "",
        slug: cakeSizeData.slug || "",
        scoop_size: cakeSizeData.scoop_size || "",
        additional_price: cakeSizeData.additional_price || "",
        calories: cakeSizeData.calories || "",
        status: cakeSizeData.status || "active",
      });
    }
  }, [cakeSizeData]);

  // ✅ YAHAN LAGAO
  const findCategoryById = (categories, id) => {
    for (const cat of categories) {
      if (String(cat.id) === String(id)) return cat;

      if (cat.children?.length) {
        const found = findCategoryById(cat.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const fetchCakeCategories = async () => {
    try {
      const response = await axios.get(getCategoryChildrenRoute);
      setCakeCategories(response.data);
    } catch (error) {
      console.error("Error fetching cake categories", error);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchCakeCategories();
  }, [token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.name_en) errors.push("Name English is required.");
    if (!formData.name_ar) errors.push("Name Arabic is required.");
    if (!formData.cake_category_id) errors.push("Cake type is required.");
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

      if (selectedFiles && selectedFiles.length > 0) {
        payload.append("image_url", selectedFiles[0]);
      }

      // ================= UPDATE =================
      if (cakeSizeData) {
        const res = await axios.put(
          updateCakeSizeByIdRoute(cakeSizeData.id),
          payload
        );

        if (res.status === 200) {
          toast.success("Cake size updated successfully!", {
            autoClose: 1000,
          });

          const selectedType = findCategoryById(
            cakeCategories,
            formData.cake_category_id
          );

          const updatedCakeSize = {
            ...res.data,
            cakeCategory: selectedType || null,
          };

          if (onUpdateCakeSize) {
            onUpdateCakeSize(updatedCakeSize);
          }

          closePopup();
        }
      }

      // ================= CREATE =================
      else {
        const res = await axios.post(createCakeSizeRoute, payload);

        if (res.status === 201 || res.status === 200) {
          const selectedType = findCategoryById(
            cakeCategories,
            formData.cake_category_id
          );

          const createdCakeSize = {
            ...res.data,
            cakeCategory: selectedType || null,
          };

          toast.success("Cake Size added successfully!", {
            autoClose: 1000,
            onClose: closePopup,
          });

          if (onAddCakeSize) onAddCakeSize(createdCakeSize);
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
          <label className="form-label">
            Cake Category
          </label>
          <select
            name="cake_category_id"
            className="form-select textarea-hover-dark text-secondary"
            value={formData.cake_category_id}
            onChange={handleChange}
          >
            <option value="">Select Cake Category</option>
              {cakeCategories.map((parent) => (
                <React.Fragment key={parent.id}>
                  {/* Parent category */}
                  <option value={parent.id}>
                    {parent.name_en}
                  </option>

                  {/* Children categories */}
                  {parent.children?.map((child) => (
                    <option key={child.id} value={child.id}>
                      {"— "}{child.name_en}
                    </option>
                  ))}
                </React.Fragment>
              ))}
          </select>
        </div>

        <div className="row">
        <div className="form-group mt-3 col-md-6">
          <label className="form-label">Slug</label>
          <input
            name="slug"
            type="text"
            className="form-control form-control-lg textarea-hover-dark text-secondary"
            value={formData.slug}
            onChange={handleChange}
          />
        </div>

      <div className="form-group mt-3 col-md-6">
        <label className="form-label">Scoop Size</label>
        <input
          name="scoop_size"
          type="text"
          className="form-control form-control-lg textarea-hover-dark text-secondary"
          value={formData.scoop_size}
          onChange={handleChange}
        />
      </div>

      </div>

      <div className="row">
        <div className="form-group mt-3 col-md-6">
          <label className="form-label">Additional Price</label>
          <input
            name="additional_price"
            type="text"
            className="form-control form-control-lg textarea-hover-dark text-secondary"
            value={formData.additional_price} onChange={handleChange}
          />
        </div>

        <div className="form-group mt-3 col-md-6">
          <label className="form-label">Calories</label>
          <input
            name="calories"
            type="text"
            className="form-control form-control-lg textarea-hover-dark text-secondary"
            value={formData.calories}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="col-md-12 mt-3">
        <StatusToggle
          id="cake-size-status"
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
          inputId="cakeSizeFileInput"
          selectedFiles={selectedFiles}
          onChange={handleFileChange}
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

export default AddCakeSize;
