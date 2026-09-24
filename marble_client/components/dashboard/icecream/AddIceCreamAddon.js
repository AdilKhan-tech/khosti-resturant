import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { createIceCreamAddOnRoute, updateIceCreamAddOnByIdRoute } from "@/utils/apiRoutes";
import FileUploadBox from "@/components/dashboard/shared/FileUploadBox";
import StatusToggle from "@/components/dashboard/shared/StatusToggle";

const AddIceCreamAddon = ({ closePopup, IceCreamAddonData = null, onAddIceCreamAddon, onUpdateIceCreamAddon }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errors, setErrors] = useState([]);
  const [formData, setFormData] = useState({
    name_en: "",
    name_ar: "",
    slug: "",
    type:"",
    status: "Active",
  });

  useEffect(() => {
    if (IceCreamAddonData) {
      setFormData({
        name_en: IceCreamAddonData.name_en || "",
        name_ar: IceCreamAddonData.name_ar || "",
        slug: IceCreamAddonData.slug || "",
        type: IceCreamAddonData.type || "",
        status: IceCreamAddonData.status || "Active",
      });
    }
  }, [IceCreamAddonData]);

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
    if (!formData.slug) errors.push("Slug is required.");
    if (!formData.type) errors.push("Addon Type is required.");

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

      if (IceCreamAddonData) {
        const res = await axios.put(updateIceCreamAddOnByIdRoute(IceCreamAddonData.id), payload);

        if (res.status === 200) {
          toast.success("Icecream Addon updated successfully!");

          if (onUpdateIceCreamAddon) {
            onUpdateIceCreamAddon(res.data);
          }

          closePopup();
        }
      }
      //  CREATE
      else {
        const res = await axios.post(createIceCreamAddOnRoute, payload);

        if (res.status === 201 || res.status === 200) {
          toast.success("Icecream Addon created successfully!");

          if (onAddIceCreamAddon) {
            onAddIceCreamAddon(res.data);
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
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Name English</label>
          <input
            name="name_en"
            type="text"
            className="form-control form-control-lg textarea-hover-dark text-secondary"
            value={formData.name_en}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Name Arabic</label>
          <input
            name="name_ar"
            type="text"
            className="form-control form-control-lg textarea-hover-dark text-secondary"
            value={formData.name_ar}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Slug</label>
          <input
            name="slug"
            type="text"
            className="form-control form-control-lg textarea-hover-dark text-secondary"
            value={formData.slug}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Addon Type</label>
          <select
            name="type"
            className="form-select textarea-hover-dark text-secondary"
            value={formData.type}
            onChange={handleChange}
          >
            <option value="">Select Addon Type</option>
            <option value="Flavor">Flavor</option>
            <option value="Mix-ins">Mix-ins</option>
            <option value="Sauces">Sauces</option>
          </select>
        </div>
      </div>

      <div className="col-md-12 mt-3">
        <StatusToggle
          id="ice-cream-addon-status"
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
          inputId="iceCreamAddonFileInput"
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

export default AddIceCreamAddon;
