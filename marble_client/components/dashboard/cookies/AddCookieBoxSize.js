"use client";
import React from "react";
import { useEffect, useState } from "react";
import useAxiosConfig from "@/hooks/useAxiosConfig";
import { toast } from "react-toastify";
import axios from "axios";
import { createCookieBoxSizeRoute, updateCookieBoxSizeByIdRoute, getCookieBoxTypesRoute } from "@/utils/apiRoutes";
import FileUploadBox from "@/components/dashboard/shared/FileUploadBox";
import StatusToggle from "@/components/dashboard/shared/StatusToggle";
import CheckboxMultiSelect from "@/components/dashboard/shared/CheckboxMultiSelect";

function parsePortionPieces(value) {
  if (typeof value === "number" && value >= 1) return Math.floor(value);
  const str = String(value ?? "").trim();
  if (/^[1-9]\d*$/.test(str)) return parseInt(str, 10);
  const match = str.match(/\b(\d+)\b/);
  return match ? parseInt(match[1], 10) : null;
}

const AddCookieBoxSize = ({ closePopup, cookieBoxSizeData = null, onAddCookieBoxSize, onUpdateCookieBoxSize }) => {
  const {token} = useAxiosConfig();
  const [cookiesBoxTypes, setCookiesBoxTypes] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errors, setErrors] = useState([]);
  const [selectedTypeIds, setSelectedTypeIds] = useState([]);
  const [formData, setFormData] = useState({
    name_en: "",
    name_ar: "",
    slug: "",
    portion_size: "",
    price: "",
    symbol: "",
    calories: "",
    status: "active",
  });

  useEffect(() => {
    if (cookieBoxSizeData) {
      setFormData({
        name_en: cookieBoxSizeData.name_en || "",
        name_ar: cookieBoxSizeData.name_ar || "",
        slug: cookieBoxSizeData.slug || "",
        price: cookieBoxSizeData.price || "",
        portion_size: cookieBoxSizeData.portion_size
          ? String(parsePortionPieces(cookieBoxSizeData.portion_size) ?? "")
          : "",
        symbol: cookieBoxSizeData.symbol || "",
        calories: cookieBoxSizeData.calories || "",
        status: cookieBoxSizeData.status || "active",
      });
      const typeIds = cookieBoxSizeData.cookieBoxTypes
        ? cookieBoxSizeData.cookieBoxTypes.map((t) => t.id)
        : cookieBoxSizeData.type
          ? [cookieBoxSizeData.type.id]
          : [];
      setSelectedTypeIds(typeIds);
    }
  }, [cookieBoxSizeData]);

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.name_en) errors.push("Name English is required.");
    if (!formData.name_ar) errors.push("Name Arabic is required.");
    if (selectedTypeIds.length === 0) errors.push("At least one cookie type is required.");
    if (!formData.slug) errors.push("Slug is required.");
    if (!formData.price) errors.push("Price is required.");
    const portion = parsePortionPieces(formData.portion_size);
    if (!portion || portion < 1) {
      errors.push("Portion size must be a positive whole number.");
    }

    return errors;
  };

  const handlePortionSizeChange = (e) => {
    const raw = e.target.value;
    if (raw === "") {
      setFormData({ ...formData, portion_size: "" });
      return;
    }
    const parsed = parseInt(raw, 10);
    if (!Number.isNaN(parsed) && parsed >= 1) {
      setFormData({ ...formData, portion_size: String(parsed) });
    }
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


      if (cookieBoxSizeData) {
        const res = await axios.put(
          updateCookieBoxSizeByIdRoute(cookieBoxSizeData.id),
          payload
        );

        if (res.status === 200) {
          toast.success("Cookie Box Size updated successfully!", {
            autoClose: 1000,
          });

          if (onUpdateCookieBoxSize) {
            onUpdateCookieBoxSize(res.data);
          }

          closePopup();
        }
      }

      else {
        const res = await axios.post(createCookieBoxSizeRoute, payload);

        if (res.status === 201 || res.status === 200) {
          toast.success("Cookie Box Size added successfully!", {
            autoClose: 1000,
          });

          if (onAddCookieBoxSize) {
            onAddCookieBoxSize(res.data);
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

  const fetchCookieBoxTypes = async () => {
    try {
      const response = await axios.get(getCookieBoxTypesRoute);
      setCookiesBoxTypes(response?.data?.data);
    } catch (error) {
      console.error("Error fetching cookie box types", error);
    }
  };

  useEffect(() => {
    if(!token) return;
    fetchCookieBoxTypes();
  }, [token]);

  return (
    <form className="component-form popup-form-grid" onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Name English</label>
        <input
          name="name_en"
          type="text"
          className="form-control textarea-hover-dark"
          value={formData.name_en}
          onChange={(e)=>setFormData({...formData,name_en:e.target.value})}
        />
      </div>

      <div className="form-group mt-3">
        <label className="form-label">Name Arabic</label>
        <input
         name="name_ar"
         type="text" className="form-control textarea-hover-dark"
         value={formData.name_ar}
         onChange={(e)=>setFormData({...formData,name_ar:e.target.value})}/>
      </div>

      <CheckboxMultiSelect
        label="Cookie Types"
        items={cookiesBoxTypes}
        selectedIds={selectedTypeIds}
        onChange={setSelectedTypeIds}
        idPrefix="box-size-type"
        emptyMessage="No cookie types found."
      />

      <div className="row mt-3">

      <div className="form-group col-md-6">
        <label className="form-label">Slug</label>
        <input
          name="slug" type="text"
          className="form-control textarea-hover-dark"
          value={formData.slug}
          onChange={(e)=>setFormData({...formData,slug:e.target.value})}
        />
      </div>

      <div className="form-group col-md-6">
        <label className="form-label">Price</label>
        <input
          name="price"
          type="number"
          className="form-control textarea-hover-dark"
          value={formData.price}
          onChange={(e)=>setFormData({...formData,price:e.target.value})}
        />
      </div>
      </div>

      <div className="row mt-3">
      <div className="form-group col-md-6">
        <label className="form-label">Portion size</label>
        <div className="d-flex align-items-center gap-2">
          <input
            name="portion_size"
            type="number"
            min={1}
            step={1}
            className="form-control textarea-hover-dark dashboard-number-input-sm"
            value={formData.portion_size}
            onChange={handlePortionSizeChange}
          />
          <span className="text-secondary mb-0">Pieces</span>
        </div>
      </div>

      <div className="form-group col-md-6">
        <label className="form-label">Symbol</label>
        <input
          name="symbol"
          type="text"
          className="form-control textarea-hover-dark"
          value={formData.symbol}
          onChange={(e)=>setFormData({...formData,symbol:e.target.value})}
        />
      </div>
      </div>

      <div className="form-group mt-3">
        <label className="form-label">Calories</label>
        <input
          name="calories"
          type="number"
          className="form-control textarea-hover-dark"
          value={formData.calories}
          onChange={(e)=>setFormData({...formData,calories:e.target.value})}
        />
      </div>


      <div className="col-md-12 mt-3">
        <StatusToggle
          id="cookie-box-size-status"
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
          inputId="cookieBoxSizeFileInput"
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

export default AddCookieBoxSize;
