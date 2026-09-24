"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
// import PieChart from "../stats/Piechart";
import axios from "axios";
import Profitchart from "@/components/dashboard/profitchart/Profitchart";
import RangeChart from "@/components/dashboard/stats/RangeChart";
import useAxiosConfig from "@/hooks/useAxiosConfig";
import useRbacAccess from "@/hooks/useRbacAccess";
import { getOrdersRoute } from "@/utils/apiRoutes";
import { ORDERS_PERMISSIONS } from "@/utils/rbac/dashboardNav";

function money(value, currency = "SR") {
  return `${Number(value || 0).toFixed(2)} ${currency}`;
}

function orderTotal(order) {
  return Number(order?.totals?.total || order?.total || 0);
}

function orderDate(order) {
  return order?.created_at ? new Date(order.created_at) : null;
}

function isSameDay(date, compareDate) {
  return date?.toDateString() === compareDate.toDateString();
}

function isSameMonth(date, compareDate) {
  return date?.getMonth() === compareDate.getMonth() && date?.getFullYear() === compareDate.getFullYear();
}

function customerKey(order) {
  return (
    order?.customer?.id ||
    order?.customer?.email ||
    order?.customer?.phone_number ||
    order?.billing?.email ||
    order?.billing?.phone ||
    order?.billing?.full_name
  );
}

function isCompletedOrder(order) {
  const status = String(order?.status || "").toLowerCase();
  return ["completed", "delivered", "shipped", "confirmed"].some((key) => status.includes(key));
}

function Home() {
  const { token } = useAxiosConfig();
  const { canAny, isLoading: isRbacLoading, isAccessPending } = useRbacAccess();
  const canViewOrders = canAny(ORDERS_PERMISSIONS);
  const accessReady = !isRbacLoading && !isAccessPending;
  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const fetchDashboardOrders = useCallback(async () => {
    if (!token || !canViewOrders) return;

    setIsLoadingStats(true);
    try {
      const response = await axios.get(getOrdersRoute, {
        params: {
          page: 1,
          limit: 200,
          sortField: "created_at",
          sortOrder: "DESC",
        },
      });
      setOrders(response.data.data || []);
      setTotalOrders(response.data.pagination?.total || response.data.data?.length || 0);
    } catch (error) {
      console.error("Error fetching dashboard orders", error);
    } finally {
      setIsLoadingStats(false);
    }
  }, [token, canViewOrders]);

  useEffect(() => {
    if (!accessReady || !canViewOrders) {
      setOrders([]);
      setTotalOrders(0);
      setIsLoadingStats(false);
      return;
    }
    fetchDashboardOrders();
  }, [accessReady, canViewOrders, fetchDashboardOrders]);

  const dashboardMetrics = useMemo(() => {
    const now = new Date();
    const uniqueCustomers = new Set(orders.map(customerKey).filter(Boolean));
    const totalRevenue = orders.reduce((sum, order) => sum + orderTotal(order), 0);
    const currentMonthRevenue = orders
      .filter((order) => isSameMonth(orderDate(order), now))
      .reduce((sum, order) => sum + orderTotal(order), 0);
    const completedOrders = orders.filter(isCompletedOrder).length;
    const conversionRate = orders.length ? (completedOrders / orders.length) * 100 : 0;

    return {
      completedOrders,
      conversionRate,
      currentMonthRevenue,
      todayRevenue: orders
        .filter((order) => isSameDay(orderDate(order), now))
        .reduce((sum, order) => sum + orderTotal(order), 0),
      monthlyRevenueShare: totalRevenue ? Math.round((currentMonthRevenue / totalRevenue) * 100) : 0,
      totalCustomers: uniqueCustomers.size,
      totalOrders: totalOrders || orders.length,
      totalRevenue,
      averageOrderValue: orders.length ? totalRevenue / orders.length : 0,
    };
  }, [orders, totalOrders]);

  const dashboardStats = [
    {
      label: "Total Orders",
      value: isLoadingStats ? "..." : dashboardMetrics.totalOrders.toLocaleString(),
      icon: "bi-cart-check",
      iconClass: "bg-primary-subtle",
      textClass: "text-primary",
    },
    {
      label: "Total Customers",
      value: isLoadingStats ? "..." : dashboardMetrics.totalCustomers.toLocaleString(),
      icon: "bi-people",
      iconClass: "bg-success-subtle",
      textClass: "text-success",
    },
    {
      label: "Total Revenue",
      value: isLoadingStats ? "..." : money(dashboardMetrics.totalRevenue),
      icon: "bi-currency-dollar",
      iconClass: "bg-warning-subtle",
      textClass: "text-warning",
    },
    {
      label: "Conversion Rate",
      value: isLoadingStats ? "..." : `${dashboardMetrics.conversionRate.toFixed(1)}%`,
      icon: "bi-graph-up",
      iconClass: "bg-info-subtle",
      textClass: "text-info",
    },
  ];

  const revenueOverview = [
    { label: "Total Sales", value: money(dashboardMetrics.totalRevenue), className: "bg-primary-subtle", textClass: "text-primary" },
    { label: "Monthly Sales", value: money(dashboardMetrics.currentMonthRevenue), className: "bg-success-subtle", textClass: "text-success" },
    { label: "Today's Sales", value: money(dashboardMetrics.todayRevenue), className: "bg-warning-subtle", textClass: "text-warning" },
    { label: "Avg. Order Value", value: money(dashboardMetrics.averageOrderValue), className: "bg-info-subtle", textClass: "text-info" },
  ];

  return (
    <div className="dashboard-wrapper">
      {/* Header Stats */}
      <div className="row g-4 mb-4">
        {dashboardStats.map(({ label, value, icon, iconClass, textClass }) => (
          <div className="col-xl-3 col-md-6" key={label}>
            <div className="card border-0 shadow-none rounded-4 bg-white dashboard-stat-card h-100">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center gap-3 h-100">
                  <div className="flex-grow-1 min-w-0">
                    <p className="text-muted mb-2 fw-medium">{label}</p>
                    <h2 className={`mb-0 fw-bold text-nowrap ${textClass}`}>{value}</h2>
                  </div>
                  <div className={`dashboard-icon-circle ${iconClass} flex-shrink-0`}>
                    <i className={`bi ${icon} ${textClass} fs-4`}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-none rounded-4 bg-white">
            <div className="card-header bg-transparent border-0 py-3 px-4">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fs-18 fw-semibold fnt-color">Sales Performance</h5>
                <div className="dropdown">
                  <button className="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                    This Month
                  </button>
                  <ul className="dropdown-menu">
                    <li><a className="dropdown-item" href="#">This Week</a></li>
                    <li><a className="dropdown-item" href="#">This Month</a></li>
                    <li><a className="dropdown-item" href="#">This Year</a></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="card-body p-4">
              <RangeChart />
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-none rounded-4 bg-white h-100">
            <div className="card-header bg-transparent border-0 py-3 px-4">
              <h5 className="mb-0 fs-18 fw-semibold fnt-color">Top Products</h5>
            </div>
            <div className="card-body p-4">
              <div className="dashboard-product-list">
                <div className="dashboard-product-item bg-light rounded-3 p-3 mb-3">
                  <div className="d-flex align-items-center">
                    <div className="dashboard-product-img bg-light rounded me-3">
                      <i className="bi bi-cake fs-5 text-primary"></i>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-1 fw-medium">Chocolate Cake</h6>
                      <p className="text-muted mb-0 small">1,245 sold</p>
                    </div>
                    <span className="badge bg-success-subtle text-success">+12%</span>
                  </div>
                </div>
                <div className="dashboard-product-item bg-light rounded-3 p-3 mb-3">
                  <div className="d-flex align-items-center">
                    <div className="dashboard-product-img bg-light rounded me-3">
                      <i className="bi bi-snow fs-5 text-info"></i>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-1 fw-medium">Ice Cream</h6>
                      <p className="text-muted mb-0 small">987 sold</p>
                    </div>
                    <span className="badge bg-success-subtle text-success">+8%</span>
                  </div>
                </div>
                <div className="dashboard-product-item bg-light rounded-3 p-3 mb-3">
                  <div className="d-flex align-items-center">
                    <div className="dashboard-product-img bg-light rounded me-3">
                      <i className="bi bi-cookie fs-5 text-warning"></i>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-1 fw-medium">Cookies</h6>
                      <p className="text-muted mb-0 small">756 sold</p>
                    </div>
                    <span className="badge bg-danger-subtle text-danger">-3%</span>
                  </div>
                </div>
                <div className="dashboard-product-item bg-light rounded-3 p-3">
                  <div className="d-flex align-items-center">
                    <div className="dashboard-product-img bg-light rounded me-3">
                      <i className="bi bi-cup-straw fs-5 text-success"></i>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-1 fw-medium">Custom Cakes</h6>
                      <p className="text-muted mb-0 small">634 sold</p>
                    </div>
                    <span className="badge bg-success-subtle text-success">+15%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Overview */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-none rounded-4 bg-white">
            <div className="card-header bg-transparent border-0 py-3 px-4">
              <h5 className="mb-0 fs-18 fw-semibold fnt-color">Revenue Overview</h5>
            </div>
            <div className="card-body p-4">
              <div className="row g-4">
                {revenueOverview.map(({ label, value, className, textClass }) => (
                  <div className="col-md-3" key={label}>
                    <div className={`text-center p-3 ${className} rounded`}>
                      <h3 className={`fw-bold ${textClass} mb-1`}>{isLoadingStats ? "..." : value}</h3>
                      <p className="text-muted mb-0">{label}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="fw-medium">Monthly Revenue Share</span>
                  <span className="fw-bold">{dashboardMetrics.monthlyRevenueShare}%</span>
                </div>
                <div className="progress dashboard-progress-sm">
                  <div
                    className="progress-bar bg-gradient"
                    style={{ width: `${dashboardMetrics.monthlyRevenueShare}%` }}
                    aria-valuenow={dashboardMetrics.monthlyRevenueShare}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Profitchart />
    </div>
  );
}

export default Home;