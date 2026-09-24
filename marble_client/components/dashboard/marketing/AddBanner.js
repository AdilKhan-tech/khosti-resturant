"use client";

import React, { useState, useEffect } from "react";
import { createBannerRoute, updateBannerByIdRoute } from "@/utils/apiRoutes";
import { toast } from "react-toastify";
import axios from "axios";
import FileUploadBox from "@/components/dashboard/shared/FileUploadBox";
import StatusToggle from "@/components/dashboard/shared/StatusToggle";

function AddBanner({
  closePopup,
  bannerData = null,
  onAddBanner,
  onUpdateBanner,
}) {
  const [slug, setSlug] = useState("");
  const [statusActive, setStatusActive] = useState(true);
  const [fileEn, setFileEn] = useState(null);
  const [fileAr, setFileAr] = useState(null);

  useEffect(() => {
    if (bannerData) {
      setSlug(bannerData.slug || "");
      setStatusActive(
        bannerData.status === 1 ||
          bannerData.status === true ||
          bannerData.status === "1"
      );
    } else {
      setSlug("");
      setStatusActive(true);
    }
    setFileEn(null);
    setFileAr(null);
  }, [bannerData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!slug.trim()) {
      toast.error("Slug is required.");
      return;
    }

    try {
      const fd = new FormData();
      fd.append("slug", slug.trim());
      if (bannerData) {
        fd.append("status", statusActive ? "1" : "0");
      }
      if (fileEn) fd.append("banner_en", fileEn);
      if (fileAr) fd.append("banner_ar", fileAr);

      if (bannerData) {
        const res = await axios.put(updateBannerByIdRoute(bannerData.id), fd);
        const row = res.data?.data ?? res.data;
        if (res.status === 200) {
          toast.success("Banner updated successfully!", {
            autoClose: 1000,
            onClose: closePopup,
          });
          onUpdateBanner(row);
        }
      } else {
        const res = await axios.post(createBannerRoute, fd);
        const row = res.data?.data ?? res.data;
        if (res.status === 200 || res.status === 201) {
          toast.success("Banner created successfully!", {
            autoClose: 1000,
            onClose: closePopup,
          });
          onAddBanner(row);
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

  return (
    <form className="mt-0 popup-form-grid" onSubmit={handleSubmit}>
      <div className="form-group popup-form-full">
        <label className="form-label">Slug</label>
        <input
          name="slug"
          type="text"
          className="form-control form-control-lg text-secondary"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
          placeholder="e.g. home, category-cakes"
        />
        <small className="text-muted d-block">
          Lowercase letters, numbers, and hyphens. Used to match this banner to a page or section.
        </small>
      </div>

      <div className="form-group">
        <label className="form-label">Banner (English)</label>
        <FileUploadBox
          inputId="bannerEnFileInput"
          name="banner_en"
          accept=".jpg,.jpeg,.png,.gif,image/*"
          selectedFiles={fileEn ? [fileEn] : []}
          onChange={(e) => setFileEn(e.target.files?.[0] || null)}
          multiple={false}
        />
        {bannerData?.banner_en_url && (
          <p className="mt-2 mb-0 small text-secondary">
            Current:{" "}
            <img
              src={bannerData.banner_en_url}
              alt="EN"
              className="dashboard-img-max-120 align-middle"
            />
          </p>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Banner (Arabic)</label>
        <FileUploadBox
          inputId="bannerArFileInput"
          name="banner_ar"
          accept=".jpg,.jpeg,.png,.gif,image/*"
          selectedFiles={fileAr ? [fileAr] : []}
          onChange={(e) => setFileAr(e.target.files?.[0] || null)}
          multiple={false}
        />
        {bannerData?.banner_ar_url && (
          <p className="mt-2 mb-0 small text-secondary">
            Current:{" "}
            <img
              src={bannerData.banner_ar_url}
              alt="AR"
              className="dashboard-img-max-120 align-middle"
            />
          </p>
        )}
      </div>

      {bannerData ? (
        <StatusToggle
          id="banner_status"
          className="popup-form-full"
          checked={statusActive}
          onChange={(checked) => setStatusActive(checked)}
        />
      ) : (
        <p className="small text-muted mb-0 popup-form-full">
          New banners are saved as <strong>active</strong> by default.
        </p>
      )}

      <hr className="mt-4 mb-3" />
      <div className="d-flex align-items-center justify-content-between">
        <button
          type="submit"
          className="form-submit-btn form-submit-btn-size d-inline-flex align-items-center justify-content-center gap-2 border-0 text-white fs-16 fw-medium rounded-3"
        >
          <i className="bi bi-send-fill" aria-hidden="true"></i>
          {bannerData ? "Update" : "Create"}
        </button>
        <button
          type="button"
          className="form-cancel-btn form-cancel-btn-size d-inline-flex align-items-center gap-2 bg-white border rounded-3 text-muted fs-14 px-3"
          onClick={closePopup}
        >
          <i className="bi bi-x-circle" aria-hidden="true"></i>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default AddBanner;
