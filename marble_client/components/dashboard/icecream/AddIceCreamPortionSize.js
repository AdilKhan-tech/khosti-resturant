"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import useAxiosConfig from "@/hooks/useAxiosConfig";
import axios from "axios";
import {createIceCreamPortionSizeRoute, updateIceCreamPortionSizeByIdRoute, getIceCreamPortionSizeTreeRoute} from "@/utils/apiRoutes";
import FileUploadBox from "@/components/dashboard/shared/FileUploadBox";
import StatusToggle from "@/components/dashboard/shared/StatusToggle";

const flattenCategories = (iceCreamPortionSizes, level = 0) => {
  let result = [];

  iceCreamPortionSizes.forEach(iceCreamPortionSize => {
    result.push({
      ...iceCreamPortionSize,
      level,
    });

    if (iceCreamPortionSize.children?.length) {
      result = result.concat(
        flattenCategories(iceCreamPortionSize.children, level + 1)
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

const AddIceCreamPortionSize = ({ closePopup, iceCreamPortionData, onAddIceCreamPortionSize, onUpdateIceCreamPortionSize }) => {
  const {token} = useAxiosConfig();
  const [parentIceCreamPortionSize, setParentIceCreamPortionSize] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errors, setErrors] = useState([]);
  const [iceCreamBuckets, setIceCreamBuckets] = useState([]);
  const [formData, setFormData] = useState({
    name_en: "",
    name_ar: "",
    parent_id: "",
    slug: "",
    additional_price: "",
    calories: "",
    status: "Active",
  });

  useEffect(() => {
    if (iceCreamPortionData) {
      setFormData({
        name_en: iceCreamPortionData.name_en || "",
        name_ar: iceCreamPortionData.name_ar || "",
        parent_id: iceCreamPortionData.parent_id || "",
        slug: iceCreamPortionData.slug || "",
        additional_price: iceCreamPortionData.additional_price || "",
        calories: iceCreamPortionData.calories || "",
        status: iceCreamPortionData.status || false,
      });
    }
  }, [iceCreamPortionData]);

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
  const fetchIceCreamPortionSizeTree = async () => {
    if (!token) return;

    const res = await axios.get(getIceCreamPortionSizeTreeRoute);
    const flat = flattenCategories(res.data.data);

    // ✅ If Update Mode
    if (iceCreamPortionData?.id) {
      const currentId = iceCreamPortionData.id;

      // get all children recursively
      const descendantIds = getAllDescendantIds(flat, currentId);

      // remove self + children
      const filtered = flat.filter(
        (item) =>
          item.id !== currentId &&
          !descendantIds.includes(item.id)
      );

      setParentIceCreamPortionSize(filtered);
    } else {
      setParentIceCreamPortionSize(flat);
    }
  };
  useEffect(() => {
    fetchIceCreamPortionSizeTree();
  }, [token]);


  const validateForm = () => {
    const errors = [];

    if (!formData.name_en) errors.push("Name English is required.");
    if (!formData.name_ar) errors.push("Name Arabic is required.");
    if (!formData.slug) errors.push("Slug is required.");
    if (!formData.additional_price) errors.push("Additional price is required.");
    if (!formData.calories && formData.calories !== 0) errors.push("Calories is required.");

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

      if (iceCreamPortionData) {
        const res = await axios.put(updateIceCreamPortionSizeByIdRoute(iceCreamPortionData.id), payload);

        if (res.status === 200) {
          toast.success("Category updated successfully!", {
            autoClose: 1000,
          });

          if (onUpdateIceCreamPortionSize) {
            const updated = res.data;

            if (updated.parent_id) {
              const parent = parentIceCreamPortionSize.find(
                p => p.id === updated.parent_id
              );

              updated.parent = parent
                ? { id: parent.id, name_en: parent.name_en }
                : null;
            } else {
              updated.parent = null;
            }

            onUpdateIceCreamPortionSize(updated);
          }

          closePopup();
        }
      }
      else {
        const res = await axios.post(createIceCreamPortionSizeRoute, payload);

        if (res.status === 201 || res.status === 200) {
          toast.success("IceCream Portion Size added successfully!", {
            autoClose: 1000,
            onClose: closePopup,
          });

          if (onAddIceCreamPortionSize) {
            const newIceCreamPortionSize = res.data;

            if (newIceCreamPortionSize.parent_id) {
              const parent = parentIceCreamPortionSize.find(
                p => p.id === newIceCreamPortionSize.parent_id
              );

              newIceCreamPortionSize.parent = parent
                ? { id: parent.id, name_en: parent.name_en }
                : null;
            }
            onAddIceCreamPortionSize(newIceCreamPortionSize);
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
          onChange={handleChange}
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
          onChange={handleChange}
        />
      </div>

      <div className="form-group mt-3">
        <label className="form-label">
          Parent Portion Size
        </label>
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

          {parentIceCreamPortionSize.map(iceCreamPortionSize => (
              <option key={iceCreamPortionSize.id} value={iceCreamPortionSize.id}>
                {"— ".repeat(iceCreamPortionSize.level || 0)}
                {iceCreamPortionSize.name_en}
              </option>
            ))}
        </select>
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
          onChange={handleChange}
        />
      </div>

      <div className="row">

      <div className="form-group col-md-6 mt-3">
        <label className="form-label">
          Additional Price
        </label>
        <input
          name="additional_price"
          type="text"
          className="form-control form-control-lg textarea-hover-dark text-secondary"
          value={formData.additional_price}
          onChange={handleChange}
        />
      </div>

      <div className="form-group col-md-6 mt-3">
        <label className="form-label">
          Calories
        </label>
        <input
          name="calories"
          type="number"
          className="form-control form-control-lg textarea-hover-dark text-secondary"
          value={formData.calories}
          onChange={handleChange}
        />
      </div>

      </div>

      <div className="col-md-12 mt-3">
        <StatusToggle
          id="ice-cream-portion-status"
          checked={formData.status === "Active"}
          onChange={(checked) =>
            setFormData((prev) => ({
              ...prev,
              status: checked ? "Active" : "Inactive",
            }))
          }
        />
      </div>

      <div className="col-md-12 px-1 mt-2 popup-form-full popup-upload-row">
        <FileUploadBox
          inputId="iceCreamPortionSizeFileInput"
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

export default AddIceCreamPortionSize;
