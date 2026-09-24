"use client";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { confirmDialog } from "@/components/dashboard/shared/ConfirmDialog";
import Offcanvas from "react-bootstrap/Offcanvas";
import useAxiosConfig from "@/hooks/useAxiosConfig";
import {
  deletePromotionByIdRoute,
  getBranchesRoute,
  getProductsRoute,
  getPromotionsRoute,
  updatePromotionByIdRoute,
  upsertPromotionRoute,
} from "@/utils/apiRoutes";
import StatusToggle from "@/components/dashboard/shared/StatusToggle";
import ChipMultiSelect from "@/components/dashboard/shared/ChipMultiSelect";
import marbleUploadUrl from "@/utils/marbleUploadUrl";

const RULE_TYPES = [
  { value: "percentage_discount", label: "Percentage discount" },
  { value: "fixed_amount", label: "Fixed amount" },
  { value: "bogo", label: "Buy One Get One (free product)" },
  { value: "free_shipping", label: "Free shipping" },
  { value: "ice_cream_bogo", label: "Ice cream BOGO (half units free)" },
  { value: "next_order_coupon", label: "Next-order coupon" },
];

const EMPTY_FORM = {
  rule_type: "percentage_discount",
  threshold: 0,
  percent_discount: 0,
  fixed_amount: 0,
  coupon_amount: 0,
  coupon_expiry_days: 0,
  start_date: "",
  end_date: "",
  usage_limit: "",
  status: true,
  applicable_product_ids: [],
  free_product_ids: [],
  branch_ids: [],
};

function normalizeIds(ids) {
  if (!Array.isArray(ids)) return [];
  return ids
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id) && id > 0);
}

function toForm(rule) {
  if (!rule) return { ...EMPTY_FORM };
  return {
    rule_type: rule.rule_type,
    threshold: rule.threshold ?? 0,
    percent_discount: rule.percent_discount ?? 0,
    fixed_amount: rule.fixed_amount ?? 0,
    coupon_amount: rule.coupon_amount ?? 0,
    coupon_expiry_days: rule.coupon_expiry_days ?? 0,
    start_date: rule.start_date ? String(rule.start_date).slice(0, 10) : "",
    end_date: rule.end_date ? String(rule.end_date).slice(0, 10) : "",
    usage_limit: rule.usage_limit ?? "",
    status: rule.status !== false,
    applicable_product_ids: normalizeIds(rule.applicable_product_ids),
    free_product_ids: normalizeIds(rule.free_product_ids),
    branch_ids: normalizeIds(rule.branch_ids),
  };
}

function toPayload(form) {
  return {
    rule_type: form.rule_type,
    threshold: Number(form.threshold) || 0,
    percent_discount: Number(form.percent_discount) || 0,
    fixed_amount: Number(form.fixed_amount) || 0,
    coupon_amount: Number(form.coupon_amount) || 0,
    coupon_expiry_days: Number(form.coupon_expiry_days) || 0,
    start_date: form.start_date || null,
    end_date: form.end_date || null,
    usage_limit: form.usage_limit === "" ? null : Number(form.usage_limit),
    status: Boolean(form.status),
    applicable_product_ids: normalizeIds(form.applicable_product_ids),
    free_product_ids: normalizeIds(form.free_product_ids),
    branch_ids: normalizeIds(form.branch_ids),
  };
}

function productLabel(product) {
  const name = product.name_en || product.name_ar || product.title || "Product";
  return `#${product.id} — ${name}`;
}

function productImage(product) {
  return (
    marbleUploadUrl(product.image_url) ||
    marbleUploadUrl(product.thumbnail_url) ||
    "/assets/images/Cake-type.svg"
  );
}

function branchLabel(branch) {
  const name = branch.name_en || branch.name_ar || "Branch";
  const city = branch.city?.name_en || branch.city || "";
  return city ? `#${branch.id} — ${name} (${city})` : `#${branch.id} — ${name}`;
}

export default function PromotionsPage() {
  const { token } = useAxiosConfig();
  const [rules, setRules] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);

  const productOptions = useMemo(
    () =>
      products.map((product) => ({
        id: product.id,
        label: productLabel(product),
        image: productImage(product),
        searchText: [
          product.name_en,
          product.name_ar,
          product.sku,
          product.slug,
        ]
          .filter(Boolean)
          .join(" "),
      })),
    [products],
  );

  const branchOptions = useMemo(
    () =>
      branches.map((branch) => ({
        id: branch.id,
        label: branchLabel(branch),
      })),
    [branches],
  );

  const fetchRules = async () => {
    if (!token) return;
    try {
      const response = await axios.get(getPromotionsRoute);
      setRules(response.data.data || []);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load promotions.",
      );
    }
  };

  const fetchSelectOptions = async () => {
    if (!token) return;
    try {
      const [productsRes, branchesRes] = await Promise.all([
        axios.get(getProductsRoute, {
          params: { limit: 500, sortField: "id", sortOrder: "ASC" },
        }),
        axios.get(getBranchesRoute, {
          params: { limit: 500, sortField: "name_en", sortOrder: "ASC" },
        }),
      ]);
      setProducts(productsRes.data?.data || []);
      setBranches(branchesRes.data?.data || []);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load products/branches.",
      );
    }
  };

  useEffect(() => {
    fetchRules();
    fetchSelectOptions();
  }, [token]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setShowOffcanvas(true);
  };

  const openEdit = (rule) => {
    setEditingId(rule.id);
    setForm(toForm(rule));
    setShowOffcanvas(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = toPayload(form);
      if (editingId) {
        await axios.put(updatePromotionByIdRoute(editingId), payload);
        toast.success("Promotion updated!", { autoClose: 1000 });
      } else {
        await axios.post(upsertPromotionRoute, payload);
        toast.success("Promotion saved!", { autoClose: 1000 });
      }
      setShowOffcanvas(false);
      fetchRules();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to save promotion.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!(await confirmDialog({ message: "Delete this promotion rule?" }))) return;
    try {
      await axios.delete(deletePromotionByIdRoute(id));
      toast.success("Promotion deleted!", { autoClose: 1000 });
      setRules((prev) => prev.filter((rule) => rule.id !== id));
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to delete promotion.",
      );
    }
  };

  const handleStatusToggle = async (rule, nextStatus) => {
    const previous = rule.status !== false;
    setRules((prev) =>
      prev.map((row) =>
        row.id === rule.id ? { ...row, status: nextStatus } : row,
      ),
    );
    try {
      await axios.put(updatePromotionByIdRoute(rule.id), {
        status: nextStatus,
      });
    } catch (error) {
      setRules((prev) =>
        prev.map((row) =>
          row.id === rule.id ? { ...row, status: previous } : row,
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
          <p className="pagetitle mb-0 fnt-color">Promotions</p>
          <button
            type="button"
            className="btn-orange text-white fs-16"
            onClick={openCreate}
          >
            <i className="bi bi-plus-circle me-2"></i>Create
          </button>
        </div>
        <p className="text-secondary small mb-3">
          One rule per type (Promotional Discounts). Empty dates mean always
          active while status is on.
        </p>
      </div>

      <div className="px-0 pt-0 rounded-2 p-0 mt-3">
        <div className="table-responsive">
          <div className="data-table">
            <table className="table datatable-wrapper">
              <thead>
                <tr>
                  <th className="fw-medium fs-14 fnt-color text-nowrap">Type</th>
                  <th className="fw-medium fs-14 fnt-color text-nowrap">Threshold</th>
                  <th className="fw-medium fs-14 fnt-color text-nowrap">Details</th>
                  <th className="fw-medium fs-14 fnt-color text-nowrap">Dates</th>
                  <th className="fw-medium fs-14 fnt-color text-nowrap">Status</th>
                  <th className="fw-medium fs-14 fnt-color text-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rules.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-secondary">
                      No promotion rules yet.
                    </td>
                  </tr>
                ) : (
                  rules.map((rule) => (
                    <tr key={rule.id}>
                      <td className="fw-normal fs-14 fnt-color">
                        {rule.rule_type}
                      </td>
                      <td className="fw-normal fs-14 fnt-color">
                        {rule.threshold}
                      </td>
                      <td className="fw-normal fs-14 fnt-color">
                        {rule.rule_type === "percentage_discount" &&
                          `${rule.percent_discount}%`}
                        {rule.rule_type === "fixed_amount" &&
                          `${rule.fixed_amount} SR`}
                        {rule.rule_type === "bogo" &&
                          `free: ${(rule.free_product_ids || []).join(",")}`}
                        {rule.rule_type === "next_order_coupon" &&
                          `${rule.coupon_amount} SR / ${rule.coupon_expiry_days}d`}
                        {rule.rule_type === "ice_cream_bogo" &&
                          "half cheapest units"}
                        {rule.rule_type === "free_shipping" && "shipping = 0"}
                      </td>
                      <td className="fw-normal fs-14 fnt-color">
                        {rule.start_date || "—"} → {rule.end_date || "—"}
                      </td>
                      <td className="fw-normal fs-14 fnt-color">
                        <StatusToggle
                          id={`status-${rule.id}`}
                          showLabel={false}
                          checked={rule.status !== false}
                          onChange={(checked) =>
                            handleStatusToggle(rule, checked)
                          }
                          aria-label="Toggle status"
                        />
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <div
                            className="action-btn d-flex justify-content-center align-items-center bg-transparent rounded-2"
                            onClick={() => openEdit(rule)}
                            role="button"
                            title="Edit"
                          >
                            <i className="bi bi-pencil-square text-primary"></i>
                          </div>
                          <div
                            className="action-btn d-flex justify-content-center align-items-center bg-transparent rounded-2"
                            onClick={() => handleDelete(rule.id)}
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

      <Offcanvas
        show={showOffcanvas}
        onHide={() => setShowOffcanvas(false)}
        placement="end"
        style={{ width: "min(640px, 100vw)" }}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            <div className="fs-24 fnt-color">
              {editingId ? "Update Promotion" : "Add Promotion"}
            </div>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <hr className="mt-0" />
        <Offcanvas.Body>
          <form className="mt-0" onSubmit={handleSave}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">
                  Rule type
                </label>
                <select
                  className="form-select textarea-hover-dark text-secondary"
                  value={form.rule_type}
                  disabled={Boolean(editingId)}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      rule_type: event.target.value,
                    }))
                  }
                >
                  {RULE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">
                  Minimum spend / threshold
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-control form-control-lg textarea-hover-dark text-secondary"
                  value={form.threshold}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      threshold: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  Percent discount
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-control form-control-lg textarea-hover-dark text-secondary"
                  value={form.percent_discount}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      percent_discount: event.target.value,
                    }))
                  }
                  disabled={form.rule_type !== "percentage_discount"}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">
                  Fixed amount (SR)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-control form-control-lg textarea-hover-dark text-secondary"
                  value={form.fixed_amount}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      fixed_amount: event.target.value,
                    }))
                  }
                  disabled={form.rule_type !== "fixed_amount"}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  Next-order coupon amount
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-control form-control-lg textarea-hover-dark text-secondary"
                  value={form.coupon_amount}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      coupon_amount: event.target.value,
                    }))
                  }
                  disabled={form.rule_type !== "next_order_coupon"}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">
                  Coupon expiry days
                </label>
                <input
                  type="number"
                  min="0"
                  className="form-control form-control-lg textarea-hover-dark text-secondary"
                  value={form.coupon_expiry_days}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      coupon_expiry_days: event.target.value,
                    }))
                  }
                  disabled={form.rule_type !== "next_order_coupon"}
                />
              </div>

              <div className="col-12">
                <ChipMultiSelect
                  label="Applicable products"
                  options={productOptions}
                  selectedIds={form.applicable_product_ids}
                  onChange={(ids) =>
                    setForm((current) => ({
                      ...current,
                      applicable_product_ids: ids,
                    }))
                  }
                  placeholder="Search products by name, SKU, or ID…"
                  showImages
                />
              </div>
              <div className="col-12">
                <ChipMultiSelect
                  label="Free products (BOGO)"
                  options={productOptions}
                  selectedIds={form.free_product_ids}
                  onChange={(ids) =>
                    setForm((current) => ({
                      ...current,
                      free_product_ids: ids,
                    }))
                  }
                  placeholder="Search free products by name, SKU, or ID…"
                  disabled={form.rule_type !== "bogo"}
                  showImages
                />
              </div>
              <div className="col-12">
                <ChipMultiSelect
                  label="Branches"
                  options={branchOptions}
                  selectedIds={form.branch_ids}
                  onChange={(ids) =>
                    setForm((current) => ({
                      ...current,
                      branch_ids: ids,
                    }))
                  }
                  placeholder="Search branches by name or ID…"
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
                  Start date
                </label>
                <input
                  type="date"
                  className="form-control form-control-lg textarea-hover-dark text-secondary"
                  value={form.start_date}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      start_date: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">
                  End date
                </label>
                <input
                  type="date"
                  className="form-control form-control-lg textarea-hover-dark text-secondary"
                  value={form.end_date}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      end_date: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="col-12">
                <StatusToggle
                  id="promo-status"
                  checked={form.status}
                  onChange={(checked) =>
                    setForm((current) => ({
                      ...current,
                      status: checked,
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
