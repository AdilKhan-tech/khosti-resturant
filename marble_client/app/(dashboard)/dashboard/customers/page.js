"use client";

import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import useAxiosConfig from "@/hooks/useAxiosConfig";
import Pagination from "@/components/dashboard/shared/Pagination";
import EntriesPerPageSelector from "@/components/dashboard/shared/EntriesPerPageSelector";
import { getCustomersRoute } from "@/utils/apiRoutes";

function money(value) {
  return `${Number(value || 0).toFixed(2)} SR`;
}

function formatPhone(phone) {
  if (!phone) return "N/A";
  const value = String(phone);
  if (value.startsWith("+966")) return value;
  return `+966 ${value.replace(/^0+/, "")}`;
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default function CustomersPage() {
  const router = useRouter();
  const { token } = useAxiosConfig();

  const [customers, setCustomers] = useState([]);
  const [keywords, setKeywords] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(25);
  const [totalEntries, setTotalEntries] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCustomers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await axios.get(getCustomersRoute, {
        params: { page: currentPage, limit: pageLimit, keywords },
      });
      setCustomers(response.data.data || []);
      setTotalEntries(response.data.pagination?.total || 0);
      setPageCount(response.data.pagination?.pageCount || 0);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load customers.",
      );
    } finally {
      setLoading(false);
    }
  }, [token, currentPage, pageLimit, keywords]);

  useEffect(() => {
    const delay = setTimeout(fetchCustomers, keywords ? 500 : 0);
    return () => clearTimeout(delay);
  }, [fetchCustomers, keywords]);

  const handleSearch = (event) => {
    setKeywords(event.target.value);
    setCurrentPage(1);
  };

  const handleLimitChange = (newLimit) => {
    setPageLimit(newLimit);
    setCurrentPage(1);
  };

  return (
    <section className="mt-3">
      <div className="d-flex justify-content-between mb-1 align-items-center">
        <p className="pagetitle mb-0 fnt-color">Customers</p>
      </div>
      <p className="text-secondary small mb-3">
        Storefront accounts (name and phone). Delivery addresses are captured per
        order at checkout, not on the customer profile.
      </p>

      <div className="d-flex flex-wrap gap-3 align-items-center">
        <div className="d-flex position-relative">
          <i className="bi bi-search fs-20 px-3 py-1 text-secondary position-absolute"></i>
          <input
            type="text"
            className="form-control px-5 text-dark-custom dashboard-search-input"
            placeholder="Search by name or phone..."
            value={keywords}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="px-0 pt-0 rounded-2 p-0 mt-3">
        <div className="table-responsive">
          <div className="data-table">
            <table className="table datatable-wrapper">
              <thead>
                <tr>
                  <th className="fw-medium fs-14 fnt-color text-nowrap">ID</th>
                  <th className="fw-medium fs-14 fnt-color text-nowrap">Name</th>
                  <th className="fw-medium fs-14 fnt-color text-nowrap">Phone</th>
                  <th className="fw-medium fs-14 fnt-color text-nowrap">Orders</th>
                  <th className="fw-medium fs-14 fnt-color text-nowrap">Total spent</th>
                  <th className="fw-medium fs-14 fnt-color text-nowrap">Last order</th>
                  <th className="fw-medium fs-14 fnt-color text-nowrap">Joined</th>
                  <th className="fw-medium fs-14 fnt-color text-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-secondary">
                      Loading customers...
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-secondary">
                      No customers found.
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer.id}>
                      <td className="fw-normal fs-14 fnt-color">{customer.id}</td>
                      <td className="fw-normal fs-14 fnt-color">
                        {customer.full_name || "—"}
                      </td>
                      <td className="fw-normal fs-14 fnt-color text-nowrap">
                        {formatPhone(customer.phone_number)}
                      </td>
                      <td className="fw-normal fs-14 fnt-color">
                        {customer.order_count}
                      </td>
                      <td className="fw-normal fs-14 fnt-color text-nowrap">
                        {money(customer.total_spent)}
                      </td>
                      <td className="fw-normal fs-14 fnt-color text-nowrap">
                        {formatDate(customer.last_order_at)}
                      </td>
                      <td className="fw-normal fs-14 fnt-color text-nowrap">
                        {formatDate(customer.created_at)}
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <div
                            className="action-btn d-flex justify-content-center align-items-center bg-transparent rounded-2"
                            onClick={() =>
                              router.push(`/dashboard/customers/${customer.id}`)
                            }
                            role="button"
                            title="View"
                          >
                            <i className="bi bi-eye text-primary"></i>
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

      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-2 mt-0">
        <Pagination
          currentPage={currentPage}
          pageCount={pageCount}
          pageLimit={pageLimit}
          totalEntries={totalEntries}
          onPageChange={setCurrentPage}
        />
        <EntriesPerPageSelector
          pageLimit={pageLimit}
          onPageLimitChange={handleLimitChange}
        />
      </div>

      <ToastContainer position="top-right" />
    </section>
  );
}
