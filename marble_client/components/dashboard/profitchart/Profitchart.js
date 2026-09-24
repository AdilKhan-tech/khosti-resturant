"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import ApexChart from "@/components/dashboard/stats/ApexChart";
import axios from "axios";
import LineChart from "@/components/dashboard/stats/LineChart";
import { useRouter } from "next/navigation";
import Piechart from "@/components/dashboard/stats/Piechart";
import useAxiosConfig from "@/hooks/useAxiosConfig";
import useRbacAccess from "@/hooks/useRbacAccess";
import { getOrdersRoute, getOrderStatusesRoute } from "@/utils/apiRoutes";
import { ORDERS_PERMISSIONS } from "@/utils/rbac/dashboardNav";

function Profitchart() {
  const router = useRouter();
  const { token } = useAxiosConfig();
  const { canAny, isLoading: isRbacLoading, isAccessPending } = useRbacAccess();
  const canViewOrders = canAny(ORDERS_PERMISSIONS);
  const accessReady = !isRbacLoading && !isAccessPending;
  const [recentOrders, setRecentOrders] = useState([]);
  const [statusLabels, setStatusLabels] = useState({});
  const [loadingOrders, setLoadingOrders] = useState(false);

  const fetchRecentOrders = useCallback(async () => {
    if (!token || !canViewOrders) return;

    setLoadingOrders(true);
    try {
      const response = await axios.get(getOrdersRoute, {
        params: {
          page: 1,
          limit: 5,
          sortField: "created_at",
          sortOrder: "DESC",
        },
      });
      setRecentOrders(response.data.data || []);
    } catch (error) {
      console.error("Error fetching recent orders", error);
    } finally {
      setLoadingOrders(false);
    }
  }, [token, canViewOrders]);

  const fetchStatuses = useCallback(async () => {
    if (!token || !canViewOrders) return;

    try {
      const response = await axios.get(getOrderStatusesRoute);
      const options = response.data.data || [];
      setStatusLabels(
        options.reduce((labels, option) => ({
          ...labels,
          [option.value]: option.label,
        }), {}),
      );
    } catch (error) {
      console.error("Error fetching order statuses", error);
    }
  }, [token, canViewOrders]);

  useEffect(() => {
    if (!accessReady || !canViewOrders) {
      setRecentOrders([]);
      setStatusLabels({});
      setLoadingOrders(false);
      return;
    }
    fetchRecentOrders();
    fetchStatuses();
  }, [accessReady, canViewOrders, fetchRecentOrders, fetchStatuses]);

  const summaryItems = useMemo(() => {
    if (!recentOrders.length) {
      return [
        { label: "Completed", value: 60, displayValue: "60%", color: "#007bff", className: "chart-legend-dot-completed" },
        { label: "New Orders", value: 30, displayValue: "30%", color: "#28a745", className: "chart-legend-dot-order" },
        { label: "Pending", value: 10, displayValue: "10%", color: "#dc3545", className: "chart-legend-dot-pending" },
      ];
    }

    const counts = recentOrders.reduce(
      (totals, order) => {
        const status = String(order.status || "").toLowerCase();

        if (["completed", "delivered", "shipped", "confirmed"].some((key) => status.includes(key))) {
          totals.completed += 1;
        } else if (["pending", "processing", "hold", "request", "qfa", "afa"].some((key) => status.includes(key))) {
          totals.pending += 1;
        } else {
          totals.newOrders += 1;
        }

        return totals;
      },
      { completed: 0, newOrders: 0, pending: 0 },
    );

    const totalOrders = recentOrders.length || 1;
    return [
      { label: "Completed", value: counts.completed, displayValue: `${Math.round((counts.completed / totalOrders) * 100)}%`, color: "#007bff", className: "chart-legend-dot-completed" },
      { label: "New Orders", value: counts.newOrders, displayValue: `${Math.round((counts.newOrders / totalOrders) * 100)}%`, color: "#28a745", className: "chart-legend-dot-order" },
      { label: "Pending", value: counts.pending, displayValue: `${Math.round((counts.pending / totalOrders) * 100)}%`, color: "#dc3545", className: "chart-legend-dot-pending" },
    ];
  }, [recentOrders]);

  const sellerItems = [
    { rank: 1, name: "Michael Marquez", meta: "357 sales • $12.4K", trend: "12%", trendClass: "bg-success-subtle text-success", icon: "bi-arrow-up" },
    { rank: 2, name: "Sarah Johnson", meta: "289 sales • $9.8K", trend: "8%", trendClass: "bg-success-subtle text-success", icon: "bi-arrow-up" },
    { rank: 3, name: "Robert Chen", meta: "245 sales • $8.2K", trend: "3%", trendClass: "bg-warning-subtle text-warning", icon: "bi-arrow-down" },
  ];

  const money = (value, currency = "SR") => `${Number(value || 0).toFixed(2)} ${currency}`;
  const formatRelativeDate = (value) => {
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
  };

  const statusClass = (status) => {
    if (["cancelled", "failed", "refunded", "rejected"].includes(status)) return "red-status";
    return "blue-status";
  };
  return (
    <>
      {/* Performance Charts Section */}
      <section className="dashboard-charts-section mb-4">
        <div>
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="card border-0 shadow-none rounded-4 bg-white h-100">
                <div className="card-header bg-transparent border-0 px-4 pt-4 pb-0">
                  <h3 className="fs-18 fw-semibold fnt-color mb-1">Revenue Trends</h3>
                  <p className="text-muted fs-14 mb-0">Monthly performance analysis</p>
                </div>
                <div className="card-body p-4">
                  <LineChart />
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card border-0 shadow-none rounded-4 bg-white h-100">
                <div className="card-header bg-transparent border-0 px-4 pt-4 pb-0">
                  <h3 className="fs-18 fw-semibold fnt-color mb-1">Inflation Analysis</h3>
                  <p className="text-muted fs-14 mb-0">Yearly inflation rates</p>
                </div>
                <div className="card-body p-4">
                  <ApexChart />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Orders Table */}
      <section className="dashboard-table-section my-4">
        <div>
          <div className="card border-0 shadow-none rounded-4 bg-white">
            <div className="card-header bg-transparent border-0 px-4 pt-4 pb-0">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                <h3 className="fs-18 fw-semibold fnt-color mb-0">Recent Orders</h3>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary rounded-3"
                  onClick={() => router.push("/dashboard/orders")}
                >
                  View All
                </button>
              </div>
            </div>

            <div className="card-body p-4">
              <div className="px-0 pt-0 rounded-2 p-0">
                <div className="table-responsive">
                  <div className="data-table">
                    <table className="table datatable-wrapper">
                      <thead>
                        <tr>
                          <th className="fw-medium fs-14 fnt-color text-nowrap">Order</th>
                          <th className="fw-medium fs-14 fnt-color text-nowrap">Customer</th>
                          <th className="fw-medium fs-14 fnt-color text-nowrap">Date</th>
                          <th className="fw-medium fs-14 fnt-color text-nowrap">Branch</th>
                          <th className="fw-medium fs-14 fnt-color text-nowrap">Order Type</th>
                          <th className="fw-medium fs-14 fnt-color text-nowrap">Total</th>
                          <th className="fw-medium fs-14 fnt-color text-nowrap">Status</th>
                          <th className="fw-medium fs-14 fnt-color text-nowrap">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loadingOrders && (
                          <tr>
                            <td colSpan={8} className="text-center text-muted py-4">
                              Loading orders...
                            </td>
                          </tr>
                        )}

                        {!loadingOrders && recentOrders.length === 0 && (
                          <tr>
                            <td colSpan={8} className="text-center text-muted py-4">
                              No orders found.
                            </td>
                          </tr>
                        )}

                        {!loadingOrders && recentOrders.map((order) => (
                          <tr key={order.order_number}>
                            <td className="fw-normal fs-14 fnt-color text-nowrap">#{order.order_number}</td>
                            <td className="fw-normal fs-14 fnt-color">
                              {order.billing?.full_name || order.customer?.full_name || "N/A"}
                            </td>
                            <td className="fw-normal fs-14 fnt-color">{formatRelativeDate(order.created_at)}</td>
                            <td className="fw-normal fs-14 fnt-color">{order.receiving_info?.nearest_branch || "N/A"}</td>
                            <td className="fw-normal fs-14 fnt-color">{order.receiving_info?.address_type || "N/A"}</td>
                            <td className="fw-normal fs-14 fnt-color">{money(order.totals?.total, order.currency)}</td>
                            <td className="fw-normal fs-14 fnt-color">
                              <span className={statusClass(order.status)}>
                                {statusLabels[order.status] || order.status}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex gap-1">
                                <button
                                  type="button"
                                  className="action-btn d-flex justify-content-center align-items-center bg-transparent rounded-2"
                                  onClick={() => router.push(`/dashboard/orders/${encodeURIComponent(order.order_number)}/view`)}
                                  aria-label="View order"
                                >
                                  <i className="bi bi-eye text-secondary"></i>
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
            </div>
          </div>
        </div>
      </section>

      {/* Order Summary Section */}
      <section className="dashboard-summary-section">
        <div>
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="card border-0 shadow-none rounded-4 bg-white h-100">
                <div className="card-header bg-transparent border-0 px-4 pt-4 pb-0">
                  <div className="d-flex justify-content-between align-items-center">
                    <h3 className="fs-18 fw-semibold fnt-color mb-0">Order Summary</h3>
                  </div>
                </div>
                <div className="card-body p-4">
                  <div className="summary-stats d-grid gap-3">
                    {summaryItems.map(({ label, displayValue }) => (
                      <div className="stat-item bg-light rounded-3 p-3" key={label}>
                        <span className="stat-label">{label}</span>
                        <span className="stat-value">{displayValue}</span>
                      </div>
                    ))}
                  </div>
                  <div className="d-flex justify-content-center mt-4">
                    <Piechart items={summaryItems} />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card border-0 shadow-none rounded-4 bg-white h-100">
                <div className="card-header bg-transparent border-0 px-4 pt-4 pb-0">
                  <h3 className="fs-18 fw-semibold fnt-color mb-0">Top Sellers</h3>
                </div>
                <div className="card-body p-4">
                  <div className="sellers-list">
                    {sellerItems.map(({ rank, name, meta, trend, trendClass, icon }, index) => (
                      <div
                        className={`seller-item bg-light rounded-3 p-3 d-flex align-items-center gap-3${index < sellerItems.length - 1 ? " mb-3" : ""}`}
                        key={rank}
                      >
                        <div className="seller-rank bg-white rounded-3 d-flex align-items-center justify-content-center fw-semibold">{rank}</div>
                        <div className="seller-info">
                          <h5>{name}</h5>
                          <p className="text-muted mb-0">{meta}</p>
                        </div>
                        <div className="trend-badge">
                          <span className={`badge ${trendClass}`}>
                            <i className={`bi ${icon}`}></i> {trend}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Profitchart;