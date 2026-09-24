"use client";

import React, { useEffect, useState } from "react";
import AddTicket from "@/components/dashboard/customer-service/AddTicket";
import TicketDetail from "@/components/dashboard/customer-service/TicketDetail";
import Pagination from "@/components/dashboard/shared/Pagination";
import EntriesPerPageSelector from "@/components/dashboard/shared/EntriesPerPageSelector";
import useAxiosConfig from "@/hooks/useAxiosConfig";
import {
  exportFeedbacksRoute,
  getFeedbackFilterOptionsRoute,
  getFeedbacksRoute,
} from "@/utils/apiRoutes";
import Offcanvas from "react-bootstrap/Offcanvas";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(value);
  }
}

const emptyFilters = {
  agent_or_order: "",
  branch: "",
  source: "",
  status: "",
  review_type: "",
  city: "",
  tag: "",
  start_date: "",
  end_date: "",
};

function CustomerServiceTicketsPage() {
  const { token } = useAxiosConfig();
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [applied, setApplied] = useState(emptyFilters);
  const [options, setOptions] = useState({
    branches: [],
    cities: [],
    sources: [],
    statuses: ["New", "In-progress", "Resolved"],
    review_types: [],
    tags: [],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(25);
  const [pageCount, setPageCount] = useState(0);
  const [totalEntries, setTotalEntries] = useState(0);
  const [loading, setLoading] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [detailId, setDetailId] = useState(null);

  const setFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const fetchOptions = async () => {
    if (!token) return;
    try {
      const response = await axios.get(getFeedbackFilterOptionsRoute);
      setOptions((prev) => ({ ...prev, ...(response.data.data || {}) }));
    } catch (error) {
      console.error("Failed to load filter options", error);
    }
  };

  const fetchRows = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: pageLimit,
      };
      Object.entries(applied).forEach(([key, value]) => {
        if (String(value || "").trim()) params[key] = String(value).trim();
      });

      const response = await axios.get(getFeedbacksRoute, { params });
      setRows(response.data.data || []);
      setPageCount(response.data.pagination?.pageCount || 0);
      setTotalEntries(response.data.pagination?.total || 0);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load tickets.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, [token]);

  useEffect(() => {
    fetchRows();
  }, [token, currentPage, pageLimit, applied]);

  const applyFilters = (event) => {
    event?.preventDefault?.();
    setCurrentPage(1);
    setApplied({ ...filters });
  };

  const clearFilters = () => {
    setFilters(emptyFilters);
    setApplied(emptyFilters);
    setCurrentPage(1);
  };

  const handleLimitChange = (newLimit) => {
    setPageLimit(newLimit);
    setCurrentPage(1);
  };

  const exportCsv = async () => {
    try {
      const params = {};
      Object.entries(applied).forEach(([key, value]) => {
        if (String(value || "").trim()) params[key] = String(value).trim();
      });
      const response = await axios.get(exportFeedbacksRoute, {
        params,
        responseType: "blob",
      });
      const stamp = new Date().toISOString().slice(0, 19).replace("T", "_");
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `customer_service_${stamp}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to export tickets CSV.",
      );
    }
  };

  const openCreate = () => setShowCreate(true);
  const closeCreate = () => setShowCreate(false);

  const openDetail = (id) => {
    setDetailId(id);
    setShowDetail(true);
  };

  const closeDetail = () => {
    setShowDetail(false);
    setDetailId(null);
  };

  const onAdd = (row) => {
    setRows((prev) => [row, ...prev]);
    setShowCreate(false);
    setTotalEntries((n) => n + 1);
  };

  const onTicketUpdated = (updated) => {
    if (!updated?.id) return;
    setRows((prev) =>
      prev.map((r) =>
        r.id === updated.id
          ? {
              ...r,
              ...updated,
              latest_status: updated.latest_status || r.latest_status,
            }
          : r,
      ),
    );
  };

  return (
    <>
      <section className="mt-3">
        <div className="d-flex justify-content-between mb-3 align-items-center flex-wrap gap-2">
          <p className="pagetitle mb-0 fnt-color">Customer Service Tickets</p>
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-orange text-white fs-16 text-nowrap w-auto px-3"
              onClick={exportCsv}
            >
              <i className="bi bi-download me-2"></i>Export CSV
            </button>
            <button
              type="button"
              className="btn-orange text-white fs-16 text-nowrap w-auto px-3"
              onClick={openCreate}
            >
              <i className="bi bi-plus-circle me-2"></i>Add New Form
            </button>
          </div>
        </div>

        <form className="mb-3" onSubmit={applyFilters}>
          <div className="row row-cols-2 row-cols-md-3 row-cols-xl-5 g-2 align-items-stretch">
            <div className="col">
              <input
                type="text"
                className="form-control"
                placeholder="Search Agent/Order"
                value={filters.agent_or_order}
                onChange={(e) => setFilter("agent_or_order", e.target.value)}
              />
            </div>
            <div className="col">
              <select
                className="form-select"
                value={filters.branch}
                onChange={(e) => setFilter("branch", e.target.value)}
              >
                <option value="">All Branches</option>
                {options.branches.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div className="col">
              <select
                className="form-select"
                value={filters.source}
                onChange={(e) => setFilter("source", e.target.value)}
              >
                <option value="">All Sources</option>
                {options.sources.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="col">
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) => setFilter("status", e.target.value)}
              >
                <option value="">All Statuses</option>
                {options.statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="col">
              <select
                className="form-select"
                value={filters.review_type}
                onChange={(e) => setFilter("review_type", e.target.value)}
              >
                <option value="">All Subject</option>
                {options.review_types.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="col">
              <select
                className="form-select"
                value={filters.city}
                onChange={(e) => setFilter("city", e.target.value)}
              >
                <option value="">All City</option>
                {options.cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="col">
              <select
                className="form-select"
                value={filters.tag}
                onChange={(e) => setFilter("tag", e.target.value)}
              >
                <option value="">All tags</option>
                {(options.tags || []).map((t) => (
                  <option key={t.id || t.name} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col">
              <input
                type="date"
                className="form-control"
                value={filters.start_date}
                onChange={(e) => setFilter("start_date", e.target.value)}
              />
            </div>
            <div className="col">
              <input
                type="date"
                className="form-control"
                value={filters.end_date}
                onChange={(e) => setFilter("end_date", e.target.value)}
              />
            </div>
          </div>
          <div className="d-flex gap-2 align-items-center mt-2">
            <button
              type="submit"
              className="btn-orange text-white fs-14 px-3 py-2 border-0 rounded-3"
            >
              Filter
            </button>
            <button
              type="button"
              className="form-cancel-btn bg-white border rounded-3 text-muted fs-14 px-3 py-2 text-nowrap"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
        </form>

        <div className="px-0 pt-0 rounded-2 p-0 mt-3">
          <div className="table-responsive">
            <div className="data-table data-table-wide">
              <table className="table datatable-wrapper">
                <thead>
                  <tr>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">ID</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Agent</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Customer</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Phone</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">City</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Branch</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Source</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Subject</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Status</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Order</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Created</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={12} className="text-secondary">
                        Loading tickets…
                      </td>
                    </tr>
                  ) : !rows.length ? (
                    <tr>
                      <td colSpan={12} className="text-secondary">
                        No tickets found.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr key={row.id}>
                        <td className="fs-14 fnt-color">{row.id}</td>
                        <td className="fs-14 fnt-color">{row.agent_name || "—"}</td>
                        <td className="fs-14 fnt-color">{row.customer_name || "—"}</td>
                        <td className="fs-14 fnt-color">{row.customer_phone || "—"}</td>
                        <td className="fs-14 fnt-color">{row.city || "—"}</td>
                        <td className="fs-14 fnt-color">{row.branch || "—"}</td>
                        <td className="fs-14 fnt-color">{row.source || "—"}</td>
                        <td className="fs-14 fnt-color">{row.review_type || "—"}</td>
                        <td className="fs-14 fnt-color">
                          {row.latest_status || "—"}
                        </td>
                        <td className="fs-14 fnt-color">
                          {row.order_number || "—"}
                        </td>
                        <td className="fs-14 fnt-color">
                          {formatDate(row.created_at)}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="action-btn d-flex justify-content-center align-items-center bg-transparent rounded-2"
                            onClick={() => openDetail(row.id)}
                            title="View"
                          >
                            <i className="bi bi-eye text-secondary"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-2 mt-3">
          <Pagination
            currentPage={currentPage}
            pageCount={Math.max(pageCount, 1)}
            onPageChange={setCurrentPage}
            pageLimit={pageLimit}
            totalEntries={totalEntries}
          />
          <EntriesPerPageSelector
            pageLimit={pageLimit}
            onPageLimitChange={handleLimitChange}
          />
        </div>
      </section>

      <Offcanvas show={showCreate} onHide={closeCreate} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Add New Form</Offcanvas.Title>
        </Offcanvas.Header>
        <hr className="mt-0" />
        <Offcanvas.Body>
          <AddTicket onAdd={onAdd} closePopup={closeCreate} />
        </Offcanvas.Body>
      </Offcanvas>

      <Offcanvas show={showDetail} onHide={closeDetail} placement="end">
        {detailId ? (
          <TicketDetail
            ticketId={detailId}
            onUpdated={onTicketUpdated}
            closePopup={closeDetail}
          />
        ) : null}
      </Offcanvas>

      <ToastContainer />
    </>
  );
}

export default CustomerServiceTicketsPage;
