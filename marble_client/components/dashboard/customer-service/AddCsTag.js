"use client";

import React, { useEffect, useState } from "react";
import {
  createCsTagRoute,
  getCsSubjectsRoute,
  updateCsTagByIdRoute,
} from "@/utils/apiRoutes";
import StatusToggle from "@/components/dashboard/shared/StatusToggle";
import { toast } from "react-toastify";
import axios from "axios";

const EMPTY = { name: "", subject_id: "", status: true };

function AddCsTag({ closePopup, rowData = null, onAdd, onUpdate, subjects: subjectsProp }) {
  const [form, setForm] = useState(EMPTY);
  const [subjects, setSubjects] = useState(subjectsProp || []);
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(rowData?.id);

  useEffect(() => {
    if (Array.isArray(subjectsProp) && subjectsProp.length) {
      setSubjects(subjectsProp);
      return;
    }
    const load = async () => {
      try {
        const res = await axios.get(getCsSubjectsRoute);
        setSubjects(res.data?.data || []);
      } catch {
        setSubjects([]);
      }
    };
    load();
  }, [subjectsProp]);

  useEffect(() => {
    if (rowData) {
      setForm({
        name: rowData.name || "",
        subject_id: rowData.subject_id ? String(rowData.subject_id) : "",
        status: rowData.status !== false,
      });
    } else {
      setForm(EMPTY);
    }
  }, [rowData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Tag name is required.");
      return;
    }
    if (!form.subject_id) {
      toast.error("Subject is required.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      subject_id: Number(form.subject_id),
      status: Boolean(form.status),
    };

    setSaving(true);
    try {
      if (isEdit) {
        const res = await axios.put(updateCsTagByIdRoute(rowData.id), payload);
        const row = res.data?.data ?? res.data;
        toast.success("Tag updated!", { autoClose: 1000, onClose: closePopup });
        onUpdate?.(row);
      } else {
        const res = await axios.post(createCsTagRoute, payload);
        const row = res.data?.data ?? res.data;
        toast.success("Tag created!", { autoClose: 1000, onClose: closePopup });
        onAdd?.(row);
      }
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
      <div className="mb-3">
        <label className="form-label">Subject</label>
        <select
          className="form-select fs-14"
          value={form.subject_id}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, subject_id: e.target.value }))
          }
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

      <div className="mb-3">
        <label className="form-label">Name</label>
        <input
          type="text"
          className="form-control fs-14"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>

      <div className="mb-3">
        <StatusToggle
          id="cs-tag-status"
          checked={Boolean(form.status)}
          onChange={(checked) => setForm((prev) => ({ ...prev, status: checked }))}
        />
      </div>

      <hr className="mt-4 mb-3" />
      <div className="d-flex align-items-center justify-content-between">
        <button
          type="submit"
          disabled={saving}
          className="form-submit-btn form-submit-btn-size d-inline-flex align-items-center justify-content-center gap-2 border-0 text-white fs-16 fw-medium rounded-3"
        >
          <i className="bi bi-send-fill" aria-hidden="true"></i> Save
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

export default AddCsTag;
