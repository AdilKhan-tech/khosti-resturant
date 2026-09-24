"use client"
import React, { useEffect, useState } from 'react'
import useAxiosConfig from "@/hooks/useAxiosConfig";
import { toast } from "react-toastify";
import axios from "axios";
import { createCakePortionSizeRoute, updateCakePortionSizeByIdRoute, getCakePortionSizeTreeRoute } from "@/utils/apiRoutes";
import FileUploadBox from "@/components/dashboard/shared/FileUploadBox";

const flattenCategories = (cakePortionSizes, level = 0) => {
  let result = [];

  cakePortionSizes.forEach(cakePortionSize => {
    result.push({
      ...cakePortionSize,
      level,
    });

    if (cakePortionSize.children?.length) {
      result = result.concat(
        flattenCategories(cakePortionSize.children, level + 1)
      );
    }
  });

  return result;
};

const getAllDescendantIds = (items, parentId) => {
  const ids = [];

  const findChildren = (id) => {
    items.forEach((item) => {
      if (item.parent_id === id) {
        ids.push(item.id);
        findChildren(item.id);
      }
    });
  };

  findChildren(parentId);
  return ids;
};

const AddCakePortionSize = ({ closePopup, cakePortionSizeData = null, onAddCakePortionSize, onUpdateCakePortionSize }) => {
  const { token } = useAxiosConfig();
  const [parentCakePortionSizes, setParentCakePortionSizes] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errors, setErrors] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    name_en: "",
    name_ar: "",
    slug: "",
    parent_id: "",
  });

  useEffect(() => {
    if (cakePortionSizeData) {
      setFormData({
        id: cakePortionSizeData.id,
        name_en: cakePortionSizeData.name_en || "",
        name_ar: cakePortionSizeData.name_ar || "",
        slug: cakePortionSizeData.slug || "",
        parent_id: cakePortionSizeData.parent_id || "",
      });
    }
  }, [cakePortionSizeData]);

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

  const fetchCakePortionSizeTree = async () => {
    if (!token) return;

    const res = await axios.get(getCakePortionSizeTreeRoute);
    const flat = flattenCategories(res.data.data);

    // ✅ If Update Mode
    if (cakePortionSizeData?.id) {
      const currentId = cakePortionSizeData.id;

      // get all children recursively
      const descendantIds = getAllDescendantIds(flat, currentId);

      // remove self + children
      const filtered = flat.filter(
        (item) =>
          item.id !== currentId &&
          !descendantIds.includes(item.id)
      );

      setParentCakePortionSizes(filtered);
    } else {
      setParentCakePortionSizes(flat);
    }
  };

  useEffect(() => {
    fetchCakePortionSizeTree();
  }, [token]);

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
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          payload.append(key, value);
        }
      });

      if (selectedFiles.length > 0) {
        payload.append("image_url", selectedFiles[0]);
      }

      //------------ UPDATE
      if (cakePortionSizeData) {
        const res = await axios.put(updateCakePortionSizeByIdRoute(cakePortionSizeData.id), payload);

        if (res.status === 200) {
          toast.success("Cake Portion Size updated successfully!", {
            autoClose: 1000,
          });

          if (onUpdateCakePortionSize) {
            const updated = res.data;

           if (updated.parent_id) {
              const parent = parentCakePortionSizes.find(
                p => p.id === updated.parent_id
              );

              updated.parent = parent
                ? { id: parent.id, name_en: parent.name_en }
                : null;
            }

            onUpdateCakePortionSize(updated);
          }

          closePopup();
        }
      }

      // ------------CREATE
      else {
        const res = await axios.post(createCakePortionSizeRoute, payload);

        if (res.status === 201 || res.status === 200) {
         toast.success("Cake Portion Size added successfully!",
         {autoClose: 1000, onClose: closePopup, });


         if (onAddCakePortionSize) {
            const newCakePortionSize = res.data;

              if (newCakePortionSize.parent_id) {
              const parent = parentCakePortionSizes.find(
                p => p.id === newCakePortionSize.parent_id
              );
               newCakePortionSize.parent = parent
                ? { id: parent.id, name_en: parent.name_en }
                : null;
            }
            onAddCakePortionSize(newCakePortionSize);
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
          <label className="form-label">Parent Portion Size</label>
          <select
            name="parent_id"
            className="form-select textarea-hover-dark text-secondary"
            value={formData.parent_id ?? ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                parent_id: e.target.value ? Number(e.target.value) : null
              })
            }
          >
            <option value="">None</option>

            {parentCakePortionSizes.map(cakePortionSize => (
              <option key={cakePortionSize.id} value={cakePortionSize.id}>
                {"— ".repeat(cakePortionSize.level || 0)}
                {cakePortionSize.name_en}
              </option>
            ))}
        </select>
        </div>
      </div>

      <div className="col-md-12 px-1 mt-3 popup-form-full popup-upload-row">
        <FileUploadBox
          inputId="cakePortionSizeFileInput"
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

export default AddCakePortionSize;
