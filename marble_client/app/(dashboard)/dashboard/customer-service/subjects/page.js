"use client";

import React, { useEffect, useState } from "react";
import AddCsSubject from "@/components/dashboard/customer-service/AddCsSubject";
import StatusToggle from "@/components/dashboard/shared/StatusToggle";
import useAxiosConfig from "@/hooks/useAxiosConfig";
import {
  deleteCsSubjectByIdRoute,
  getCsSubjectsRoute,
  updateCsSubjectByIdRoute,
} from "@/utils/apiRoutes";
import Offcanvas from "react-bootstrap/Offcanvas";
import { ToastContainer, toast } from "react-toastify";
import { confirmDialog } from "@/components/dashboard/shared/ConfirmDialog";
import axios from "axios";

function CsSubjectsPage() {
  const { token } = useAxiosConfig();
  const [rows, setRows] = useState([]);
  const [rowData, setRowData] = useState(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  const fetchRows = async () => {
    if (!token) return;
    try {
      const response = await axios.get(getCsSubjectsRoute);
      setRows(response.data.data || []);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load subjects.",
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
    if (!(await confirmDialog({ message: "Delete this subject?" }))) return;
    axios
      .delete(deleteCsSubjectByIdRoute(id))
      .then(() => {
        toast.success("Subject deleted!", { autoClose: 1000 });
        setRows((prev) => prev.filter((r) => r.id !== id));
      })
      .catch((error) => {
        toast.error(
          error?.response?.data?.message || "Failed to delete subject.",
        );
      });
  };

  const handleStatusToggle = async (row, checked) => {
    const previous = row.status;
    setRows((prev) =>
      prev.map((r) => (r.id === row.id ? { ...r, status: checked } : r)),
    );
    try {
      await axios.put(updateCsSubjectByIdRoute(row.id), { status: checked });
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

  return (
    <>
      <section className="mt-3">
        <div className="d-flex justify-content-between mb-3 align-items-center">
          <p className="pagetitle mb-0 fnt-color">CS Subjects</p>
          <button
            type="button"
            className="btn-orange text-white fs-16"
            onClick={openCreate}
          >
            <i className="bi bi-plus-circle me-2"></i>Create
          </button>
        </div>
        <p className="text-secondary small mb-3">
          Subjects used when agents create customer service tickets.
        </p>

        <div className="px-0 pt-0 rounded-2 p-0 mt-3">
          <div className="table-responsive">
            <div className="data-table">
              <table className="table datatable-wrapper">
                <thead>
                  <tr>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">ID</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Name</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Status</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-secondary">
                        No subjects found.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr key={row.id}>
                        <td className="fw-normal fs-14 fnt-color">{row.id}</td>
                        <td className="fw-normal fs-14 fnt-color">{row.name}</td>
                        <td className="fw-normal fs-14 fnt-color">
                          <StatusToggle
                            id={`subject-status-${row.id}`}
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
              {rowData ? "Update Subject" : "Add Subject"}
            </div>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <hr className="mt-0" />
        <Offcanvas.Body>
          <AddCsSubject
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

export default CsSubjectsPage;
