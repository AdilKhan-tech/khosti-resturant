"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import useAxiosConfig from "@/hooks/useAxiosConfig";
import {
  exportCsReportRoute,
  getCsReportRoute,
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

export default function CsReportPage() {
  const { token } = useAxiosConfig();
  const defaults = useMemo(() => monthDefaults(), []);
  const [groupBy, setGroupBy] = useState("branch");
  const [startDate, setStartDate] = useState(defaults.start_date);
  const [endDate, setEndDate] = useState(defaults.end_date);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const showExtras = groupBy === "branch";

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await axios.get(getCsReportRoute, {
        params: {
          group_by: groupBy,
          start_date: startDate,
          end_date: endDate,
        },
      });
      setRows(response.data?.data || []);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load CS report.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, groupBy]);

  const exportCsv = async () => {
    try {
      const response = await axios.get(exportCsReportRoute, {
        params: {
          group_by: groupBy,
          start_date: startDate,
          end_date: endDate,
        },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `customer_service_report_${startDate}_${endDate}.csv`,
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

  return (
    <>
      <section className="mt-3">
        <div className="d-flex justify-content-between mb-3 align-items-center flex-wrap gap-2">
          <p className="pagetitle mb-0 fnt-color">Customer Service Report</p>
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
              <label className="form-label">Group by</label>
              <select
                className="form-select"
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
              >
                <option value="branch">Branch</option>
                <option value="agent_name">Agent Name</option>
                <option value="source">Source</option>
              </select>
            </div>
            <div className="col">
              <label className="form-label">Start date</label>
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="col">
              <label className="form-label">End date</label>
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
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

        <div className="px-0 pt-0 rounded-2 p-0 mt-3">
          <div className="table-responsive">
            <div className="data-table data-table-wide">
              <table className="table datatable-wrapper">
                <thead>
                  <tr>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">
                      {groupBy.replace("_", " ")}
                    </th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Total</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Inquiry</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Complaint</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Order</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Van</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Suggestions</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Marketing</th>
                    {showExtras ? (
                      <>
                        <th className="fw-medium fs-14 fnt-color text-nowrap">WhatsApp</th>
                        <th className="fw-medium fs-14 fnt-color text-nowrap">Call Center</th>
                        <th className="fw-medium fs-14 fnt-color text-nowrap">New</th>
                        <th className="fw-medium fs-14 fnt-color text-nowrap">In-progress</th>
                        <th className="fw-medium fs-14 fnt-color text-nowrap">Resolved</th>
                      </>
                    ) : null}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={showExtras ? 13 : 8} className="text-secondary">
                        Loading report…
                      </td>
                    </tr>
                  ) : !rows.length ? (
                    <tr>
                      <td colSpan={showExtras ? 13 : 8} className="text-secondary">
                        No data for this range.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr key={row.group_value}>
                        <td className="fs-14 fnt-color">{row.group_value}</td>
                        <td className="fs-14 fnt-color">{row.total_feedback}</td>
                        <td className="fs-14 fnt-color">{row.total_inquiries}</td>
                        <td className="fs-14 fnt-color">{row.total_complaints}</td>
                        <td className="fs-14 fnt-color">{row.total_orders}</td>
                        <td className="fs-14 fnt-color">{row.total_van}</td>
                        <td className="fs-14 fnt-color">{row.total_suggestions}</td>
                        <td className="fs-14 fnt-color">{row.total_marketings}</td>
                        {showExtras ? (
                          <>
                            <td className="fs-14 fnt-color">{row.total_whatsapp}</td>
                            <td className="fs-14 fnt-color">{row.total_callcenter}</td>
                            <td className="fs-14 fnt-color">{row.total_new}</td>
                            <td className="fs-14 fnt-color">{row.total_inprogress}</td>
                            <td className="fs-14 fnt-color">{row.total_resolved}</td>
                          </>
                        ) : null}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
      <ToastContainer position="top-right" />
    </>
  );
}
