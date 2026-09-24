"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import useAxiosConfig from "@/hooks/useAxiosConfig";
import {
  exportBranchReportRoute,
  getBranchReportRoute,
  getBranchesRoute,
} from "@/utils/apiRoutes";

function monthDefaults() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const last = new Date(y, now.getMonth() + 1, 0).getDate();
  return {
    start_date: `${y}-${m}-01`,
    end_date: `${y}-${m}-${String(last).padStart(2, "0")}`,
  };
}

const METRIC_CARDS = [
  { key: "total_sales", label: "Total Sales", suffix: " SR" },
  { key: "total_sales_without_vat", label: "Total Sales W/O VAT", suffix: " SR" },
  { key: "sales_pickup_without_vat", label: "Sales Pickup W/O VAT", suffix: " SR" },
  { key: "sales_delivery_without_vat", label: "Sales Delivery W/O VAT", suffix: " SR" },
  { key: "total_shipping_cost", label: "Total Shipping Cost", suffix: " SR" },
  { key: "total_vat", label: "Total VAT", suffix: " SR" },
  { key: "total_orders", label: "Orders", suffix: "" },
  { key: "products_sold", label: "Products Sold", suffix: "" },
  { key: "new_customers", label: "New Customers", suffix: "" },
  { key: "repeat_customers", label: "Repeat Customers", suffix: "" },
];

export default function BranchReportsPage() {
  const { token } = useAxiosConfig();
  const defaults = useMemo(() => monthDefaults(), []);
  const [filterPeriod, setFilterPeriod] = useState("custom");
  const [startDate, setStartDate] = useState(defaults.start_date);
  const [endDate, setEndDate] = useState(defaults.end_date);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [quarter, setQuarter] = useState(1);
  const [branch, setBranch] = useState("all");
  const [orderType, setOrderType] = useState("");
  const [branches, setBranches] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showOrders, setShowOrders] = useState(false);

  useEffect(() => {
    if (!token) return;
    axios
      .get(getBranchesRoute)
      .then((res) => setBranches(res.data?.data || []))
      .catch(() => setBranches([]));
  }, [token]);

  const queryParams = () => {
    const params = {
      filter_period: filterPeriod,
      branch,
      order_type: orderType || undefined,
    };
    if (filterPeriod === "custom") {
      params.start_date = startDate;
      params.end_date = endDate;
    } else if (filterPeriod === "monthly") {
      params.month = month;
      params.year = year;
    } else if (filterPeriod === "quarterly") {
      params.quarter = quarter;
      params.year = year;
    } else if (filterPeriod === "annual") {
      params.year = year;
    }
    return params;
  };

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await axios.get(getBranchReportRoute, {
        params: queryParams(),
      });
      setReport(response.data);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load branch report.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const exportCsv = async () => {
    try {
      const response = await axios.get(exportBranchReportRoute, {
        params: queryParams(),
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `branch_orders_${report?.start_date || startDate}_${report?.end_date || endDate}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to export CSV.",
      );
    }
  };

  const money = (value) => Number(value || 0).toFixed(2);
  const metrics = report?.metrics;

  return (
    <>
      <section className="mt-3">
        <div className="d-flex justify-content-between mb-3 align-items-center flex-wrap gap-2">
          <p className="pagetitle mb-0 fnt-color">Branch Reports</p>
          <button
            type="button"
            className="btn-orange text-white fs-16 text-nowrap w-auto px-3"
            onClick={exportCsv}
          >
            <i className="bi bi-download me-2"></i>Export CSV
          </button>
        </div>

        <form
          className="mb-3"
          onSubmit={(e) => {
            e.preventDefault();
            load();
          }}
        >
          <div className="row row-cols-2 row-cols-md-4 g-2 align-items-end">
            <div className="col">
              <label className="form-label">Branch</label>
              <select
                className="form-select"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
              >
                <option value="all">All Branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.name_en}>
                    {b.name_en}
                  </option>
                ))}
              </select>
            </div>
            <div className="col">
              <label className="form-label">Filter by</label>
              <select
                className="form-select"
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
              >
                <option value="custom">Custom</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annual">Annual</option>
              </select>
            </div>
            {filterPeriod === "custom" && (
              <>
                <div className="col">
                  <label className="form-label">From</label>
                  <input
                    type="date"
                    className="form-control"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="col">
                  <label className="form-label">To</label>
                  <input
                    type="date"
                    className="form-control"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </>
            )}
            {filterPeriod === "monthly" && (
              <>
                <div className="col">
                  <label className="form-label">Month</label>
                  <select
                    className="form-select"
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(2000, i, 1).toLocaleString("en", {
                          month: "long",
                        })}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col">
                  <label className="form-label">Year</label>
                  <input
                    type="number"
                    className="form-control"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                  />
                </div>
              </>
            )}
            {filterPeriod === "quarterly" && (
              <>
                <div className="col">
                  <label className="form-label">Quarter</label>
                  <select
                    className="form-select"
                    value={quarter}
                    onChange={(e) => setQuarter(Number(e.target.value))}
                  >
                    <option value={1}>Q1</option>
                    <option value={2}>Q2</option>
                    <option value={3}>Q3</option>
                    <option value={4}>Q4</option>
                  </select>
                </div>
                <div className="col">
                  <label className="form-label">Year</label>
                  <input
                    type="number"
                    className="form-control"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                  />
                </div>
              </>
            )}
            {filterPeriod === "annual" && (
              <div className="col">
                <label className="form-label">Year</label>
                <input
                  type="number"
                  className="form-control"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                />
              </div>
            )}
            <div className="col">
              <label className="form-label">Order type</label>
              <select
                className="form-select"
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
              >
                <option value="">All</option>
                <option value="Delivery">Delivery</option>
                <option value="Pickup">Pickup</option>
              </select>
            </div>
            <div className="col">
              <button
                type="submit"
                className="btn-orange text-white fs-14 px-3 py-2 border-0 rounded-3"
              >
                Filter
              </button>
            </div>
          </div>
        </form>

        <div className="row g-3 mb-4">
          {METRIC_CARDS.map(({ key, label, suffix }) => (
            <div className="col-6 col-md-4 col-xl-3" key={key}>
              <div className="card border-0 shadow-none rounded-4 bg-white h-100">
                <div className="card-body p-3">
                  <h5 className="mb-1 fw-semibold fnt-color">
                    {loading || !metrics
                      ? "…"
                      : `${
                          suffix.includes("SR")
                            ? money(metrics[key])
                            : Number(metrics[key] || 0).toLocaleString()
                        }${suffix}`}
                  </h5>
                  <p className="text-muted mb-0 small">{label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
          <p className="mb-0 fw-semibold fnt-color">
            Branch summary
            {report?.start_date
              ? ` (${report.start_date} → ${report.end_date})`
              : ""}
          </p>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm rounded-3"
            onClick={() => setShowOrders((v) => !v)}
          >
            {showOrders ? "Hide Orders" : "Show Orders"}
          </button>
        </div>

        <div className="px-0 pt-0 rounded-2 p-0 mt-2">
          <div className="table-responsive">
            <div className="data-table data-table-wide">
              <table className="table datatable-wrapper">
                <thead>
                  <tr>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">#</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Branch</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">City</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Orders</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Sales w/ VAT</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Sales w/o VAT</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Delivery</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Pickup</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">AOV</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Shipping</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">New</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Repeat</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={12} className="text-secondary">
                        Loading report…
                      </td>
                    </tr>
                  ) : !report?.branches?.length ? (
                    <tr>
                      <td colSpan={12} className="text-secondary">
                        No data for this range.
                      </td>
                    </tr>
                  ) : (
                    report.branches.map((row, index) => (
                      <tr key={`${row.branch_name}-${index}`}>
                        <td className="fs-14 fnt-color">{index + 1}</td>
                        <td className="fs-14 fnt-color">{row.branch_name}</td>
                        <td className="fs-14 fnt-color">{row.branch_city || "—"}</td>
                        <td className="fs-14 fnt-color">{row.total_orders}</td>
                        <td className="fs-14 fnt-color">
                          {money(row.total_sales_with_vat)}
                        </td>
                        <td className="fs-14 fnt-color">
                          {money(row.total_sales_without_vat)}
                        </td>
                        <td className="fs-14 fnt-color">
                          {row.total_delivery_orders}
                        </td>
                        <td className="fs-14 fnt-color">
                          {row.total_pickup_orders}
                        </td>
                        <td className="fs-14 fnt-color">
                          {money(row.average_order_value)}
                        </td>
                        <td className="fs-14 fnt-color">
                          {money(row.total_shipping_cost)}
                        </td>
                        <td className="fs-14 fnt-color">{row.new_customers}</td>
                        <td className="fs-14 fnt-color">
                          {row.repeat_customers}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {showOrders && (
          <div className="px-0 pt-0 rounded-2 p-0 mt-4">
            <p className="fw-semibold fnt-color mb-2">Orders</p>
            <div className="table-responsive">
              <div className="data-table data-table-wide">
                <table className="table datatable-wrapper">
                  <thead>
                    <tr>
                      <th className="fw-medium fs-14 fnt-color text-nowrap">Order</th>
                      <th className="fw-medium fs-14 fnt-color text-nowrap">Customer</th>
                      <th className="fw-medium fs-14 fnt-color text-nowrap">Phone</th>
                      <th className="fw-medium fs-14 fnt-color text-nowrap">Date</th>
                      <th className="fw-medium fs-14 fnt-color text-nowrap">Status</th>
                      <th className="fw-medium fs-14 fnt-color text-nowrap">City</th>
                      <th className="fw-medium fs-14 fnt-color text-nowrap">Branch</th>
                      <th className="fw-medium fs-14 fnt-color text-nowrap">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!report?.orders?.length ? (
                      <tr>
                        <td colSpan={8} className="text-secondary">
                          No orders.
                        </td>
                      </tr>
                    ) : (
                      report.orders.map((order) => (
                        <tr key={order.order_number}>
                          <td className="fs-14 fnt-color">
                            #{order.order_number}
                          </td>
                          <td className="fs-14 fnt-color">
                            {order.customer_name}
                          </td>
                          <td className="fs-14 fnt-color">
                            {order.customer_phone}
                          </td>
                          <td className="fs-14 fnt-color">
                            {order.order_date
                              ? new Date(order.order_date).toLocaleString()
                              : "—"}
                          </td>
                          <td className="fs-14 fnt-color">{order.status}</td>
                          <td className="fs-14 fnt-color">{order.city}</td>
                          <td className="fs-14 fnt-color">{order.branch}</td>
                          <td className="fs-14 fnt-color">{order.order_type}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </section>
      <ToastContainer position="top-right" />
    </>
  );
}
