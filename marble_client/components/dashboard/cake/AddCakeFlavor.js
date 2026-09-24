"use client";
import React from "react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import useAxiosConfig from "@/hooks/useAxiosConfig";
import axios from "axios";
import { createCakeFlavorRoute, updateCakeFlavorByIdRoute, getCategoryChildrenRoute } from "@/utils/apiRoutes";
import FileUploadBox from "@/components/dashboard/shared/FileUploadBox";
import StatusToggle from "@/components/dashboard/shared/StatusToggle";

const AddCakeFlavor = ({ closePopup, cakeFlavorData = null, onAddCakeFlavor, onUpdateCakeFlavor }) => {
  const {token} = useAxiosConfig();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errors, setErrors] = useState([]);
  const [cakeCategories, setCakeCategories] = useState([]);

  const [formData, setFormData] = useState({
    name_en: "",
    name_ar: "",
    cake_category_id: "",
    slug: "",
    additional_price: "",
    symbol: "",
    status: "active",
  });

  useEffect(() => {
    if (cakeFlavorData) {
      setFormData({
        name_en: cakeFlavorData.name_en || "",
        name_ar: cakeFlavorData.name_ar || "",
        cake_category_id: cakeFlavorData.cake_category_id || "",
        slug: cakeFlavorData.slug || "",
        additional_price: cakeFlavorData.additional_price || "",
        symbol: cakeFlavorData.symbol || "",
        status: cakeFlavorData.status || "active",
      });
    }
  }, [cakeFlavorData]);

    const fetchCakeCategories = async () => {
    try {
      const response = await axios.get(getCategoryChildrenRoute);
      setCakeCategories(response.data);
    } catch (error) {
      console.error("Error fetching cake categories", error);
    }
    };

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
    if (!formData.status) errors.push("Status is required.");
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
      if (cakeFlavorData) {
        const res = await axios.put(
          updateCakeFlavorByIdRoute(cakeFlavorData.id),
          payload
        );

        if (res.status === 200) {
          toast.success("Cake Flavor updated successfully!", {
            autoClose: 1000,
          });

          const selectedType = findCategoryById(
            cakeCategories,
            formData.cake_category_id
          );

          const updatedCakeFlavor = {
            ...res.data,
            cakeCategory: selectedType || null,
          };

          if (onUpdateCakeFlavor) {
            onUpdateCakeFlavor(updatedCakeFlavor);
          }

          closePopup();
        }
      }

      // ================= CREATE =================
      else {
        const res = await axios.post(createCakeFlavorRoute, payload);

        if (res.status === 201 || res.status === 200) {
          const selectedType = findCategoryById(
            cakeCategories,
            formData.cake_category_id
          );

          const createdCakeFlavor = {
            ...res.data,
            cakeCategory: selectedType || null,
          };

          toast.success("Cake Flavor added successfully!", {
            autoClose: 1000,
            onClose: closePopup,
          });

          if (onAddCakeFlavor) onAddCakeFlavor(createdCakeFlavor);
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
    <form className="component-form popup-form-grid" onSubmit={handleSubmit}>
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
          Cake Type
        </label>
        <select
          name="cake_category_id"
          className="form-select textarea-hover-dark text-secondary"
          value={formData.cake_category_id}
          onChange={handleChange}
        >
          <option value="">Select Cake Type</option>

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
        <label className="form-label">Price</label>
        <input
          name="additional_price"
          type="number"
          className="form-control form-control-lg textarea-hover-dark text-secondary"
          value={formData.additional_price}
          onChange={handleChange}
        />
      </div>
      </div>

      <div className="form-group mt-3">
        <label className="form-label">Symbol</label>
        <input
          name="symbol"
          type="text"
          className="form-control form-control-lg textarea-hover-dark text-secondary"
          value={formData.symbol}
          onChange={handleChange}
        />
      </div>

      <div className="col-md-12 mt-3">
        <StatusToggle
          id="cake-flavor-status"
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
          inputId="cakeFlavorFileInput"
          selectedFiles={selectedFiles}
          onChange={handleFileChange}
        />
        <div className="text-danger">
        <i className="bi bi-info-circle me-2"></i>
        <span className="fs-12 fw-bold">Supported files : GIF ,JPG , PNG, PDF , DOC , or DOCX</span>
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

export default AddCakeFlavor;
