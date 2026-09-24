"use client";

import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import useAxiosConfig from "@/hooks/useAxiosConfig";
import { getOrderByNumberRoute, getOrderStatusesRoute, sendOrderQuotationRoute, updateOrderStatusRoute } from "@/utils/apiRoutes";
import { printOrder } from "@/utils/orderPrint";

function money(value, currency = "SR") {
  return `${Number(value || 0).toFixed(2)} ${currency}`;
}

function formatPhone(phone) {
  if (!phone) return "N/A";
  const value = String(phone);
  if (value.startsWith("+966")) return value;
  return `+966 ${value.replace(/^0+/, "")}`;
}

function formatDate(value) {
  if (!value) return "N/A";
  return new Date(value).toLocaleString("en", {
    month: "long",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusClass(status) {
  if (["cancelled", "failed", "refunded"].includes(status)) return "red-status";
  return "blue-status";
}

const QUOTATION_SEND_STATUSES = ["cstm-cake-request", "qfa", "afa"];
const HIDDEN_OPTION_KEYS = new Set(["sketch_url", "custom_price"]);
const OPTION_LABELS = {
  cake_type: "Cake Type",
  cake_size: "Cake Size",
  cake_flavor: "Cake Flavor",
  cake_text: "Text",
  cake_note: "Note",
  color_text: "Text Color",
  border_color: "Border Color",
  product_size: "Size",
  product_flavor: "Flavor",
  product_text: "Text",
  product_notes: "Note",
  product_note: "Note",
  product_portion_size: "Portion Size",
  ice_size: "Portion Size",
  icecream_bucket_option: "Bucket",
  icecream_flavor_items: "Flavors",
  icecream_mixin_items: "Mix-ins",
  icecream_sauce_items: "Sauces",
  cookies_box_type_option: "Box Type",
  cookies_box_size_option: "Box Size",
  cookies_items: "Cookies",
};

function optionKeyLabel(key) {
  return OPTION_LABELS[key] || key.replaceAll("_", " ");
}

function localizedValue(englishValue, arabicValue, language = "en") {
  return (language === "ar" ? arabicValue : englishValue) || englishValue || arabicValue || "";
}

function optionLabel(value, language = "en") {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    return value
      .map((item) => localizedValue(item?.name_en || item?.slug, item?.name_ar, language))
      .filter(Boolean)
      .join(", ");
  }
  return localizedValue(value.name_en || value.slug, value.name_ar, language);
}

function ItemOptions({ options = {}, language = "en" }) {
  const rows = Object.entries(options)
    .filter(([key]) => !HIDDEN_OPTION_KEYS.has(key))
    .map(([key, value]) => [key, optionKeyLabel(key), optionLabel(value, language)])
    .filter(([, , value]) => value);
  const sketchUrl = options.sketch_url;

  if (!rows.length && !sketchUrl) return <span className="text-muted">No options</span>;

  return (
    <div className="d-flex flex-column gap-2 small">
      {rows.map(([key, label, value]) => (
        <div key={key} className="d-flex flex-column">
          <span className="fw-semibold text-dark">{label}</span>
          <span className="text-muted">{value}</span>
        </div>
      ))}
      {sketchUrl && (
        <div className="mt-2">
          <span className="fw-semibold d-block mb-1 text-dark">Sketch</span>
          <a href={sketchUrl} target="_blank" rel="noreferrer" className="d-inline-block">
            <img
              src={sketchUrl}
              className="d-block rounded-3 bg-light border dashboard-thumb-120x90 object-fit-cover"
              alt="Custom cake sketch"
            />
          </a>
        </div>
      )}
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="col-xl-3 col-md-6">
      <div className="order-info-box bg-light border-0 shadow-none p-3 rounded-3 h-100">
        <p className="text-dark fs-16 fw-medium mb-0 text-break">{value || "N/A"}</p>
        <h6 className="fs-14 fw-normal mt-2 mb-0 text-muted">{label}</h6>
      </div>
    </div>
  );
}

function orderItemName(item, language = "en") {
  return localizedValue(item?.name_en, item?.name_ar, language);
}

export default function OrderViewPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAxiosConfig();
  const orderNumber = params?.orderNumber;
  const [order, setOrder] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [statusLabels, setStatusLabels] = useState({});
  const [quoteAmount, setQuoteAmount] = useState("");
  const [quoteNote, setQuoteNote] = useState("");
  const [isSendingQuote, setIsSendingQuote] = useState(false);
  const [loading, setLoading] = useState(true);
  const [printingSize, setPrintingSize] = useState("");

  const handlePrint = async (size) => {
    if (!order?.order_number) return;
    setPrintingSize(size);
    try {
      await printOrder(order.order_number, size);
    } catch (error) {
      console.error("Error printing order", error);
      toast.error(
        error?.response?.data?.message || "Failed to print order.",
      );
    } finally {
      setPrintingSize("");
    }
  };

  const fetchOrder = useCallback(async () => {
    if (!orderNumber) return;
    try {
      const response = await axios.get(getOrderByNumberRoute(orderNumber));
      setOrder(response.data.data);
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("Failed to load order details.");
    } finally {
      setLoading(false);
    }
  }, [orderNumber]);

  const fetchStatuses = useCallback(async () => {
    if (!token) return;
    try {
      const response = await axios.get(getOrderStatusesRoute);
      const options = response.data.data || [];
      setStatuses(options);
      setStatusLabels(
        options.reduce((labels, option) => ({
          ...labels,
          [option.value]: option.label,
        }), {}),
      );
    } catch (error) {
      console.error("Error fetching order statuses", error);
      toast.error("Failed to load order statuses.");
    }
  }, [token]);

  useEffect(() => {
    if (!token || !orderNumber) return;
    fetchOrder();
    fetchStatuses();
  }, [fetchOrder, fetchStatuses, orderNumber, token]);

  const updateStatus = async (nextStatus) => {
    try {
      const response = await axios.put(updateOrderStatusRoute(order.order_number), { status: nextStatus });
      setOrder(response.data.data);
      toast.success("Order status updated successfully!", { autoClose: 1000 });
    } catch (error) {
      console.error("Error updating order status", error);
      toast.error("Failed to update order status.");
    }
  };

  const sendQuotation = async (event) => {
    event.preventDefault();
    setIsSendingQuote(true);
    try {
      const response = await axios.put(sendOrderQuotationRoute(order.order_number), {
        amount: quoteAmount,
        note: quoteNote,
      });
      setOrder(response.data.data);
      setQuoteAmount("");
      setQuoteNote("");
      toast.success("Quotation sent successfully!", { autoClose: 1000 });
    } catch (error) {
      console.error("Error sending quotation", error);
      toast.error(error?.response?.data?.message || "Failed to send quotation.");
    } finally {
      setIsSendingQuote(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-50">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          Failed to load order details. Please try again.
        </div>
      </div>
    );
  }

  const canSendQuotation = Boolean(
    order.quote?.is_custom_cake && QUOTATION_SEND_STATUSES.includes(order.status),
  );
  const orderLanguage = order.language === "ar" ? "ar" : "en";

  return (
    <div className="container-fluid py-4 order-view-page">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2 mb-3">
        <div>
          <p className="pagetitle mb-0 fnt-color">Order Details</p>
        </div>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn btn-outline-secondary d-flex align-items-center rounded-3"
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back
        </button>
      </div>

      <div className="card bg-transparent border-0 shadow-none mt-3">
        <div className="card-body px-0 pt-0">
          <div className="bg-white border-0 shadow-none rounded-4 p-4 mb-4">
          <div className="d-flex justify-content-between flex-wrap gap-3">
            <div>
              <h5 className="mb-1 fs-18 fw-semibold fnt-color">Order #{order.order_number}</h5>
              <p className="text-muted fs-14 mb-0">Complete information about this order</p>
            </div>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <button
                type="button"
                className="btn btn-outline-secondary rounded-3 fs-14"
                onClick={() => handlePrint("a4")}
                disabled={printingSize === "a4"}
              >
                <i className="bi bi-printer me-1" aria-hidden="true"></i>
                {printingSize === "a4" ? "Printing..." : "Print A4"}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary rounded-3 fs-14"
                onClick={() => handlePrint("small")}
                disabled={printingSize === "small"}
              >
                <i className="bi bi-receipt me-1" aria-hidden="true"></i>
                {printingSize === "small" ? "Printing..." : "Print Small"}
              </button>
              <span
                className={`${statusClass(order.status)} d-inline-flex align-items-center justify-content-center w-auto text-nowrap flex-shrink-0 dashboard-status-pill`}
              >
                {statusLabels[order.status] || order.status}
              </span>
              <select
                className="form-select textarea-hover-dark text-secondary w-auto mt-0 text-nowrap flex-shrink-0"
                value={order.status}
                onChange={(event) => updateStatus(event.target.value)}
              >
                {statuses.length === 0 && (
                  <option value={order.status}>
                    {statusLabels[order.status] || order.status}
                  </option>
                )}
                {statuses.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <hr className="my-4" />

          <div className="row g-3">
            <InfoCard label="Customer Name" value={order.billing?.full_name || order.customer?.full_name} />
            <InfoCard label="Customer Phone" value={formatPhone(order.billing?.phone || order.customer?.phone_number)} />
            <InfoCard label="Order Date" value={formatDate(order.created_at)} />
            <InfoCard label="Payment Method" value={order.payment_method_title} />
            <InfoCard label="Receiving Type" value={order.receiving_info?.address_type} />
            <InfoCard label="City" value={order.receiving_info?.branch_city} />
            <InfoCard label="Branch" value={order.receiving_info?.nearest_branch} />
            <InfoCard label="Time Slot" value={order.receiving_info?.selected_time_slot} />
          </div>

          <div className="row g-3 mt-3">
            <div className="col-md-8">
              <div className="order-info-box bg-light border-0 shadow-none p-3 rounded-3 h-100">
                <p className="text-dark fs-16 fw-medium mb-0">{order.receiving_info?.address || "N/A"}</p>
                <h6 className="fs-14 fw-normal mt-2 mb-0 text-muted">Address</h6>
              </div>
            </div>
            <div className="col-md-4">
              <div className="order-info-box bg-light border-0 shadow-none p-3 rounded-3 h-100">
                <p className="text-dark fs-16 fw-medium mb-0">
                  {money(order.totals?.total, order.currency)}
                </p>
                <h6 className="fs-14 fw-normal mt-2 mb-0 text-muted">Order Total</h6>
              </div>
            </div>
          </div>

          {order.receiving_info?.is_send_for_someone_checked && (
            <div className="row g-3 mt-3">
              <InfoCard label="Recipient Name" value={order.receiving_info?.recipient_name} />
              <InfoCard label="Recipient Phone" value={formatPhone(order.receiving_info?.recipient_phone)} />
            </div>
          )}
          {canSendQuotation && (
            <form className="row g-3 mt-3" onSubmit={sendQuotation}>
              <div className="col-md-4">
                <div className="order-info-box bg-light border-0 shadow-none p-3 rounded-3 h-100">
                  <label className="fs-14 fw-normal text-muted mb-2">Quotation Amount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-control"
                    value={quoteAmount}
                    onChange={(event) => setQuoteAmount(event.target.value)}
                    placeholder={order.quote?.amount ? String(order.quote.amount) : "0.00"}
                    required
                  />
                </div>
              </div>
              <div className="col-md-5">
                <div className="order-info-box bg-light border-0 shadow-none p-3 rounded-3 h-100">
                  <label className="fs-14 fw-normal text-muted mb-2">Quotation Note</label>
                  <input
                    className="form-control"
                    value={quoteNote}
                    onChange={(event) => setQuoteNote(event.target.value)}
                    placeholder="Optional note for customer"
                  />
                </div>
              </div>
              <div className="col-md-3">
                <div className="order-info-box bg-light border-0 shadow-none p-3 rounded-3 h-100 d-flex align-items-end">
                  <button type="submit" className="btn btn-primary w-100" disabled={isSendingQuote}>
                    {isSendingQuote ? "Sending..." : "Send Quotation"}
                  </button>
                </div>
              </div>
            </form>
          )}
          </div>

          <div className="mb-4">
            <h5 className="mb-3 fs-18 fw-semibold fnt-color">Order Items</h5>
            <div className="d-flex flex-column gap-3">
              {(order.items || []).map((item) => (
                <div key={`${item.cart_item_id}-${item.product_id}`} className="bg-white rounded-4 p-3">
                  <div className="row g-3 align-items-start">
                    <div className="col-lg-4">
                      <p className="text-muted fs-14 mb-2">Item</p>
                      <div className="d-flex align-items-center gap-3">
                          {item.image && (
                            <img
                              src={item.image}
                              className="d-block rounded-3 bg-light flex-shrink-0 dashboard-thumb-48 object-fit-cover"
                              alt={orderItemName(item, orderLanguage)}
                            />
                          )}
                          <div>
                            <p className="fw-semibold fs-14 fnt-color mb-0">{orderItemName(item, orderLanguage)}</p>
                            <span className="text-muted small">Product #{item.product_id}</span>
                          </div>
                      </div>
                    </div>
                    <div className="col-lg-4">
                      <p className="text-muted fs-14 mb-2">Options</p>
                      <ItemOptions options={item.options} language={orderLanguage} />
                    </div>
                    <div className="col-4 col-lg-1">
                      <p className="text-muted fs-14 mb-2">Qty</p>
                      <p className="fw-semibold fs-14 fnt-color mb-0">{item.quantity}</p>
                    </div>
                    <div className="col-4 col-lg-1">
                      <p className="text-muted fs-14 mb-2">Unit</p>
                      <p className="fw-semibold fs-14 fnt-color mb-0">{money(item.unit_price, order.currency)}</p>
                    </div>
                    <div className="col-4 col-lg-2 text-lg-end">
                      <p className="text-muted fs-14 mb-2">Total</p>
                      <p className="fw-semibold fs-14 fnt-color mb-0">{money(item.total_price, order.currency)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border-0 shadow-none rounded-4 p-4">
          <div className="row justify-content-end mt-4">
            <div className="col-md-4">
              <div className="order-info-box bg-light border-0 shadow-none p-3 rounded-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal</span>
                  <strong>{money(order.totals?.subtotal, order.currency)}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Shipping</span>
                  <strong>{money(order.totals?.shipping, order.currency)}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tax</span>
                  <strong>{money(order.totals?.tax, order.currency)}</strong>
                </div>
                <hr />
                <div className="d-flex justify-content-between">
                  <span className="fw-bold">Total</span>
                  <strong>{money(order.totals?.total, order.currency)}</strong>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}
