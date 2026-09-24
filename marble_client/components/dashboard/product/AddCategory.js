"use client";
import { useEffect, useState } from "react";
import useAxiosConfig from "@/hooks/useAxiosConfig";
import { toast } from "react-toastify";
import axios from "axios";
import { updateCategoryByIdRoute, createCategoryRoute, getCategoryTreeRoute } from "@/utils/apiRoutes";
import FileUploadBox from "@/components/dashboard/shared/FileUploadBox";

const flattenCategories = (categories, level = 0) => {
  let result = [];

  categories.forEach(cat => {
    result.push({
      ...cat,
      level,
    });

    if (cat.children?.length) {
      result = result.concat(
        flattenCategories(cat.children, level + 1)
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

const AddCategory = ({closePopup,categoryData = null,onAddCategory,onUpdateCategory,}) => {
  const { token } = useAxiosConfig();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [parentCategories, setParentCategories] = useState([]);
  const [errors, setErrors] = useState([]);
  const [formData, setFormData] = useState({
    name_en: "",
    name_ar: "",
    slug: "",
    parent_id: "",
    display_type: "",
  });

  useEffect(() => {
    if (categoryData) {
      setFormData({
        name_en: categoryData.name_en || "",
        name_ar: categoryData.name_ar || "",
        slug: categoryData.slug || "",
        parent_id: categoryData.parent_id || "",
        display_type: categoryData.display_type || "",
      });
    }
  }, [categoryData]);

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const fetchCategories = async () => {
    if (!token) return;

    const res = await axios.get(getCategoryTreeRoute);
    const flat = flattenCategories(res.data.data);

    // ✅ If Update Mode
    if (categoryData?.id) {
      const currentId = categoryData.id;

      // get all children recursively
      const descendantIds = getAllDescendantIds(flat, currentId);

      // remove self + children
      const filtered = flat.filter(
        (item) =>
          item.id !== currentId &&
          !descendantIds.includes(item.id)
      );

      setParentCategories(filtered);
    } else {
      setParentCategories(flat);
    }
  };

  useEffect(() => {
    fetchCategories();
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

      if (categoryData) {
        const res = await axios.put(updateCategoryByIdRoute(categoryData.id), payload);

        if (res.status === 200) {
          toast.success("Category updated successfully!", {
            autoClose: 1000,
          });

          if (onUpdateCategory) {
            const updated = res.data;

            if (updated.parent_id) {
              const parent = parentCategories.find(
                p => p.id === updated.parent_id
              );

              updated.parent = parent
                ? { id: parent.id, name_en: parent.name_en }
                : null;
            } else {
              updated.parent = null;
            }

            onUpdateCategory(updated);
          }

          closePopup();
        }
      }
      else {
        const res = await axios.post(createCategoryRoute, payload);

        if (res.status === 201 || res.status === 200) {
          toast.success("Category added successfully!", {autoClose: 1000, onClose: closePopup, });

          if (onAddCategory) {
            const newCategory = res.data;

            if (newCategory.parent_id) {
              const parent = parentCategories.find(
                p => p.id === newCategory.parent_id
              );

              newCategory.parent = parent
                ? { id: parent.id, name_en: parent.name_en }
                : null;
            }
            onAddCategory(newCategory);
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

      <div className="row">
        <div className="form-group mt-3 col-md-6">
          <label className="form-label">
            Parent Category
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

            {parentCategories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {"— ".repeat(cat.level || 0)}
                {cat.name_en}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group mt-3 col-md-6">
          <label className="form-label">
            Display Type
          </label>
          <select
            name="display_type"
            type="text"
            className="form-select textarea-hover-dark text-secondary"
            value={formData.display_type}
            onChange={(e) =>
              setFormData({ ...formData, display_type: e.target.value })}>
            <option value="Default">Default</option>
            <option value="Products">Products</option>
            <option value="Subcategories">Subcategories</option>
            <option value="Both">Both</option>
          </select>
        </div>
      </div>

      <div className="col-md-12 px-1 mt-3 popup-form-full popup-upload-row">
        <FileUploadBox
          inputId="categoryFileInput"
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

export default AddCategory;
