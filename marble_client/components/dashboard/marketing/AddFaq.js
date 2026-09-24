"use client";

import React, { useEffect, useState } from "react";
import {
  createFaqRoute,
  updateFaqByIdRoute,
} from "@/utils/apiRoutes";
import { toast } from "react-toastify";
import axios from "axios";
import StatusToggle from "@/components/dashboard/shared/StatusToggle";

const EMPTY = {
  question_en: "",
  question_ar: "",
  answer_en: "",
  answer_ar: "",
  sort_order: "0",
  status: "active",
};

function AddFaq({ closePopup, pageData = null, onAdd, onUpdate }) {
  const [form, setForm] = useState(EMPTY);
  const isEdit = Boolean(pageData?.id);

  useEffect(() => {
    if (pageData) {
      setForm({
        question_en: pageData.question_en || "",
        question_ar: pageData.question_ar || "",
        answer_en: pageData.answer_en || "",
        answer_ar: pageData.answer_ar || "",
        sort_order: String(pageData.sort_order ?? 0),
        status: pageData.status === "inactive" ? "inactive" : "active",
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
    if (
      !form.question_en.trim() ||
      !form.question_ar.trim() ||
      !form.answer_en.trim() ||
      !form.answer_ar.trim()
    ) {
      toast.error("English and Arabic question and answer are required.");
      return;
    }

    const payload = {
      question_en: form.question_en.trim(),
      question_ar: form.question_ar.trim(),
      answer_en: form.answer_en.trim(),
      answer_ar: form.answer_ar.trim(),
      sort_order: Number(form.sort_order) || 0,
      status: form.status,
    };

    try {
      if (isEdit) {
        const res = await axios.put(updateFaqByIdRoute(pageData.id), payload);
        const row = res.data?.data ?? res.data;
        toast.success("FAQ updated!", {
          autoClose: 1000,
          onClose: closePopup,
        });
        onUpdate(row);
      } else {
        const res = await axios.post(createFaqRoute, payload);
        const row = res.data?.data ?? res.data;
        toast.success("FAQ created!", {
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
      <p className="fs-16 fw-medium fnt-color mb-2">English</p>
      <div className="mb-3">
        <label className="form-label">
          Question
        </label>
        <input
          type="text"
          className="form-control fs-14"
          value={form.question_en}
          onChange={(e) => setField("question_en", e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">
          Answer
        </label>
        <textarea
          className="form-control fs-14"
          rows={5}
          value={form.answer_en}
          onChange={(e) => setField("answer_en", e.target.value)}
          required
        />
      </div>

      <p className="fs-16 fw-medium fnt-color mt-4 mb-2">Arabic</p>
      <div className="mb-3">
        <label className="form-label">
          Question (AR)
        </label>
        <input
          type="text"
          className="form-control fs-14"
          dir="rtl"
          value={form.question_ar}
          onChange={(e) => setField("question_ar", e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">
          Answer (AR)
        </label>
        <textarea
          className="form-control fs-14"
          dir="rtl"
          rows={5}
          value={form.answer_ar}
          onChange={(e) => setField("answer_ar", e.target.value)}
          required
        />
      </div>

      <div className="mb-3 mt-3">
        <label className="form-label">
          Sort order
        </label>
        <input
          type="number"
          min={0}
          className="form-control fs-14"
          value={form.sort_order}
          onChange={(e) => setField("sort_order", e.target.value)}
        />
      </div>

      <div className="mb-3">
        <StatusToggle
          id="faq-status"
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

export default AddFaq;
