"use client";

import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import useAxiosConfig from "@/hooks/useAxiosConfig";
import useRbacAccess from "@/hooks/useRbacAccess";
import {
  getCustomerByIdRoute,
  updateCustomerByIdRoute,
} from "@/utils/apiRoutes";

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

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params?.id;
  const { token } = useAxiosConfig();
  const { can } = useRbacAccess();
  const canManage = can("customers.manage");

  const [customer, setCustomer] = useState(null);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchCustomer = useCallback(async () => {
    if (!token || !customerId) return;
    setLoading(true);
    try {
      const response = await axios.get(getCustomerByIdRoute(customerId));
      const data = response.data.data;
      setCustomer(data);
      setFullName(data?.full_name || "");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load customer.",
      );
    } finally {
      setLoading(false);
    }
  }, [token, customerId]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  const handleSave = async (event) => {
    event.preventDefault();
    if (!fullName.trim()) {
      toast.error("Name is required.");
      return;
    }
    setSaving(true);
    try {
      const response = await axios.patch(updateCustomerByIdRoute(customerId), {
        full_name: fullName.trim(),
      });
      setCustomer(response.data.data);
      toast.success("Customer updated!", { autoClose: 1000 });
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update customer.",
      );
    } finally {
      setSaving(false);
    }
  };

  const recentOrders = customer?.recent_orders || [];

  return (
    <section className="mt-3">
      <div className="d-flex justify-content-between mb-3">
        <p className="pagetitle mb-0 fnt-color">Customer</p>
        <div>
          <button
            type="button"
            onClick={() => router.push("/dashboard/customers")}
            className="form-cancel-btn d-inline-flex align-items-center gap-2 bg-white border rounded-3 text-muted fs-14 px-3 py-2"
          >
            <i className="bi bi-arrow-left" aria-hidden="true"></i>
            Back
          </button>
        </div>
      </div>

      {loading ? (
        <div className="d-flex align-items-center gap-2 text-secondary">
          <span className="spinner-border spinner-border-sm"></span>
          Loading customer...
        </div>
      ) : !customer ? (
        <p className="text-secondary">Customer not found.</p>
      ) : (
        <div className="row g-3">
          <div className="col-12 col-lg-5">
            <div className="bg-white border-0 shadow-none rounded-4 p-4 mb-3">
              <h5 className="mb-3 fs-18 fw-semibold fnt-color">Profile</h5>
              <div>
                <form onSubmit={handleSave}>
                  <label className="form-label" htmlFor="full_name">
                    Full name
                  </label>
                  <input
                    id="full_name"
                    type="text"
                    className="form-control mb-3"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={!canManage}
                  />

                  <label className="form-label" htmlFor="phone_number">
                    Phone number
                  </label>
                  <input
                    id="phone_number"
                    type="text"
                    className="form-control mb-1"
                    value={formatPhone(customer.phone_number)}
                    readOnly
                    disabled
                  />
                  <p className="text-secondary small mb-3">
                    Phone is the login identifier and cannot be changed here.
                  </p>

                  {canManage ? (
                    <button
                      type="submit"
                      className="btn-orange text-white fs-16 text-nowrap"
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save changes"}
                    </button>
                  ) : null}
                </form>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-7">
            <div className="row g-3 mb-1">
              <div className="col-6 col-md-4">
                <div className="bg-white border-0 shadow-none rounded-4 p-4 text-center h-100">
                  <div className="fs-24 fw-semibold fnt-color">
                    {customer.order_count}
                  </div>
                  <div className="text-secondary small">Orders</div>
                </div>
              </div>
              <div className="col-6 col-md-4">
                <div className="bg-white border-0 shadow-none rounded-4 p-4 text-center h-100">
                  <div className="fs-24 fw-semibold fnt-color">
                    {money(customer.total_spent)}
                  </div>
                  <div className="text-secondary small">Total spent</div>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="bg-white border-0 shadow-none rounded-4 p-4 text-center h-100">
                  <div className="fs-16 fw-semibold fnt-color">
                    {formatDate(customer.last_order_at)}
                  </div>
                  <div className="text-secondary small">Last order</div>
                </div>
              </div>
            </div>

            <div className="bg-white border-0 shadow-none rounded-4 p-4 mt-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0 fs-18 fw-semibold fnt-color">Recent orders</h5>
                <span className="text-secondary small">
                  Joined {formatDate(customer.created_at)}
                </span>
              </div>
              <div>
                {recentOrders.length === 0 ? (
                  <p className="text-secondary mb-0">No orders yet.</p>
                ) : (
                  <div className="table-responsive">
                    <div className="data-table">
                    <table className="table datatable-wrapper mb-0">
                      <thead>
                        <tr>
                          <th className="fw-medium fs-14 fnt-color text-nowrap">
                            Order #
                          </th>
                          <th className="fw-medium fs-14 fnt-color text-nowrap">
                            Status
                          </th>
                          <th className="fw-medium fs-14 fnt-color text-nowrap">
                            Total
                          </th>
                          <th className="fw-medium fs-14 fnt-color text-nowrap">
                            Date
                          </th>
                          <th className="fw-medium fs-14 fnt-color text-nowrap"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((order) => (
                          <tr key={order.order_number}>
                            <td className="fw-normal fs-14 fnt-color">
                              {order.order_number}
                            </td>
                            <td className="fw-normal fs-14 fnt-color text-nowrap">
                              {order.status}
                            </td>
                            <td className="fw-normal fs-14 fnt-color text-nowrap">
                              {money(order.totals?.total)}
                            </td>
                            <td className="fw-normal fs-14 fnt-color text-nowrap">
                              {formatDate(order.created_at)}
                            </td>
                            <td>
                              <Link
                                href={`/dashboard/orders/${order.order_number}/view`}
                                className="text-primary text-decoration-none"
                                title="View order"
                              >
                                <i className="bi bi-eye"></i>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" />
    </section>
  );
}
