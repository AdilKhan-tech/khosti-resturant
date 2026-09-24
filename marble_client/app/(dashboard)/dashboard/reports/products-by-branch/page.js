"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import useAxiosConfig from "@/hooks/useAxiosConfig";
import {
  getCategoriesRoute,
  getProductsByBranchReportRoute,
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

export default function ProductsByBranchReportPage() {
  const { token } = useAxiosConfig();
  const defaults = useMemo(() => monthDefaults(), []);
  const [startDate, setStartDate] = useState(defaults.start_date);
  const [endDate, setEndDate] = useState(defaults.end_date);
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    axios
      .get(getCategoriesRoute, { params: { limit: 500 } })
      .then((res) => {
        const rows = res.data?.data || [];
        setCategories(
          rows.filter(
            (c) =>
              !["Uncategorized", "Uncategorise"].includes(c.name_en || c.name),
          ),
        );
      })
      .catch(() => setCategories([]));
  }, [token]);

  const load = async () => {
    if (!token) return;
    if (!categoryId) {
      toast.error("Please select a category.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(getProductsByBranchReportRoute, {
        params: {
          start_date: startDate,
          end_date: endDate,
          category_id: Number(categoryId),
        },
      });
      setReport(response.data);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load products report.",
      );
    } finally {
      setLoading(false);
    }
  };

  const branchCols = report?.branches || [];
  const colSpan = 3 + branchCols.length + 1;

  return (
    <>
      <section className="mt-3">
        <div className="d-flex justify-content-between mb-3 align-items-center flex-wrap gap-2">
          <p className="pagetitle mb-0 fnt-color">Products by Branch</p>
        </div>
        <p className="text-secondary small mb-3">
          Quantity sold per product and branch for a selected category (WP
          General Products Orders Report).
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
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_en || c.name}
                  </option>
                ))}
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
                    <th className="fw-medium fs-14 fnt-color text-nowrap">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {!report && !loading ? (
                    <tr>
                      <td colSpan={4} className="text-secondary">
                        Select a date range and category to view the report.
                      </td>
                    </tr>
                  ) : loading ? (
                    <tr>
                      <td colSpan={colSpan} className="text-secondary">
                        Loading report…
                      </td>
                    </tr>
                  ) : !report?.products?.length ? (
                    <tr>
                      <td colSpan={colSpan} className="text-secondary">
                        No products found for this category.
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
                          <td className="fs-14 fnt-color fw-semibold">
                            {row.total}
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td colSpan={3} className="fs-14 fw-semibold fnt-color">
                          Grand Total
                        </td>
                        {branchCols.map((b) => (
                          <td
                            key={b.branch_id}
                            className="fs-14 fw-semibold fnt-color text-center"
                          >
                            {b.total}
                          </td>
                        ))}
                        <td className="fs-14 fw-semibold fnt-color">
                          {report.grand_total}
                        </td>
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
