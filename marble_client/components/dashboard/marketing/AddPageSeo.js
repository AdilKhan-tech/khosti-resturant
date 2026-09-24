"use client";

import React, { useEffect, useState } from "react";
import {
  createPageSeoRoute,
  updatePageSeoByIdRoute,
} from "@/utils/apiRoutes";
import { toast } from "react-toastify";
import axios from "axios";

const EMPTY = {
  slug: "",
  label: "",
  meta_title: "",
  meta_description: "",
  meta_keyword: "",
  meta_title_ar: "",
  meta_description_ar: "",
  meta_keyword_ar: "",
};

function AddPageSeo({
  closePopup,
  pageData = null,
  onAdd,
  onUpdate,
}) {
  const [form, setForm] = useState(EMPTY);
  const isEdit = Boolean(pageData?.id);

  useEffect(() => {
    if (pageData) {
      setForm({
        slug: pageData.slug || "",
        label: pageData.label || "",
        meta_title: pageData.meta_title || "",
        meta_description: pageData.meta_description || "",
        meta_keyword: pageData.meta_keyword || "",
        meta_title_ar: pageData.meta_title_ar || "",
        meta_description_ar: pageData.meta_description_ar || "",
        meta_keyword_ar: pageData.meta_keyword_ar || "",
      });
    } else {
      setForm(EMPTY);
    }
  }, [pageData]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.label.trim()) {
      toast.error("Label is required.");
      return;
    }
    if (!isEdit && !form.slug.trim()) {
      toast.error("Slug is required.");
      return;
    }

    const payload = {
      label: form.label.trim(),
      meta_title: form.meta_title.trim(),
      meta_description: form.meta_description.trim(),
      meta_keyword: form.meta_keyword.trim(),
      meta_title_ar: form.meta_title_ar.trim(),
      meta_description_ar: form.meta_description_ar.trim(),
      meta_keyword_ar: form.meta_keyword_ar.trim(),
    };

    try {
      if (isEdit) {
        const res = await axios.put(
          updatePageSeoByIdRoute(pageData.id),
          payload,
        );
        const row = res.data?.data ?? res.data;
        toast.success("Page SEO updated!", {
          autoClose: 1000,
          onClose: closePopup,
        });
        onUpdate(row);
      } else {
        const res = await axios.post(createPageSeoRoute, {
          ...payload,
          slug: form.slug.trim(),
        });
        const row = res.data?.data ?? res.data;
        toast.success("Page SEO created!", {
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
            Label
          </label>
          <input
            type="text"
            className="form-control fs-14"
            value={form.label}
            onChange={(e) => setField("label", e.target.value)}
            placeholder="Home"
            required
          />
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">
            Slug
          </label>
          <input
            type="text"
            className="form-control fs-14"
            value={form.slug}
            onChange={(e) => setField("slug", e.target.value)}
            placeholder="home"
            required={!isEdit}
            disabled={isEdit}
          />
          {isEdit ? (
            <p className="text-secondary small mb-0 mt-1">
              Slug cannot be changed after create.
            </p>
          ) : null}
        </div>
      </div>

      <p className="fs-16 fw-medium fnt-color mt-2 mb-2">English</p>
      <div className="mb-3">
        <label className="form-label">
          Meta Title
        </label>
        <input
          type="text"
          className="form-control fs-14"
          value={form.meta_title}
          onChange={(e) => setField("meta_title", e.target.value)}
          maxLength={255}
        />
      </div>
      <div className="mb-3">
        <label className="form-label">
          Meta Description
        </label>
        <textarea
          className="form-control fs-14"
          rows={3}
          value={form.meta_description}
          onChange={(e) => setField("meta_description", e.target.value)}
          maxLength={500}
        />
      </div>
      <div className="mb-3">
        <label className="form-label">
          Meta Keywords
        </label>
        <input
          type="text"
          className="form-control fs-14"
          value={form.meta_keyword}
          onChange={(e) => setField("meta_keyword", e.target.value)}
          maxLength={255}
          placeholder="cakes, ice cream, marble"
        />
      </div>

      <p className="fs-16 fw-medium fnt-color mt-4 mb-2">Arabic</p>
      <div className="mb-3">
        <label className="form-label">
          Meta Title (AR)
        </label>
        <input
          type="text"
          className="form-control fs-14"
          dir="rtl"
          value={form.meta_title_ar}
          onChange={(e) => setField("meta_title_ar", e.target.value)}
          maxLength={255}
        />
      </div>
      <div className="mb-3">
        <label className="form-label">
          Meta Description (AR)
        </label>
        <textarea
          className="form-control fs-14"
          dir="rtl"
          rows={3}
          value={form.meta_description_ar}
          onChange={(e) => setField("meta_description_ar", e.target.value)}
          maxLength={500}
        />
      </div>
      <div className="mb-3">
        <label className="form-label">
          Meta Keywords (AR)
        </label>
        <input
          type="text"
          className="form-control fs-14"
          dir="rtl"
          value={form.meta_keyword_ar}
          onChange={(e) => setField("meta_keyword_ar", e.target.value)}
          maxLength={255}
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

export default AddPageSeo;
