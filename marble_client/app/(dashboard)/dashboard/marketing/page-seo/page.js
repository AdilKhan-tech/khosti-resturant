"use client";

import React, { useEffect, useState } from "react";
import AddPageSeo from "@/components/dashboard/marketing/AddPageSeo";
import {
  getPageSeoRoute,
  deletePageSeoByIdRoute,
} from "@/utils/apiRoutes";
import useAxiosConfig from "@/hooks/useAxiosConfig";
import Offcanvas from "react-bootstrap/Offcanvas";
import { ToastContainer, toast } from "react-toastify";
import { confirmDialog } from "@/components/dashboard/shared/ConfirmDialog";
import axios from "axios";

function PageSeoSettingsPage() {
  const { token } = useAxiosConfig();
  const [rows, setRows] = useState([]);
  const [pageData, setPageData] = useState(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  const fetchRows = async () => {
    if (!token) return;
    try {
      const response = await axios.get(getPageSeoRoute);
      setRows(response.data.data || []);
    } catch (error) {
      console.error("Error fetching page SEO", error);
      toast.error(
        error?.response?.data?.message || "Failed to load page SEO.",
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
      await axios.delete(deletePageSeoByIdRoute(id));
      toast.success("Page SEO deleted!", { autoClose: 1000 });
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to delete page SEO.",
      );
    }
  };

  const confirmDelete = async (id) => {
    if (await confirmDialog({ message: "Delete this page SEO entry?" })) {
      handleDelete(id);
    }
  };

  const onAdd = (row) => {
    setRows((prev) => [...prev, row].sort((a, b) =>
      String(a.label).localeCompare(String(b.label)),
    ));
    setShowOffcanvas(false);
  };

  const onUpdate = (row) => {
    setRows((prev) =>
      prev.map((r) => (r.id === row.id ? row : r)),
    );
    setShowOffcanvas(false);
  };

  const truncate = (value, max = 40) => {
    const text = String(value || "").trim();
    if (!text) return "—";
    return text.length > max ? `${text.slice(0, max)}…` : text;
  };

  return (
    <>
      <section className="mt-3">
        <div className="">
          <div className="d-flex justify-content-between mb-3">
            <p className="pagetitle mb-0 fnt-color">Page SEO</p>
            <button
              type="button"
              className="btn-orange text-white fs-16"
              onClick={openCreate}
            >
              <i className="bi bi-plus-circle me-2"></i>Create
            </button>
          </div>
          <p className="text-secondary small mb-3">
            Manage search engine titles, descriptions, and keywords per page
            (English and Arabic). Storefront pages load these via slug.
          </p>
        </div>
        <div className="px-0 pt-0 rounded-2 p-0 mt-3">
          <div className="table-responsive">
            <div className="data-table">
              <table className="table datatable-wrapper">
                <thead>
                  <tr>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Label</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Slug</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Meta Title</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">
                      Meta Description
                    </th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Keywords</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-secondary">
                        No page SEO entries found.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr key={row.id}>
                        <td className="fw-normal fs-14 fnt-color">
                          {row.label}
                        </td>
                        <td className="fw-normal fs-14 fnt-color">
                          {row.slug}
                        </td>
                        <td className="fw-normal fs-14 fnt-color">
                          {truncate(row.meta_title, 36)}
                        </td>
                        <td className="fw-normal fs-14 fnt-color">
                          {truncate(row.meta_description, 48)}
                        </td>
                        <td className="fw-normal fs-14 fnt-color">
                          {truncate(row.meta_keyword, 28)}
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

      <Offcanvas
        show={showOffcanvas}
        onHide={closePopup}
        placement="end"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            <div className="fs-24 fnt-color">
              {pageData ? "Update Page SEO" : "Add Page SEO"}
            </div>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <hr className="mt-0" />
        <Offcanvas.Body>
          <AddPageSeo
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

export default PageSeoSettingsPage;
