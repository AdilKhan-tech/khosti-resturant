"use client";

import React, { useEffect, useState } from "react";
import {
  createFeedbackQrRoute,
  getBranchesRoute,
  updateFeedbackQrByIdRoute,
} from "@/utils/apiRoutes";
import StatusToggle from "@/components/dashboard/shared/StatusToggle";
import { toast } from "react-toastify";
import axios from "axios";

const EMPTY = {
  qr_name: "",
  slug: "",
  branch: "",
  branch_id: "",
  status: true,
};

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function AddFeedbackQr({ closePopup, rowData = null, onAdd, onUpdate }) {
  const [form, setForm] = useState(EMPTY);
  const [branches, setBranches] = useState([]);
  const [saving, setSaving] = useState(false);
  const [slugManual, setSlugManual] = useState(false);
  const isEdit = Boolean(rowData?.id);

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const res = await axios.get(getBranchesRoute, {
          params: { page: 1, limit: 200 },
        });
        setBranches(res.data?.data || []);
      } catch {
        setBranches([]);
      }
    };
    loadBranches();
  }, []);

  useEffect(() => {
    if (rowData) {
      setForm({
        qr_name: rowData.qr_name || "",
        slug: rowData.slug || "",
        branch: rowData.branch || "",
        branch_id: rowData.branch_id != null ? String(rowData.branch_id) : "",
        status: rowData.status !== false,
      });
      setSlugManual(true);
    } else {
      setForm(EMPTY);
      setSlugManual(false);
    }
  }, [rowData]);

  const setField = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "qr_name" && !slugManual && !isEdit) {
        next.slug = slugify(value);
      }
      return next;
    });
  };

  const handleBranchSelect = (branchId) => {
    const branch = branches.find((b) => String(b.id) === String(branchId));
    setForm((prev) => ({
      ...prev,
      branch_id: branchId,
      branch: branch?.name_en || branch?.name || prev.branch,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.qr_name.trim() || !form.slug.trim() || !form.branch.trim()) {
      toast.error("Name, slug, and branch are required.");
      return;
    }

    const payload = {
      qr_name: form.qr_name.trim(),
      slug: form.slug.trim(),
      branch: form.branch.trim(),
      status: Boolean(form.status),
    };
    if (form.branch_id) {
      payload.branch_id = Number(form.branch_id);
    }

    setSaving(true);
    try {
      if (isEdit) {
        const res = await axios.put(
          updateFeedbackQrByIdRoute(rowData.id),
          payload,
        );
        const row = res.data?.data ?? res.data;
        toast.success("Feedback QR updated!", {
          autoClose: 1000,
          onClose: closePopup,
        });
        onUpdate?.(row);
      } else {
        const res = await axios.post(createFeedbackQrRoute, payload);
        const row = res.data?.data ?? res.data;
        toast.success("Feedback QR created!", {
          autoClose: 1000,
          onClose: closePopup,
        });
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
        <label className="form-label">QR Name</label>
        <input
          type="text"
          className="form-control fs-14"
          value={form.qr_name}
          onChange={(e) => setField("qr_name", e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Slug</label>
        <input
          type="text"
          className="form-control fs-14"
          value={form.slug}
          onChange={(e) => {
            setSlugManual(true);
            setField("slug", e.target.value);
          }}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Branch (catalog)</label>
        <select
          className="form-select fs-14"
          value={form.branch_id}
          onChange={(e) => handleBranchSelect(e.target.value)}
        >
          <option value="">Select branch (optional)</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name_en || b.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Branch label</label>
        <input
          type="text"
          className="form-control fs-14"
          value={form.branch}
          onChange={(e) => setField("branch", e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <StatusToggle
          id="feedback-qr-status"
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

export default AddFeedbackQr;
