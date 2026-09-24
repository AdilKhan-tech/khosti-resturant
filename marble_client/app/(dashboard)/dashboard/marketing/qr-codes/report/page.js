"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getQrOrderReportRoute } from "@/utils/apiRoutes";
import useAxiosConfig from "@/hooks/useAxiosConfig";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";

function QrOrderReportPage() {
  const { token } = useAxiosConfig();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (!token) return;
    axios
      .get(getQrOrderReportRoute)
      .then((res) => setRows(res.data?.data || []))
      .catch((error) => {
        toast.error(
          error?.response?.data?.message || "Failed to load QR order report.",
        );
      });
  }, [token]);

  return (
    <>
      <section className="mt-3">
        <div className="d-flex justify-content-between mb-3 align-items-center flex-wrap gap-2">
          <p className="pagetitle mb-0 fnt-color">QR Order Report</p>
          <Link
            href="/dashboard/marketing/qr-codes"
            className="btn btn-outline-secondary fs-16"
          >
            Back to QR Codes
          </Link>
        </div>
        <p className="text-secondary small mb-3">
          Orders attributed via brand SKU after a customer scanned a custom QR
          code.
        </p>

        <div className="px-0 pt-0 rounded-2 p-0 mt-3">
          <div className="table-responsive">
            <div className="data-table">
              <table className="table datatable-wrapper">
                <thead>
                  <tr>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">
                      Brand SKU
                    </th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">
                      Total Orders
                    </th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">
                      Total Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-secondary">
                        No attributed orders yet.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr key={row.brand_sku}>
                        <td className="fw-normal fs-14 fnt-color">
                          {row.brand_sku}
                        </td>
                        <td className="fw-normal fs-14 fnt-color">
                          {row.total_orders}
                        </td>
                        <td className="fw-normal fs-14 fnt-color">
                          {Number(row.total_price || 0).toFixed(2)} SR
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
      <ToastContainer position="top-right" />
    </>
  );
}

export default QrOrderReportPage;
