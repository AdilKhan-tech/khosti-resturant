"use client";

import React, { useEffect, useState } from "react";
import AddFaq from "@/components/dashboard/marketing/AddFaq";
import {
  getFaqsRoute,
  deleteFaqByIdRoute,
  updateFaqByIdRoute,
} from "@/utils/apiRoutes";
import StatusToggle from "@/components/dashboard/shared/StatusToggle";
import useAxiosConfig from "@/hooks/useAxiosConfig";
import Offcanvas from "react-bootstrap/Offcanvas";
import { ToastContainer, toast } from "react-toastify";
import { confirmDialog } from "@/components/dashboard/shared/ConfirmDialog";
import axios from "axios";

function FaqsSettingsPage() {
  const { token } = useAxiosConfig();
  const [rows, setRows] = useState([]);
  const [pageData, setPageData] = useState(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  const fetchRows = async () => {
    if (!token) return;
    try {
      const response = await axios.get(getFaqsRoute);
      setRows(response.data.data || []);
    } catch (error) {
      console.error("Error fetching FAQs", error);
      toast.error(
        error?.response?.data?.message || "Failed to load FAQs.",
      );
    }
  };

  useEffect(() => {
    fetchRows();
  }, [token]);

  const openCreate = () => {
    setPageData(null);
    setShowOffcanvas(true);
  };

  const openEdit = (row) => {
    setPageData(row);
    setShowOffcanvas(true);
  };

  const closePopup = () => setShowOffcanvas(false);

  const handleDelete = async (id) => {
    try {
      await axios.delete(deleteFaqByIdRoute(id));
      toast.success("FAQ deleted!", { autoClose: 1000 });
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to delete FAQ.",
      );
    }
  };

  const confirmDelete = async (id) => {
    if (await confirmDialog({ message: "Delete this FAQ?" })) {
      handleDelete(id);
    }
  };

  const handleStatusToggle = async (row, checked) => {
    const nextStatus = checked ? "active" : "inactive";
    const previous = row.status;
    setRows((prev) =>
      prev.map((r) =>
        r.id === row.id ? { ...r, status: nextStatus } : r,
      ),
    );
    try {
      await axios.put(updateFaqByIdRoute(row.id), { status: nextStatus });
    } catch (error) {
      setRows((prev) =>
        prev.map((r) =>
          r.id === row.id ? { ...r, status: previous } : r,
        ),
      );
      toast.error(
        error?.response?.data?.message || "Failed to update status.",
      );
    }
  };

  const sortRows = (list) =>
    [...list].sort(
      (a, b) =>
        Number(a.sort_order || 0) - Number(b.sort_order || 0) ||
        Number(a.id) - Number(b.id),
    );

  const onAdd = (row) => {
    setRows((prev) => sortRows([...prev, row]));
    setShowOffcanvas(false);
  };

  const onUpdate = (row) => {
    setRows((prev) =>
      sortRows(prev.map((r) => (r.id === row.id ? row : r))),
    );
    setShowOffcanvas(false);
  };

  const truncate = (value, max = 48) => {
    const text = String(value || "").trim();
    if (!text) return "—";
    return text.length > max ? `${text.slice(0, max)}…` : text;
  };

  return (
    <>
      <section className="mt-3">
        <div className="">
          <div className="d-flex justify-content-between mb-3">
            <p className="pagetitle mb-0 fnt-color">FAQs</p>
            <button
              type="button"
              className="btn-orange text-white fs-16"
              onClick={openCreate}
            >
              <i className="bi bi-plus-circle me-2"></i>Create
            </button>
          </div>
          <p className="text-secondary small mb-3">
            Manage frequently asked questions in English and Arabic. Active
            items appear on the Contact page FAQ section.
          </p>
        </div>
        <div className="px-0 pt-0 rounded-2 p-0 mt-3">
          <div className="table-responsive">
            <div className="data-table">
              <table className="table datatable-wrapper">
                <thead>
                  <tr>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Order</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Question (EN)</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Question (AR)</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Status</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-secondary">
                        No FAQs found.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr key={row.id}>
                        <td className="fw-normal fs-14 fnt-color">
                          {row.sort_order}
                        </td>
                        <td className="fw-normal fs-14 fnt-color">
                          {truncate(row.question_en, 56)}
                        </td>
                        <td className="fw-normal fs-14 fnt-color" dir="rtl">
                          {truncate(row.question_ar, 56)}
                        </td>
                        <td className="fw-normal fs-14 fnt-color">
                          <StatusToggle
                            id={`status-${row.id}`}
                            showLabel={false}
                            checked={row.status === "active"}
                            onChange={(checked) =>
                              handleStatusToggle(row, checked)
                            }
                            aria-label="Toggle status"
                          />
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <div
                              className="action-btn d-flex justify-content-center align-items-center bg-transparent rounded-2"
                              onClick={() => openEdit(row)}
                              role="button"
                              title="Edit"
                            >
                              <i className="bi bi-pencil-square text-primary"></i>
                            </div>
                            <div
                              className="action-btn d-flex justify-content-center align-items-center bg-transparent rounded-2"
                              onClick={() => confirmDelete(row.id)}
                              role="button"
                              title="Delete"
                            >
                              <i className="bi bi-trash text-danger"></i>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <Offcanvas show={showOffcanvas} onHide={closePopup} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            <div className="fs-24 fnt-color">
              {pageData ? "Update FAQ" : "Add FAQ"}
            </div>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <hr className="mt-0" />
        <Offcanvas.Body>
          <AddFaq
            closePopup={closePopup}
            pageData={pageData}
            onAdd={onAdd}
            onUpdate={onUpdate}
          />
        </Offcanvas.Body>
      </Offcanvas>

      <ToastContainer position="top-right" />
    </>
  );
}

export default FaqsSettingsPage;
