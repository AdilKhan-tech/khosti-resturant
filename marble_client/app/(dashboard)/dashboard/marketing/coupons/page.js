"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { confirmDialog } from "@/components/dashboard/shared/ConfirmDialog";
import useAxiosConfig from "@/hooks/useAxiosConfig";
import {
  createCouponRoute,
  deleteCouponByIdRoute,
  getCouponsRoute,
  updateCouponByIdRoute,
} from "@/utils/apiRoutes";
import Offcanvas from "react-bootstrap/Offcanvas";
import Pagination from "@/components/dashboard/shared/Pagination";
import EntriesPerPageSelector from "@/components/dashboard/shared/EntriesPerPageSelector";
import StatusToggle from "@/components/dashboard/shared/StatusToggle";

const EMPTY_FORM = {
  code: "",
  description: "",
  discount_type: "percent",
  amount: 10,
  min_spend: 0,
  max_spend: "",
  usage_limit: "",
  usage_limit_per_user: "",
  free_shipping: false,
  expires_at: "",
  status: "active",
};

function toForm(coupon) {
  if (!coupon) return { ...EMPTY_FORM };
  return {
    code: coupon.code || "",
    description: coupon.description || "",
    discount_type: coupon.discount_type || "percent",
    amount: coupon.amount ?? 0,
    min_spend: coupon.min_spend ?? 0,
    max_spend: coupon.max_spend ?? "",
    usage_limit: coupon.usage_limit ?? "",
    usage_limit_per_user: coupon.usage_limit_per_user ?? "",
    free_shipping: Boolean(coupon.free_shipping),
    expires_at: coupon.expires_at
      ? String(coupon.expires_at).slice(0, 10)
      : "",
    status: coupon.status || "active",
  };
}

function toPayload(form) {
  return {
    code: form.code,
    description: form.description || undefined,
    discount_type: form.discount_type,
    amount: Number(form.amount) || 0,
    min_spend: Number(form.min_spend) || 0,
    max_spend: form.max_spend === "" ? null : Number(form.max_spend),
    usage_limit: form.usage_limit === "" ? null : Number(form.usage_limit),
    usage_limit_per_user:
      form.usage_limit_per_user === ""
        ? null
        : Number(form.usage_limit_per_user),
    free_shipping: Boolean(form.free_shipping),
    expires_at: form.expires_at || null,
    status: form.status,
  };
}

export default function CouponsPage() {
  const { token } = useAxiosConfig();
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [keywords, setKeywords] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(25);
  const [totalEntries, setTotalEntries] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [saving, setSaving] = useState(false);

  const fetchCoupons = async () => {
    if (!token) return;
    try {
      const response = await axios.get(getCouponsRoute, {
        params: {
          page: currentPage,
          limit: pageLimit,
          keywords,
          sortField: "id",
          sortOrder: "DESC",
        },
      });
      setCoupons(response.data.data || []);
      setTotalEntries(response.data.pagination?.total || 0);
      setPageCount(response.data.pagination?.pageCount || 0);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load coupons.",
      );
    }
  };

  useEffect(() => {
    const delay = setTimeout(fetchCoupons, keywords ? 400 : 0);
    return () => clearTimeout(delay);
  }, [token, currentPage, pageLimit, keywords]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setShowOffcanvas(true);
  };

  const openEdit = (coupon) => {
    setEditingId(coupon.id);
    setForm(toForm(coupon));
    setShowOffcanvas(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = toPayload(form);
      if (editingId) {
        await axios.put(updateCouponByIdRoute(editingId), payload);
        toast.success("Coupon updated!", { autoClose: 1000 });
      } else {
        await axios.post(createCouponRoute, payload);
        toast.success("Coupon created!", { autoClose: 1000 });
      }
      setShowOffcanvas(false);
      fetchCoupons();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to save coupon.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!(await confirmDialog({ message: "Delete this coupon?" }))) return;
    try {
      await axios.delete(deleteCouponByIdRoute(id));
      toast.success("Coupon deleted!", { autoClose: 1000 });
      setCoupons((prev) => prev.filter((coupon) => coupon.id !== id));
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to delete coupon.",
      );
    }
  };

  const handleStatusToggle = async (coupon, nextActive) => {
    const nextStatus = nextActive ? "active" : "inactive";
    const previous = coupon.status;
    setCoupons((prev) =>
      prev.map((row) =>
        row.id === coupon.id ? { ...row, status: nextStatus } : row,
      ),
    );
    try {
      await axios.put(updateCouponByIdRoute(coupon.id), {
        status: nextStatus,
      });
    } catch (error) {
      setCoupons((prev) =>
        prev.map((row) =>
          row.id === coupon.id ? { ...row, status: previous } : row,
        ),
      );
      toast.error(
        error?.response?.data?.message || "Failed to update status.",
      );
    }
  };

  return (
    <section className="mt-3">
      <div className="">
        <div className="d-flex justify-content-between mb-3">
          <p className="pagetitle mb-0 fnt-color">Coupons</p>
          <button
            type="button"
            className="btn-orange text-white fs-16"
            onClick={openCreate}
          >
            <i className="bi bi-plus-circle me-2"></i>Create
          </button>
        </div>
      </div>

      <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
        <input
          className="form-control"
          style={{ maxWidth: 280 }}
          placeholder="Search code…"
          value={keywords}
          onChange={(event) => {
            setCurrentPage(1);
            setKeywords(event.target.value);
          }}
        />
        <EntriesPerPageSelector
          pageLimit={pageLimit}
          onPageLimitChange={(limit) => {
            setCurrentPage(1);
            setPageLimit(limit);
          }}
        />
      </div>

      <div className="px-0 pt-0 rounded-2 p-0 mt-3">
        <div className="table-responsive">
          <div className="data-table">
            <table className="table datatable-wrapper">
              <thead>
                <tr>
                  <th className="fw-medium fs-14 fnt-color text-nowrap">Code</th>
                  <th className="fw-medium fs-14 fnt-color text-nowrap">Type</th>
                  <th className="fw-medium fs-14 fnt-color text-nowrap">Amount</th>
                  <th className="fw-medium fs-14 fnt-color text-nowrap">Min spend</th>
                  <th className="fw-medium fs-14 fnt-color text-nowrap">Usage</th>
                  <th className="fw-medium fs-14 fnt-color text-nowrap">Status</th>
                  <th className="fw-medium fs-14 fnt-color text-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-secondary">
                      No coupons yet.
                    </td>
                  </tr>
                ) : (
                  coupons.map((coupon) => (
                    <tr key={coupon.id}>
                      <td className="fw-normal fs-14 fnt-color">
                        {coupon.code}
                      </td>
                      <td className="fw-normal fs-14 fnt-color">
                        {coupon.discount_type}
                      </td>
                      <td className="fw-normal fs-14 fnt-color">
                        {coupon.discount_type === "percent"
                          ? `${coupon.amount}%`
                          : `${coupon.amount} SR`}
                        {coupon.free_shipping ? " + free shipping" : ""}
                      </td>
                      <td className="fw-normal fs-14 fnt-color">
                        {coupon.min_spend || 0}
                      </td>
                      <td className="fw-normal fs-14 fnt-color">
                        {coupon.usage_count}
                        {coupon.usage_limit != null
                          ? ` / ${coupon.usage_limit}`
                          : ""}
                      </td>
                      <td className="fw-normal fs-14 fnt-color">
                        <StatusToggle
                          id={`status-${coupon.id}`}
                          showLabel={false}
                          checked={coupon.status === "active"}
                          onChange={(checked) =>
                            handleStatusToggle(coupon, checked)
                          }
                          aria-label="Toggle status"
                        />
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <div
                            className="action-btn d-flex justify-content-center align-items-center bg-transparent rounded-2"
                            onClick={() => openEdit(coupon)}
                            role="button"
                            title="Edit"
                          >
                            <i className="bi bi-pencil-square text-primary"></i>
                          </div>
                          <div
                            className="action-btn d-flex justify-content-center align-items-center bg-transparent rounded-2"
                            onClick={() => handleDelete(coupon.id)}
                            role="button"
                            title="Delete"
                          >
                            <i className="bi bi-trash text-danger"></i>
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

      {pageCount > 1 && (
        <div className="mt-3">
          <Pagination
            currentPage={currentPage}
            pageCount={pageCount}
            totalEntries={totalEntries}
            pageLimit={pageLimit}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <Offcanvas
        show={showOffcanvas}
        onHide={() => setShowOffcanvas(false)}
        placement="end"
        style={{ width: "min(640px, 100vw)" }}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            <div className="fs-24 fnt-color">
              {editingId ? "Update Coupon" : "Add Coupon"}
            </div>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <hr className="mt-0" />
        <Offcanvas.Body>
          <form className="mt-0" onSubmit={handleSave}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">
                  Code
                </label>
                <input
                  className="form-control form-control-lg textarea-hover-dark text-secondary"
                  value={form.code}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      code: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">
                  Description
                </label>
                <input
                  className="form-control form-control-lg textarea-hover-dark text-secondary"
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  Discount type
                </label>
                <select
                  className="form-select textarea-hover-dark text-secondary"
                  value={form.discount_type}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      discount_type: event.target.value,
                    }))
                  }
                >
                  <option value="percent">Percent</option>
                  <option value="fixed_cart">Fixed cart</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">
                  Amount{form.discount_type === "percent" ? " (%)" : " (SR)"}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-control form-control-lg textarea-hover-dark text-secondary"
                  value={form.amount}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      amount: event.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  Minimum spend (SR)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-control form-control-lg textarea-hover-dark text-secondary"
                  value={form.min_spend}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      min_spend: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">
                  Maximum spend (optional)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-control form-control-lg textarea-hover-dark text-secondary"
                  value={form.max_spend}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      max_spend: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  Usage limit (optional)
                </label>
                <input
                  type="number"
                  min="0"
                  className="form-control form-control-lg textarea-hover-dark text-secondary"
                  value={form.usage_limit}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      usage_limit: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">
                  Per-user limit (optional)
                </label>
                <input
                  type="number"
                  min="0"
                  className="form-control form-control-lg textarea-hover-dark text-secondary"
                  value={form.usage_limit_per_user}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      usage_limit_per_user: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  Expires on (optional)
                </label>
                <input
                  type="date"
                  className="form-control form-control-lg textarea-hover-dark text-secondary"
                  value={form.expires_at}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      expires_at: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="col-md-6 d-flex align-items-end">
                <StatusToggle
                  id="coupon-free-shipping"
                  label="Free shipping"
                  className="mb-2"
                  checked={form.free_shipping}
                  onChange={(checked) =>
                    setForm((current) => ({
                      ...current,
                      free_shipping: checked,
                    }))
                  }
                />
              </div>

              <div className="col-12">
                <StatusToggle
                  id="coupon-status"
                  checked={form.status === "active"}
                  onChange={(checked) =>
                    setForm((current) => ({
                      ...current,
                      status: checked ? "active" : "inactive",
                    }))
                  }
                />
              </div>
            </div>

            <hr className="mt-4 mb-3" />
            <div className="d-flex align-items-center justify-content-between">
              <button
                type="submit"
                className="form-submit-btn form-submit-btn-size d-inline-flex align-items-center justify-content-center gap-2 border-0 text-white fs-16 fw-medium rounded-3"
                disabled={saving}
              >
                <i className="bi bi-send-fill" aria-hidden="true"></i>{" "}
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                className="form-cancel-btn form-cancel-btn-size d-inline-flex align-items-center gap-2 bg-white border rounded-3 text-muted fs-14 px-3"
                onClick={() => setShowOffcanvas(false)}
              >
                <i className="bi bi-x-circle" aria-hidden="true"></i> Cancel
              </button>
            </div>
          </form>
        </Offcanvas.Body>
      </Offcanvas>

      <ToastContainer />
    </section>
  );
}
