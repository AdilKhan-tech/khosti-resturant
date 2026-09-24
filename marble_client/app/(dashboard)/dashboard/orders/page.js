"use client";

import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import useAxiosConfig from "@/hooks/useAxiosConfig";
import Pagination from "@/components/dashboard/shared/Pagination";
import EntriesPerPageSelector from "@/components/dashboard/shared/EntriesPerPageSelector";
import Common from "@/utils/Common";
import { getOrdersRoute, getOrderStatusesRoute } from "@/utils/apiRoutes";
import { printOrder } from "@/utils/orderPrint";

function money(value, currency = "SR") {
  return `${Number(value || 0).toFixed(2)} ${currency}`;
}

function formatPhone(phone) {
  if (!phone) return "N/A";
  const value = String(phone);
  if (value.startsWith("+966")) return value;
  return `+966 ${value.replace(/^0+/, "")}`;
}

function formatRelativeDate(value) {
  if (!value) return "N/A";
  const date = new Date(value);
  const diffSeconds = Math.max(Math.floor((Date.now() - date.getTime()) / 1000), 0);
  const minutes = Math.floor(diffSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return date.toLocaleDateString("en", { month: "long", day: "2-digit", year: "numeric" });
  if (hours > 0) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  if (minutes > 0) return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  return `${diffSeconds || 1} ${diffSeconds === 1 ? "second" : "seconds"} ago`;
}

function statusClass(status) {
  if (["cancelled", "failed", "refunded"].includes(status)) return "red-status";
  return "blue-status";
}

function SortableHeader({ field, label, sortField, sortOrder, onSort }) {
  return (
    <th className="fw-medium fs-14 fnt-color text-nowrap" onClick={() => onSort(field)}>
      {label}
      <span className="fs-10 text-secondary ms-1">
        {(sortField === field && (sortOrder === "asc" ? "↑" : "↓")) || "↑↓"}
      </span>
    </th>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const { token } = useAxiosConfig();
  const [orders, setOrders] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [statusLabels, setStatusLabels] = useState({});
  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(25);
  const [keywords, setKeywords] = useState("");
  const [status, setStatus] = useState("");
  const [totalEntries, setTotalEntries] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [printingKey, setPrintingKey] = useState("");

  const handlePrint = async (order, size) => {
    const key = `${order.order_number}-${size}`;
    setPrintingKey(key);
    try {
      await printOrder(order.order_number, size);
    } catch (error) {
      console.error("Error printing order", error);
      toast.error(
        error?.response?.data?.message || "Failed to print order.",
      );
    } finally {
      setPrintingKey("");
    }
  };

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: pageLimit,
        keywords,
        status,
        sortField,
        sortOrder,
      };
      const response = await axios.get(getOrdersRoute, { params });
      setOrders(response.data.data || []);
      setTotalEntries(response.data.pagination?.total || 0);
      setPageCount(response.data.pagination?.pageCount || 0);
    } catch (error) {
      console.error("Error fetching orders", error);
      toast.error("Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, keywords, pageLimit, sortField, sortOrder, status, token]);

  const fetchStatuses = useCallback(async () => {
    if (!token) return;
    try {
      const response = await axios.get(getOrderStatusesRoute);
      const options = response.data.data || [];
      setStatuses(options);
      setStatusLabels(
        options.reduce((labels, option) => ({
          ...labels,
          [option.value]: option.label,
        }), {}),
      );
    } catch (error) {
      console.error("Error fetching order statuses", error);
      toast.error("Failed to fetch order statuses.");
    }
  }, [token]);

  useEffect(() => {
    if (keywords !== "") {
      if (keywords.trim() === "") return;
      const delay = setTimeout(fetchOrders, 500);
      return () => clearTimeout(delay);
    }
    fetchOrders();
  }, [fetchOrders, keywords]);

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  const handleSortChange = (field) =>
    Common.handleSortingChange(field, setSortField, setSortOrder);

  const handleLimitChange = (newLimit) => {
    setPageLimit(newLimit);
    setCurrentPage(1);
  };

  const handleStatusFilter = (event) => {
    setStatus(event.target.value);
    setCurrentPage(1);
  };

  return (
    <>
      <section className="mt-3">
        <div className="d-flex justify-content-between mb-3">
          <p className="pagetitle mb-0 fnt-color">Orders</p>
        </div>

        <div className="d-flex flex-wrap gap-3 align-items-center">
          <div className="d-flex position-relative">
            <i className="bi bi-search fs-20 px-3 py-1 text-secondary position-absolute"></i>
            <input
              type="text"
              className="form-control px-5 text-dark-custom dashboard-search-input"
              placeholder="Search orders..."
              onChange={(event) => setKeywords(event.target.value)}
            />
          </div>
          <select
            className="form-select dashboard-filter-select"
            value={status}
            onChange={handleStatusFilter}
          >
            <option value="">All statuses</option>
            {statuses.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="px-0 pt-0 rounded-2 p-0 mt-3">
          <div className="table-responsive">
            <div className="data-table data-table-wide">
              <table className="table datatable-wrapper">
                <thead>
                  <tr>
                    <SortableHeader field="order_number" label="Order" sortField={sortField} sortOrder={sortOrder} onSort={handleSortChange} />
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Customer</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Phone</th>
                    <SortableHeader field="created_at" label="Date" sortField={sortField} sortOrder={sortOrder} onSort={handleSortChange} />
                    <SortableHeader field="branch" label="Branch" sortField={sortField} sortOrder={sortOrder} onSort={handleSortChange} />
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Order Type</th>
                    <SortableHeader field="total" label="Total" sortField={sortField} sortOrder={sortOrder} onSort={handleSortChange} />
                    <SortableHeader field="status" label="Status" sortField={sortField} sortOrder={sortOrder} onSort={handleSortChange} />
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={9} className="text-center text-muted py-4">
                        Loading orders...
                      </td>
                    </tr>
                  )}

                  {!loading && orders.length === 0 && (
                    <tr>
                      <td colSpan={9} className="text-center text-muted py-4">
                        No orders found.
                      </td>
                    </tr>
                  )}

                  {!loading && orders.map((order) => (
                    <tr key={order.order_number}>
                      <td className="fw-normal fs-14 fnt-color" title={`#${order.order_number}`}>
                        #{order.order_number}
                      </td>
                      <td className="fw-normal fs-14 fnt-color">
                        {order.billing?.full_name || order.customer?.full_name || "N/A"}
                      </td>
                      <td className="fw-normal fs-14 fnt-color">
                        {formatPhone(order.billing?.phone || order.customer?.phone_number)}
                      </td>
                      <td className="fw-normal fs-14 fnt-color">
                        {formatRelativeDate(order.created_at)}
                      </td>
                      <td className="fw-normal fs-14 fnt-color">
                        {order.receiving_info?.nearest_branch || "N/A"}
                      </td>
                      <td className="fw-normal fs-14 fnt-color">
                        {order.receiving_info?.address_type || "N/A"}
                      </td>
                      <td className="fw-normal fs-14 fnt-color">
                        {money(order.totals?.total, order.currency)}
                      </td>
                      <td className="fw-normal fs-14 fnt-color">
                        <span className={statusClass(order.status)}>
                          {statusLabels[order.status] || order.status}
                        </span>
                      </td>
                      <td className="text-nowrap">
                        <div className="d-flex flex-nowrap gap-1 align-items-center">
                          <button
                            type="button"
                            className="action-btn d-flex justify-content-center align-items-center bg-transparent rounded-2"
                            onClick={() =>
                              router.push(
                                `/dashboard/orders/${encodeURIComponent(order.order_number)}/view`,
                              )
                            }
                            aria-label="View order"
                            title="View"
                          >
                            <i className="bi bi-eye text-secondary"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary rounded-2 fs-12 px-2 py-1 text-nowrap"
                            onClick={() => handlePrint(order, "a4")}
                            disabled={printingKey === `${order.order_number}-a4`}
                            title="Print A4"
                          >
                            Print A4
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary rounded-2 fs-12 px-2 py-1 text-nowrap"
                            onClick={() => handlePrint(order, "small")}
                            disabled={
                              printingKey === `${order.order_number}-small`
                            }
                            title="Print Small"
                          >
                            Print Small
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-2 mt-0">
          <Pagination
            currentPage={currentPage}
            pageCount={pageCount}
            onPageChange={(newPage) => setCurrentPage(newPage)}
            pageLimit={pageLimit}
            totalEntries={totalEntries}
          />
          <EntriesPerPageSelector pageLimit={pageLimit} onPageLimitChange={handleLimitChange} />
        </div>
      </section>

      <ToastContainer />
    </>
  );
}
