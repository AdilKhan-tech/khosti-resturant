"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import useAxiosConfig from "@/hooks/useAxiosConfig";
import { getGraduationReportRoute } from "@/utils/apiRoutes";

export default function GraduationReportPage() {
  const { token } = useAxiosConfig();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await axios.get(getGraduationReportRoute, {
        params: {
          start_date: startDate || undefined,
          end_date: endDate || undefined,
        },
      });
      setReport(response.data);
      if (!startDate && response.data?.start_date) {
        setStartDate(response.data.start_date);
      }
      if (!endDate && response.data?.end_date) {
        setEndDate(response.data.end_date);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load graduation report.",
      );
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const branchCols = report?.branches || [];
  const colSpan = 3 + branchCols.length;

  return (
    <>
      <section className="mt-3">
        <div className="d-flex justify-content-between mb-3 align-items-center flex-wrap gap-2">
          <p className="pagetitle mb-0 fnt-color">Graduation Campaign</p>
        </div>
        <p className="text-secondary small mb-3">
          Order counts per promo product and branch (WP Graduation Products
          Orders Report). Uses the active promotional rule&apos;s applicable
          products; promo branches are listed first.
        </p>

        <form
          className="mb-3"
          onSubmit={(e) => {
            e.preventDefault();
            load();
          }}
        >
          <div className="row row-cols-2 row-cols-md-4 g-2 align-items-end">
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

        {report?.rule_type ? (
          <p className="small text-secondary mb-2">
            Rule: {report.rule_type}
            {report.rule_id ? ` (#${report.rule_id})` : ""}
          </p>
        ) : null}

        <div className="px-0 pt-0 rounded-2 p-0 mt-3">
          <div className="table-responsive">
            <div className="data-table data-table-wide">
              <table className="table datatable-wrapper">
                <thead>
                  <tr>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">
                      Product
                    </th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">SKU</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">
                      Image
                    </th>
                    {branchCols.map((b) => (
                      <th
                        key={b.branch_id}
                        className="fw-medium fs-14 fnt-color text-nowrap"
                      >
                        {b.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={Math.max(colSpan, 4)} className="text-secondary">
                        Loading report…
                      </td>
                    </tr>
                  ) : !report?.products?.length ? (
                    <tr>
                      <td colSpan={Math.max(colSpan, 4)} className="text-secondary">
                        No campaign products found.
                      </td>
                    </tr>
                  ) : (
                    <>
                      {report.products.map((row) => (
                        <tr key={row.product_id}>
                          <td className="fs-14 fnt-color">{row.name}</td>
                          <td className="fs-14 fnt-color">{row.sku}</td>
                          <td className="fs-14 fnt-color">
                            {row.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={row.image}
                                alt=""
                                width={48}
                                height={48}
                                style={{ objectFit: "contain" }}
                              />
                            ) : (
                              "—"
                            )}
                          </td>
                          {row.quantities.map((cell) => (
                            <td
                              key={cell.branch_id}
                              className="fs-14 fnt-color text-center"
                            >
                              {cell.qty}
                            </td>
                          ))}
                        </tr>
                      ))}
                      <tr>
                        <td colSpan={3} className="fs-14 fw-semibold fnt-color">
                          Total
                        </td>
                        {branchCols.map((b) => (
                          <td
                            key={b.branch_id}
                            className="fs-14 fw-semibold fnt-color text-center"
                          >
                            {b.total}
                          </td>
                        ))}
                      </tr>
                    </>
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
