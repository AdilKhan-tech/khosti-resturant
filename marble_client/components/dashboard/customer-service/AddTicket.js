"use client";

import React, { useEffect, useState } from "react";
import {
  createFeedbackRoute,
  getBranchesRoute,
  getCsSubjectsRoute,
  getCsTagsRoute,
} from "@/utils/apiRoutes";
import { toast } from "react-toastify";
import axios from "axios";

const REVIEW_TYPES = [
  "Order",
  "Inquiry",
  "Complaint",
  "Marketing",
  "Van",
  "Suggestions",
  "Review",
];

const SOURCES = [
  "Call Center",
  "WhatsApp",
  "Whatsup",
  "Instagram",
  "TikTok",
  "Google Reviews",
  "Website",
];

const EMPTY = {
  customer_name: "",
  phone: "",
  city: "",
  branch: "",
  source: "Call Center",
  review_type: "Inquiry",
  subject_id: "",
  tag_id: "",
  comments: "",
  order_number: "",
  agent_name: "",
};

function AddTicket({ closePopup, onAdd }) {
  const [form, setForm] = useState(EMPTY);
  const [subjects, setSubjects] = useState([]);
  const [tags, setTags] = useState([]);
  const [branches, setBranches] = useState([]);
  const [attachment, setAttachment] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [subjectsRes, branchesRes] = await Promise.all([
          axios.get(getCsSubjectsRoute),
          axios.get(getBranchesRoute, { params: { page: 1, limit: 200 } }),
        ]);
        setSubjects(
          (subjectsRes.data?.data || []).filter((s) => s.status !== false),
        );
        setBranches(branchesRes.data?.data || []);
      } catch {
        setSubjects([]);
        setBranches([]);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!form.subject_id) {
      setTags([]);
      return;
    }
    const loadTags = async () => {
      try {
        const res = await axios.get(getCsTagsRoute, {
          params: { subject_id: form.subject_id },
        });
        setTags((res.data?.data || []).filter((t) => t.status !== false));
      } catch {
        setTags([]);
      }
    };
    loadTags();
  }, [form.subject_id]);

  const setField = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "subject_id") next.tag_id = "";
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !form.customer_name.trim() ||
      !form.phone.trim() ||
      !form.city.trim() ||
      !form.branch.trim() ||
      !form.comments.trim()
    ) {
      toast.error("Please fill all required fields.");
      return;
    }
    if (!form.subject_id || !form.tag_id) {
      toast.error("Subject and tag are required.");
      return;
    }

    const payload = new FormData();
    payload.append("customer_name", form.customer_name.trim());
    payload.append("phone", form.phone.trim());
    payload.append("city", form.city.trim());
    payload.append("branch", form.branch.trim());
    payload.append("source", form.source);
    payload.append("review_type", form.review_type);
    payload.append("subject_id", String(form.subject_id));
    payload.append("tag_id", String(form.tag_id));
    payload.append("comments", form.comments.trim());
    payload.append("entry_type", "agent");
    if (form.order_number.trim()) {
      payload.append("order_number", form.order_number.trim());
    }
    if (form.agent_name.trim()) {
      payload.append("agent_name", form.agent_name.trim());
    }
    if (attachment) {
      payload.append("attachment", attachment);
    }

    setSaving(true);
    try {
      const res = await axios.post(createFeedbackRoute, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const row = res.data?.data ?? res.data;
      toast.success("Ticket created!", { autoClose: 1000, onClose: closePopup });
      onAdd?.(row);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.errors?.[0] ||
          "Something went wrong!",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Customer name</label>
          <input
            type="text"
            className="form-control fs-14"
            value={form.customer_name}
            onChange={(e) => setField("customer_name", e.target.value)}
            required
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Phone</label>
          <input
            type="text"
            className="form-control fs-14"
            value={form.phone}
            onChange={(e) => setField("phone", e.target.value)}
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">City</label>
          <input
            type="text"
            className="form-control fs-14"
            value={form.city}
            onChange={(e) => setField("city", e.target.value)}
            required
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Branch</label>
          <select
            className="form-select fs-14"
            value={form.branch}
            onChange={(e) => setField("branch", e.target.value)}
            required
          >
            <option value="">Select branch</option>
            {branches.map((b) => {
              const label = b.name_en || b.name;
              return (
                <option key={b.id} value={label}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">Source</label>
          <select
            className="form-select fs-14"
            value={form.source}
            onChange={(e) => setField("source", e.target.value)}
          >
            {SOURCES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">Review type</label>
          <select
            className="form-select fs-14"
            value={form.review_type}
            onChange={(e) => setField("review_type", e.target.value)}
          >
            {REVIEW_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">Subject</label>
          <select
            className="form-select fs-14"
            value={form.subject_id}
            onChange={(e) => setField("subject_id", e.target.value)}
            required
          >
            <option value="">Select subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">Tag</label>
          <select
            className="form-select fs-14"
            value={form.tag_id}
            onChange={(e) => setField("tag_id", e.target.value)}
            required
            disabled={!form.subject_id}
          >
            <option value="">Select tag</option>
            {tags.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">Order number (optional)</label>
          <input
            type="text"
            className="form-control fs-14"
            value={form.order_number}
            onChange={(e) => setField("order_number", e.target.value)}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Agent name (optional)</label>
          <input
            type="text"
            className="form-control fs-14"
            value={form.agent_name}
            onChange={(e) => setField("agent_name", e.target.value)}
          />
        </div>

        <div className="col-12">
          <label className="form-label">Comments</label>
          <textarea
            className="form-control fs-14"
            rows={4}
            value={form.comments}
            onChange={(e) => setField("comments", e.target.value)}
            required
          />
        </div>

        <div className="col-12">
          <label className="form-label">Attachment (optional)</label>
          <input
            type="file"
            className="form-control fs-14"
            accept="image/*"
            onChange={(e) => setAttachment(e.target.files?.[0] || null)}
          />
        </div>
      </div>

      <hr className="mt-4 mb-3" />
      <div className="d-flex align-items-center justify-content-between">
        <button
          type="submit"
          disabled={saving}
          className="form-submit-btn form-submit-btn-size d-inline-flex align-items-center justify-content-center gap-2 border-0 text-white fs-16 fw-medium rounded-3"
        >
          <i className="bi bi-send-fill" aria-hidden="true"></i> Create
        </button>
        <button
          type="button"
          className="form-cancel-btn form-cancel-btn-size d-inline-flex align-items-center gap-2 bg-white border rounded-3 text-muted fs-14 px-3"
          onClick={closePopup}
        >
          <i className="bi bi-x-circle" aria-hidden="true"></i> Cancel
        </button>
      </div>
    </form>
  );
}

export default AddTicket;
