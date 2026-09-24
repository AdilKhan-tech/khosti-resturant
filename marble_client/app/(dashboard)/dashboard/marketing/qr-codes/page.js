"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import AddQrCode from "@/components/dashboard/marketing/AddQrCode";
import {
  deleteQrCodeByIdRoute,
  getQrCodesRoute,
  updateQrCodeByIdRoute,
} from "@/utils/apiRoutes";
import StatusToggle from "@/components/dashboard/shared/StatusToggle";
import useAxiosConfig from "@/hooks/useAxiosConfig";
import Offcanvas from "react-bootstrap/Offcanvas";
import { ToastContainer, toast } from "react-toastify";
import { confirmDialog } from "@/components/dashboard/shared/ConfirmDialog";
import axios from "axios";

function QrCodesPage() {
  const { token } = useAxiosConfig();
  const [rows, setRows] = useState([]);
  const [rowData, setRowData] = useState(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  const fetchRows = async () => {
    if (!token) return;
    try {
      const response = await axios.get(getQrCodesRoute);
      setRows(response.data.data || []);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load QR codes.",
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
    if (!(await confirmDialog({ message: "Delete this QR code?" }))) return;
    axios
      .delete(deleteQrCodeByIdRoute(id))
      .then(() => {
        toast.success("QR code deleted!", { autoClose: 1000 });
        setRows((prev) => prev.filter((r) => r.id !== id));
      })
      .catch((error) => {
        toast.error(
          error?.response?.data?.message || "Failed to delete QR code.",
        );
      });
  };

  const onAdd = (row) => {
    setRows((prev) => [row, ...prev]);
    setShowOffcanvas(false);
  };

  const onUpdate = (row) => {
    setRows((prev) => prev.map((r) => (r.id === row.id ? row : r)));
    setShowOffcanvas(false);
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
      const fd = new FormData();
      fd.append("brand", row.brand || "");
      fd.append("parent_id", String(row.parent_id ?? 0));
      fd.append("latitude", String(row.latitude ?? ""));
      fd.append("longitude", String(row.longitude ?? ""));
      fd.append("product_ids", row.product_ids || "");
      fd.append("status", nextStatus);
      await axios.put(updateQrCodeByIdRoute(row.id), fd);
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

  return (
    <>
      <section className="mt-3">
        <div className="d-flex justify-content-between mb-3 align-items-center flex-wrap gap-2">
          <p className="pagetitle mb-0 fnt-color">QR Codes</p>
          <div className="d-flex gap-2">
            <Link
              href="/dashboard/reports/qr-attribution"
              className="btn btn-outline-secondary fs-16"
            >
              Order Report
            </Link>
            <button
              type="button"
              className="btn-orange text-white fs-16"
              onClick={openCreate}
            >
              <i className="bi bi-plus-circle me-2"></i>Create
            </button>
          </div>
        </div>
        <p className="text-secondary small mb-3">
          Generate brand/location QR codes. Scanning opens the bonus product
          landing page and attributes checkout orders to the SKU.
        </p>

        <div className="px-0 pt-0 rounded-2 p-0 mt-3">
          <div className="table-responsive">
            <div className="data-table">
              <table className="table datatable-wrapper">
                <thead>
                  <tr>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Brand</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">SKU</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Banner</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">QR</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Status</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-secondary">
                        No QR codes found.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr key={row.id}>
                        <td className="fw-normal fs-14 fnt-color">{row.brand}</td>
                        <td className="fw-normal fs-14 fnt-color">{row.sku}</td>
                        <td className="fw-normal fs-14 fnt-color">
                          {row.banner_en_url ? (
                            <img
                              src={row.banner_en_url}
                              alt="EN"
                              className="dashboard-img-max-100"
                            />
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="fw-normal fs-14 fnt-color">
                          {row.qr_code_image_url ? (
                            <a
                              href={row.qr_code_image_url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <img
                                src={row.qr_code_image_url}
                                alt="QR"
                                className="dashboard-img-max-100"
                              />
                            </a>
                          ) : (
                            "—"
                          )}
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
              {rowData ? "Update QR Code" : "Add QR Code"}
            </div>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <hr className="mt-0" />
        <Offcanvas.Body>
          <AddQrCode
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

export default QrCodesPage;
