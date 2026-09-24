"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  createQrCodeRoute,
  getProductsRoute,
  getQrCodeParentsRoute,
  updateQrCodeByIdRoute,
} from "@/utils/apiRoutes";
import { toast } from "react-toastify";
import axios from "axios";
import FileUploadBox from "@/components/dashboard/shared/FileUploadBox";
import StatusToggle from "@/components/dashboard/shared/StatusToggle";
import ChipMultiSelect from "@/components/dashboard/shared/ChipMultiSelect";
import marbleUploadUrl from "@/utils/marbleUploadUrl";

const EMPTY = {
  brand: "",
  sku: "",
  parent_id: "0",
  latitude: "",
  longitude: "",
  product_ids: [],
  status: "active",
};

function parseProductIds(value) {
  if (Array.isArray(value)) {
    return value
      .map((id) => Number(id))
      .filter((id) => Number.isInteger(id) && id > 0);
  }
  return String(value || "")
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((id) => Number.isInteger(id) && id > 0);
}

function productLabel(product) {
  const name = product.name_en || product.name_ar || product.title || "Product";
  return `#${product.id} — ${name}`;
}

function AddQrCode({ closePopup, rowData = null, onAdd, onUpdate }) {
  const [form, setForm] = useState(EMPTY);
  const [parents, setParents] = useState([]);
  const [products, setProducts] = useState([]);
  const [fileEn, setFileEn] = useState(null);
  const [fileAr, setFileAr] = useState(null);
  const isEdit = Boolean(rowData?.id);

  const productOptions = useMemo(
    () =>
      products.map((product) => ({
        id: product.id,
        label: productLabel(product),
        image:
          marbleUploadUrl(product.image_url) ||
          marbleUploadUrl(product.thumbnail_url) ||
          "/assets/images/Cake-type.svg",
        searchText: [product.name_en, product.name_ar, product.sku, product.slug]
          .filter(Boolean)
          .join(" "),
      })),
    [products],
  );

  useEffect(() => {
    const loadParents = async () => {
      try {
        const params = rowData?.id ? { exclude_id: rowData.id } : {};
        const res = await axios.get(getQrCodeParentsRoute, { params });
        setParents(res.data?.data || []);
      } catch {
        setParents([]);
      }
    };
    const loadProducts = async () => {
      try {
        const res = await axios.get(getProductsRoute, {
          params: { limit: 500, sortField: "id", sortOrder: "ASC" },
        });
        setProducts(res.data?.data || []);
      } catch {
        setProducts([]);
      }
    };
    loadParents();
    loadProducts();
  }, [rowData?.id]);

  useEffect(() => {
    if (rowData) {
      setForm({
        brand: rowData.brand || "",
        sku: rowData.sku || "",
        parent_id: String(rowData.parent_id ?? 0),
        latitude: rowData.latitude != null ? String(rowData.latitude) : "",
        longitude: rowData.longitude != null ? String(rowData.longitude) : "",
        product_ids: parseProductIds(rowData.product_ids),
        status: rowData.status === "inactive" ? "inactive" : "active",
      });
    } else {
      setForm(EMPTY);
    }
    setFileEn(null);
    setFileAr(null);
  }, [rowData]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.brand.trim()) {
      toast.error("Brand is required.");
      return;
    }
    if (form.latitude === "" || form.longitude === "") {
      toast.error("Latitude and longitude are required.");
      return;
    }

    const fd = new FormData();
    fd.append("brand", form.brand.trim());
    fd.append("parent_id", form.parent_id || "0");
    fd.append("latitude", form.latitude);
    fd.append("longitude", form.longitude);
    fd.append("product_ids", form.product_ids.join(","));
    fd.append("status", form.status);
    if (!isEdit && form.sku.trim()) fd.append("sku", form.sku.trim());
    if (fileEn) fd.append("banner_en", fileEn);
    if (fileAr) fd.append("banner_ar", fileAr);

    try {
      if (isEdit) {
        const res = await axios.put(updateQrCodeByIdRoute(rowData.id), fd);
        const row = res.data?.data ?? res.data;
        toast.success("QR code updated!", {
          autoClose: 1000,
          onClose: closePopup,
        });
        onUpdate(row);
      } else {
        const res = await axios.post(createQrCodeRoute, fd);
        const row = res.data?.data ?? res.data;
        toast.success("QR code created!", {
          autoClose: 1000,
          onClose: closePopup,
        });
        onAdd(row);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.errors?.[0] ||
          "Something went wrong!",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">
            Brand
          </label>
          <input
            type="text"
            className="form-control fs-14"
            value={form.brand}
            onChange={(e) => setField("brand", e.target.value)}
            required
          />
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">
            SKU {isEdit ? "" : "(optional)"}
          </label>
          <input
            type="text"
            className="form-control fs-14"
            value={form.sku}
            onChange={(e) => setField("sku", e.target.value)}
            disabled={isEdit}
            placeholder={isEdit ? "" : "Auto-generated if blank"}
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">
          Parent Brand
        </label>
        <select
          className="form-select fs-14"
          value={form.parent_id}
          onChange={(e) => setField("parent_id", e.target.value)}
        >
          <option value="0">None</option>
          {parents.map((p) => (
            <option key={p.id} value={p.id}>
              {p.brand} ({p.sku})
            </option>
          ))}
        </select>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">
            Latitude
          </label>
          <input
            type="number"
            step="any"
            className="form-control fs-14"
            value={form.latitude}
            onChange={(e) => setField("latitude", e.target.value)}
            required
          />
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">
            Longitude
          </label>
          <input
            type="number"
            step="any"
            className="form-control fs-14"
            value={form.longitude}
            onChange={(e) => setField("longitude", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="mb-3">
        <ChipMultiSelect
          label="Products"
          options={productOptions}
          selectedIds={form.product_ids}
          onChange={(ids) => setField("product_ids", ids)}
          placeholder="Search products by name, SKU, or ID…"
          showImages
        />
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">
            Banner (EN)
          </label>
          <FileUploadBox
            inputId="qrBannerEn"
            name="banner_en"
            accept=".jpg,.jpeg,.png,.gif,image/*"
            selectedFiles={fileEn ? [fileEn] : []}
            onChange={(e) => setFileEn(e.target.files?.[0] || null)}
            multiple={false}
          />
          {rowData?.banner_en_url ? (
            <p className="mt-2 mb-0 small text-secondary">
              Current:{" "}
              <img
                src={rowData.banner_en_url}
                alt="EN"
                className="dashboard-img-max-120 align-middle"
              />
            </p>
          ) : null}
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">
            Banner (AR)
          </label>
          <FileUploadBox
            inputId="qrBannerAr"
            name="banner_ar"
            accept=".jpg,.jpeg,.png,.gif,image/*"
            selectedFiles={fileAr ? [fileAr] : []}
            onChange={(e) => setFileAr(e.target.files?.[0] || null)}
            multiple={false}
          />
          {rowData?.banner_ar_url ? (
            <p className="mt-2 mb-0 small text-secondary">
              Current:{" "}
              <img
                src={rowData.banner_ar_url}
                alt="AR"
                className="dashboard-img-max-120 align-middle"
              />
            </p>
          ) : null}
        </div>
      </div>

      <div className="mb-3">
        <StatusToggle
          id="qr-status"
          checked={form.status === "active"}
          onChange={(checked) =>
            setField("status", checked ? "active" : "inactive")
          }
        />
      </div>

      <div className="d-flex justify-content-between mt-4">
        <button type="submit" className="btn-orange text-white fs-16">
          Save
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary fs-16"
          onClick={closePopup}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default AddQrCode;
