"use client";

import React, { useEffect, useState } from "react";
import Offcanvas from "react-bootstrap/Offcanvas";
import { ToastContainer, toast } from "react-toastify";
import { confirmDialog } from "@/components/dashboard/shared/ConfirmDialog";
import axios from "axios";
import useAxiosConfig from "@/hooks/useAxiosConfig";
import {
  bulkDeleteOurDesignsRoute,
  createOurDesignRoute,
  deleteOurDesignByIdRoute,
  downloadOurDesignsRoute,
  getOccasionsRoute,
  getOurDesignsRoute,
  sendOurDesignWhatsappRoute,
} from "@/utils/apiRoutes";

const CAKE_TYPES = [
  "Cookie Cake",
  "Cute Cake",
  "Ice Cream Cake",
  "Sponge Cake",
  "Cup Cake",
];

const EMPTY_FORM = {
  title: "",
  occasion_id: "",
  cake_type: "Sponge Cake",
};

function OurDesignsPage() {
  const { token } = useAxiosConfig();
  const [rows, setRows] = useState([]);
  const [occasions, setOccasions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [filters, setFilters] = useState({ occasion_id: "", cake_type: "" });
  const [showCreate, setShowCreate] = useState(false);
  const [showWhatsapp, setShowWhatsapp] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [waPhone, setWaPhone] = useState("");
  const [waMessage, setWaMessage] = useState("");
  const [sendingWa, setSendingWa] = useState(false);

  const fetchRows = async () => {
    if (!token) return;
    try {
      const params = {};
      if (filters.occasion_id) params.occasion_id = filters.occasion_id;
      if (filters.cake_type) params.cake_type = filters.cake_type;
      const response = await axios.get(getOurDesignsRoute, { params });
      setRows(response.data?.data || []);
      setSelected([]);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load designs.",
      );
    }
  };

  useEffect(() => {
    if (!token) return;
    axios
      .get(getOccasionsRoute, { params: { page: 1, limit: 200 } })
      .then((res) => setOccasions(res.data?.data || res.data || []))
      .catch(() => setOccasions([]));
  }, [token]);

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, filters.occasion_id, filters.cake_type]);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === rows.length) setSelected([]);
    else setSelected(rows.map((r) => r.id));
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setImageFile(null);
    setShowCreate(true);
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!imageFile) {
      toast.error("Please upload a design image.");
      return;
    }
    setSaving(true);
    try {
      const body = new FormData();
      if (form.title.trim()) body.append("title", form.title.trim());
      if (form.occasion_id) body.append("occasion_id", form.occasion_id);
      body.append("cake_type", form.cake_type);
      body.append("image", imageFile);
      await axios.post(createOurDesignRoute, body);
      toast.success("Design saved!", { autoClose: 1000 });
      setShowCreate(false);
      fetchRows();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to save design.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!(await confirmDialog({ message: "Delete this design? This cannot be undone." }))) return;
    try {
      await axios.delete(deleteOurDesignByIdRoute(id));
      toast.success("Design deleted!", { autoClose: 1000 });
      fetchRows();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to delete design.",
      );
    }
  };

  const handleBulkDelete = async () => {
    if (!selected.length) {
      toast.error("Select at least one design.");
      return;
    }
    if (
      !(await confirmDialog({
        message: `Delete ${selected.length} selected design(s)? This cannot be undone.`,
      }))
    ) {
      return;
    }
    try {
      await axios.post(bulkDeleteOurDesignsRoute, { ids: selected });
      toast.success("Selected designs deleted!", { autoClose: 1000 });
      fetchRows();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to delete designs.",
      );
    }
  };

  const handleDownload = async () => {
    if (!selected.length) {
      toast.error("Select at least one design.");
      return;
    }
    try {
      const response = await axios.post(
        downloadOurDesignsRoute,
        { ids: selected },
        { responseType: "blob" },
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `designs_${new Date().toISOString().slice(0, 10)}.zip`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to download designs.",
      );
    }
  };

  const handleSendWhatsapp = async (event) => {
    event.preventDefault();
    if (!selected.length) {
      toast.error("Select at least one design.");
      return;
    }
    setSendingWa(true);
    try {
      await axios.post(sendOurDesignWhatsappRoute, {
        ids: selected,
        phone: waPhone,
        message: waMessage,
      });
      toast.success("WhatsApp message sent!", { autoClose: 1000 });
      setShowWhatsapp(false);
      setWaPhone("");
      setWaMessage("");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to send WhatsApp.",
      );
    } finally {
      setSendingWa(false);
    }
  };

  return (
    <>
      <section className="mt-3">
        <div className="d-flex justify-content-between mb-3 align-items-center flex-wrap gap-2">
          <p className="pagetitle mb-0 fnt-color">Our Designs</p>
          <button
            type="button"
            className="btn-orange text-white fs-16 text-nowrap w-auto px-3"
            onClick={openCreate}
          >
            <i className="bi bi-plus-circle me-2"></i>Add New Design
          </button>
        </div>

        <form
          className="mb-3"
          onSubmit={(e) => {
            e.preventDefault();
            fetchRows();
          }}
        >
          <div className="row row-cols-2 row-cols-md-4 g-2 align-items-end">
            <div className="col">
              <label className="form-label">Occasion</label>
              <select
                className="form-select"
                value={filters.occasion_id}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, occasion_id: e.target.value }))
                }
              >
                <option value="">All Occasions</option>
                {occasions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name_en || o.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col">
              <label className="form-label">Cake type</label>
              <select
                className="form-select"
                value={filters.cake_type}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, cake_type: e.target.value }))
                }
              >
                <option value="">All Types</option>
                {CAKE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="col">
              <button
                type="button"
                className="form-cancel-btn bg-white border rounded-3 text-muted fs-14 px-3 py-2"
                onClick={() => setFilters({ occasion_id: "", cake_type: "" })}
              >
                Reset
              </button>
            </div>
          </div>
        </form>

        <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
          <button
            type="button"
            className="form-cancel-btn bg-white border rounded-3 text-muted fs-14 px-3 py-2"
            onClick={toggleSelectAll}
          >
            {selected.length === rows.length && rows.length
              ? "Clear selection"
              : "Select all"}
          </button>
          <button
            type="button"
            className="form-cancel-btn bg-white border rounded-3 text-muted fs-14 px-3 py-2"
            onClick={() => setShowWhatsapp(true)}
            disabled={!selected.length}
          >
            Send via WhatsApp
          </button>
          <button
            type="button"
            className="form-cancel-btn bg-white border rounded-3 text-muted fs-14 px-3 py-2"
            onClick={handleDownload}
            disabled={!selected.length}
          >
            Download selected
          </button>
          <button
            type="button"
            className="form-cancel-btn bg-white border rounded-3 text-danger fs-14 px-3 py-2"
            onClick={handleBulkDelete}
            disabled={!selected.length}
          >
            Delete selected
          </button>
        </div>

        {!rows.length ? (
          <p className="text-secondary">No designs found.</p>
        ) : (
          <div className="row g-3">
            {rows.map((row) => (
              <div className="col-6 col-md-4 col-xl-3" key={row.id}>
                <div className="card product-form-card h-100">
                  <div className="card-body p-3">
                    <div className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={selected.includes(row.id)}
                        onChange={() => toggleSelect(row.id)}
                        id={`design-${row.id}`}
                      />
                      <label
                        className="form-check-label small"
                        htmlFor={`design-${row.id}`}
                      >
                        Select
                      </label>
                    </div>
                    <div
                      className="bg-light rounded-2 d-flex align-items-center justify-content-center mb-2"
                      style={{ height: 140 }}
                    >
                      {row.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={row.image_url}
                          alt={row.title || "Design"}
                          style={{
                            maxHeight: 140,
                            maxWidth: "100%",
                            objectFit: "contain",
                          }}
                        />
                      ) : (
                        <span className="text-secondary small">No image</span>
                      )}
                    </div>
                    <p className="fw-medium fnt-color mb-1 text-truncate">
                      {row.title || "Untitled"}
                    </p>
                    <p className="small text-secondary mb-1">
                      {row.occasion_name || "—"}
                    </p>
                    <p className="small text-secondary mb-3">{row.cake_type}</p>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(row.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Offcanvas
        show={showCreate}
        onHide={() => setShowCreate(false)}
        placement="end"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Add New Design</Offcanvas.Title>
        </Offcanvas.Header>
        <hr className="mt-0" />
        <Offcanvas.Body>
          <form onSubmit={handleCreate}>
            <div className="mb-3">
              <label className="form-label">Design title (optional)</label>
              <input
                type="text"
                className="form-control"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Occasion</label>
              <select
                className="form-select"
                value={form.occasion_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, occasion_id: e.target.value }))
                }
              >
                <option value="">— Select —</option>
                {occasions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name_en || o.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Cake type</label>
              <select
                className="form-select"
                value={form.cake_type}
                onChange={(e) =>
                  setForm((f) => ({ ...f, cake_type: e.target.value }))
                }
                required
              >
                {CAKE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Design image</label>
              <input
                type="file"
                className="form-control"
                accept="image/jpeg,image/png"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                required
              />
              <div className="form-text">JPG or PNG only.</div>
            </div>
            <hr className="mt-4 mb-3" />
            <div className="d-flex align-items-center justify-content-between">
              <button
                type="submit"
                disabled={saving}
                className="form-submit-btn form-submit-btn-size d-inline-flex align-items-center justify-content-center gap-2 border-0 text-white fs-16 fw-medium rounded-3"
              >
                {saving ? "Saving…" : "Save Design"}
              </button>
              <button
                type="button"
                className="form-cancel-btn form-cancel-btn-size d-inline-flex align-items-center gap-2 bg-white border rounded-3 text-muted fs-14 px-3"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </Offcanvas.Body>
      </Offcanvas>

      <Offcanvas
        show={showWhatsapp}
        onHide={() => setShowWhatsapp(false)}
        placement="end"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Send via WhatsApp</Offcanvas.Title>
        </Offcanvas.Header>
        <hr className="mt-0" />
        <Offcanvas.Body>
          <p className="text-secondary small mb-3">
            Sends the first selected design image to the customer (WordPress
            parity).
          </p>
          <form onSubmit={handleSendWhatsapp}>
            <div className="mb-3">
              <label className="form-label">WhatsApp number</label>
              <input
                type="text"
                className="form-control"
                value={waPhone}
                onChange={(e) => setWaPhone(e.target.value)}
                placeholder="9665…"
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Message</label>
              <textarea
                className="form-control"
                rows={3}
                value={waMessage}
                onChange={(e) => setWaMessage(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={sendingWa}
              className="form-submit-btn form-submit-btn-size d-inline-flex align-items-center justify-content-center gap-2 border-0 text-white fs-16 fw-medium rounded-3"
            >
              {sendingWa ? "Sending…" : "Send"}
            </button>
          </form>
        </Offcanvas.Body>
      </Offcanvas>

      <ToastContainer position="top-right" />
    </>
  );
}

export default OurDesignsPage;
