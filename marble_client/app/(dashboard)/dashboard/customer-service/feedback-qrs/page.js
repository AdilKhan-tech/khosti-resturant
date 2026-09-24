"use client";

import React, { useEffect, useState } from "react";
import AddFeedbackQr from "@/components/dashboard/customer-service/AddFeedbackQr";
import StatusToggle from "@/components/dashboard/shared/StatusToggle";
import useAxiosConfig from "@/hooks/useAxiosConfig";
import {
  deleteFeedbackQrByIdRoute,
  getFeedbackQrsRoute,
  updateFeedbackQrByIdRoute,
} from "@/utils/apiRoutes";
import Offcanvas from "react-bootstrap/Offcanvas";
import { ToastContainer, toast } from "react-toastify";
import { confirmDialog } from "@/components/dashboard/shared/ConfirmDialog";
import axios from "axios";

function FeedbackQrsPage() {
  const { token } = useAxiosConfig();
  const [rows, setRows] = useState([]);
  const [rowData, setRowData] = useState(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  const fetchRows = async () => {
    if (!token) return;
    try {
      const response = await axios.get(getFeedbackQrsRoute);
      setRows(response.data.data || []);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load feedback QRs.",
      );
    }
  };

  useEffect(() => {
    fetchRows();
  }, [token]);

  const openCreate = () => {
    setRowData(null);
    setShowOffcanvas(true);
  };

  const openEdit = (row) => {
    setRowData(row);
    setShowOffcanvas(true);
  };

  const closePopup = () => setShowOffcanvas(false);

  const confirmDelete = async (id) => {
    if (!(await confirmDialog({ message: "Delete this feedback QR?" }))) return;
    axios
      .delete(deleteFeedbackQrByIdRoute(id))
      .then(() => {
        toast.success("Feedback QR deleted!", { autoClose: 1000 });
        setRows((prev) => prev.filter((r) => r.id !== id));
      })
      .catch((error) => {
        toast.error(
          error?.response?.data?.message || "Failed to delete feedback QR.",
        );
      });
  };

  const handleStatusToggle = async (row, checked) => {
    const previous = row.status;
    setRows((prev) =>
      prev.map((r) => (r.id === row.id ? { ...r, status: checked } : r)),
    );
    try {
      await axios.put(updateFeedbackQrByIdRoute(row.id), { status: checked });
    } catch (error) {
      setRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, status: previous } : r)),
      );
      toast.error(
        error?.response?.data?.message || "Failed to update status.",
      );
    }
  };

  const onAdd = (row) => {
    setRows((prev) => [row, ...prev]);
    setShowOffcanvas(false);
  };

  const onUpdate = (row) => {
    setRows((prev) => prev.map((r) => (r.id === row.id ? row : r)));
    setShowOffcanvas(false);
  };

  const qrImageUrl = (row) =>
    row.qr_code_image_url || row.qr_code_url || row.url || null;

  return (
    <>
      <section className="mt-3">
        <div className="d-flex justify-content-between mb-3 align-items-center">
          <p className="pagetitle mb-0 fnt-color">Feedback QR Codes</p>
          <button
            type="button"
            className="btn-orange text-white fs-16"
            onClick={openCreate}
          >
            <i className="bi bi-plus-circle me-2"></i>Create
          </button>
        </div>
        <p className="text-secondary small mb-3">
          Branch feedback QR codes open the public feedback form with the
          branch slug.
        </p>

        <div className="px-0 pt-0 rounded-2 p-0 mt-3">
          <div className="table-responsive">
            <div className="data-table">
              <table className="table datatable-wrapper">
                <thead>
                  <tr>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Name</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Slug</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Branch</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">QR</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Status</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-secondary">
                        No feedback QRs found.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => {
                      const imageUrl = qrImageUrl(row);
                      return (
                        <tr key={row.id}>
                          <td className="fw-normal fs-14 fnt-color">
                            {row.qr_name}
                          </td>
                          <td className="fw-normal fs-14 fnt-color">
                            {row.slug}
                          </td>
                          <td className="fw-normal fs-14 fnt-color">
                            {row.branch}
                          </td>
                          <td className="fw-normal fs-14 fnt-color">
                            {imageUrl ? (
                              <a
                                href={imageUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <img
                                  src={imageUrl}
                                  alt={row.qr_name}
                                  className="dashboard-img-max-100"
                                />
                              </a>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="fw-normal fs-14 fnt-color">
                            <StatusToggle
                              id={`feedback-qr-status-${row.id}`}
                              showLabel={false}
                              checked={Boolean(row.status)}
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
                      );
                    })
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
              {rowData ? "Update Feedback QR" : "Add Feedback QR"}
            </div>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <hr className="mt-0" />
        <Offcanvas.Body>
          <AddFeedbackQr
            closePopup={closePopup}
            rowData={rowData}
            onAdd={onAdd}
            onUpdate={onUpdate}
          />
        </Offcanvas.Body>
      </Offcanvas>

      <ToastContainer position="top-right" />
    </>
  );
}

export default FeedbackQrsPage;
