import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { cookies } from "next/headers";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getOrderByNumberRoute, getOrderStatusesRoute } from "@/utils/apiRoutes";
import { getLocalizedLabel, getLocalizedValue, LANGUAGE_COOKIE, normalizeLanguage } from "@/utils/localizedContent";
import QuoteResponseActions from "../QuoteResponseActions";

async function fetchJson(url, token) {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Request failed");
  }

  return response.json();
}

async function getOrderData(orderNumber, session, t) {
  const user = session?.user;
  if (!user?.accessToken) {
    return { order: null, statusLabels: {}, error: null };
  }

  let order;
  try {
    const orderJson = await fetchJson(
      getOrderByNumberRoute(orderNumber),
      user.accessToken,
    );
    order = orderJson.data || null;
  } catch {
    return { order: null, statusLabels: {}, error: t("lblUnableLoadOrder") };
  }

  if (order && String(order.customer?.id) !== String(user.id)) {
    return { order: null, statusLabels: {}, error: t("lblUnauthorizedOrder") };
  }

  // Status labels are admin-scoped; a 403 for non-staff must not break the page.
  let statusLabels = {};
  try {
    const statusesJson = await fetchJson(getOrderStatusesRoute, user.accessToken);
    statusLabels = (statusesJson.data || []).reduce(
      (labels, option) => ({ ...labels, [option.value]: option.label }),
      {},
    );
  } catch {
    statusLabels = {};
  }

  return { order, statusLabels, error: null };
}

function money(value, currency = "SR") {
  return `${Number(value || 0).toFixed(2)} ${currency}`;
}

function formatDate(value, language) {
  if (!value) return getLocalizedLabel("lblNotAvailable", language);
  return new Date(value).toLocaleString(language === "ar" ? "ar" : "en", {
    month: "long",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function optionLabel(value, language) {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    return value
      .map((item) => getLocalizedValue(item?.name_en || item?.slug, item?.name_ar, language))
      .filter(Boolean)
      .join(", ");
  }
  return getLocalizedValue(value.name_en || value.slug, value.name_ar, language);
}

function optionKeyLabel(key, language) {
  const labelKeys = {
    cake_type: "lblCakeType",
    cake_size: "lblCakeSize",
    cake_flavor: "lblCakeFlavor",
    cake_text: "lblCakeText",
    cake_note: "lblCakeNote",
    color_text: "lblColorText",
    border_color: "lblBorderColor",
    product_size: "lblSelectSize",
    product_flavor: "lblSelectFlavor",
    product_portion_size: "lblPortionSize",
    product_text: "lblText",
    product_notes: "lblNote",
    product_note: "lblNote",
    ice_size: "lblPortionSize",
    cookies_box_type_option: "lblBoxType",
    cookies_box_size_option: "lblBoxSize",
    cookies_items: "lblCookies",
    icecream_bucket_option: "lblBucketSize",
    icecream_flavor_items: "lblFlavors",
    icecream_mixin_items: "lblMixins",
    icecream_sauce_items: "lblSauces",
  };

  return labelKeys[key]
    ? getLocalizedLabel(labelKeys[key], language)
    : key.replaceAll("_", " ");
}

function itemOptions(options = {}, language) {
  return Object.entries(options)
    .filter(([key]) => !["sketch_url", "custom_price"].includes(key))
    .map(([key, value]) => [optionKeyLabel(key, language), optionLabel(value, language)])
    .filter(([, value]) => value);
}

function itemName(item, language) {
  return getLocalizedValue(item?.name_en, item?.name_ar, language);
}

function statusLabel(status, statusLabels, language) {
  const labelKeys = {
    pending: "lblStatusPending",
    processing: "lblStatusProcessing",
    "new-order": "lblStatusNewOrder",
    "cstm-cake-request": "lblStatusCustomCakeRequest",
    qfa: "lblStatusQuoteForApproval",
    accepted: "lblAccepted",
    "ready-to-pickup": "lblStatusReadyToPickup",
    "ready-to-deliver": "lblStatusReadyToDeliver",
    completed: "lblStatusCompleted",
    cancelled: "lblStatusCancelled",
    refunded: "lblStatusRefunded",
    failed: "lblStatusFailed",
  };

  return labelKeys[status]
    ? getLocalizedLabel(labelKeys[status], language)
    : statusLabels[status] || status;
}

function receivingTypeLabel(type, language) {
  if (type === "Pickup") return getLocalizedLabel("lblPickup", language);
  if (type === "Delivery") return getLocalizedLabel("lblDelivery", language);
  return getLocalizedLabel("lblNotAvailable", language);
}

function paymentMethodLabel(order, language) {
  if (order.payment_method === "bank_transfer") return getLocalizedLabel("lblDirectBankTransfer", language);
  if (order.payment_method === "cod") return getLocalizedLabel("lblCashOnDelivery", language);
  if (order.payment_method === "quote") return getLocalizedLabel("lblQuotationRequest", language);
  return order.payment_method_title || "";
}

export default async function AccountOrderDetailPage({ params }) {
  const { number } = await params;
  const [session, cookieStore] = await Promise.all([getServerSession(authOptions), cookies()]);
  const language = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);
  const t = (labelKey, fallback) => getLocalizedLabel(labelKey, language, fallback);
  const { order, statusLabels, error } = await getOrderData(number, session, t);

  if (!session?.user) {
    return (
      <div className="bg-white rounded-4 p-4 mt-3">
        <p className="m-0">{t("lblLoginToViewOrder")}</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-white rounded-4 p-4 mt-3">
        <p className="text-danger mb-3">{error || t("lblOrderNotFound")}</p>
        <Link href="/my-account/orders" className="text-blue font-brandon-bold text-decoration-none">
          {t("lblBackToOrders")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <p className="fs-25 Brandon_Grotesque mt-3 mb-0">{t("lblOrderNumber")} #{order.order_number}</p>
        <Link href="/my-account/orders" className="text-blue font-brandon-bold text-decoration-none">
          <i className="bi bi-arrow-left-circle me-2"></i>{t("lblBackToOrders")}
        </Link>
      </div>

      <div className="bg-white rounded-4 p-4 mb-2">
        <div className="row g-3">
          <div className="col-md-6">
            <div className="bg-light rounded-4 p-3 h-100">
              <h6 className="text-muted mb-2">{t("lblStatus")}</h6>
              <p className="font-brandon-bold text-blue fs-20 mb-0">
                {statusLabel(order.status, statusLabels, language)}
              </p>
            </div>
          </div>
          <div className="col-md-6">
            <div className="bg-light rounded-4 p-3 h-100">
              <h6 className="text-muted mb-2">{t("lblOrderDate")}</h6>
              <p className="font-brandon-bold text-brown fs-20 mb-0">{formatDate(order.created_at, language)}</p>
            </div>
          </div>
          <div className="col-md-6">
            <div className="bg-light rounded-4 p-3 h-100">
              <h6 className="text-muted mb-2">{t("lblPaymentMethod")}</h6>
              <p className="font-brandon-bold text-brown fs-20 mb-0">{paymentMethodLabel(order, language)}</p>
            </div>
          </div>
          <div className="col-md-6">
            <div className="bg-light rounded-4 p-3 h-100">
              <h6 className="text-muted mb-2">{t("lblReceiving")}</h6>
              <p className="font-brandon-bold text-brown fs-20 mb-0">
                {receivingTypeLabel(order.receiving_info?.address_type, language)}
              </p>
              <p className="small text-muted mb-0">
                {order.receiving_info?.selected_date || ""} {order.receiving_info?.selected_time_slot || ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      {order.status === "qfa" && (
        <div className="bg-white rounded-4 p-3 mb-2">
          <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
            <div>
              <h5 className="font-brandon-bold text-brown mb-1">{t("lblQuotationReady")}</h5>
              <p className="text-muted mb-0">{t("lblQuotationReadyDescription")}</p>
            </div>
            <QuoteResponseActions orderNumber={order.order_number} order={order} language={language} />
          </div>
        </div>
      )}

      <div className="bg-white rounded-4 p-4">
        <h5 className="font-brandon-bold text-brown mb-3">{t("lblOrderItems")}</h5>
        <div className="d-flex flex-column gap-3">
          {(order.items || []).map((item) => {
            const rows = itemOptions(item.options, language);
            const sketchUrl = item.options?.sketch_url;

            return (
              <div className="rounded-4 p-3 bg-light-white" key={`${item.cart_item_id}-${item.product_id}`}>
                <div className="d-flex gap-3 align-items-start">
                  {item.image && (
                    <img
                      className="d-block rounded-3 flex-shrink-0 bg-light size-72 object-fit-cover"
                      src={item.image}
                      alt={itemName(item, language)}
                    />
                  )}
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between dashedline mb-2">
                      <p className="text-brown-50 font-brandon-normal mb-0">
                        {itemName(item, language)} <strong className="font-brandon-bold">x&nbsp;{item.quantity}</strong>
                      </p>
                      <p className="text-brown font-brandon-bold mb-0">{money(item.total_price, order.currency)}</p>
                    </div>
                    {rows.length > 0 ? (
                      <div className="small text-brown-50">
                        {rows.map(([label, value]) => (
                          <div key={`${item.cart_item_id}-${label}`} className="d-flex gap-1">
                            <span className="font-brandon-bold">{label}:</span>
                            <span>{value}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted small">{t("lblNoOptions")}</span>
                    )}
                    <div className="small text-brown-50 mt-2">
                      {t("lblUnitPrice")}: <span className="font-brandon-bold text-brown">{money(item.unit_price, order.currency)}</span>
                    </div>
                    {sketchUrl && (
                      <div className="mt-3">
                        <p className="small font-brandon-bold text-brown mb-2">{t("lblSketchPhoto")}</p>
                        <a href={sketchUrl} target="_blank" rel="noreferrer" className="d-inline-block text-decoration-none">
                          <img
                            className="d-block rounded-3 bg-light border thumb-140x100 object-fit-cover"
                            src={sketchUrl}
                            alt={t("lblCustomCakeSketchAlt")}
                          />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="row justify-content-end mt-4">
          <div className="col-md-5">
            <div className="bg-light rounded-4 p-3">
              <div className="d-flex justify-content-between mb-2">
                <span>{t("lblSubtotal")}</span>
                <strong>{money(order.totals?.subtotal, order.currency)}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>{t("lblShipping")}</span>
                <strong>{money(order.totals?.shipping, order.currency)}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>{t("lblTax")}</span>
                <strong>{money(order.totals?.tax, order.currency)}</strong>
              </div>
              <hr />
              <div className="d-flex justify-content-between">
                <span className="font-brandon-bold">{t("lblTotal")}</span>
                <strong>{money(order.totals?.total, order.currency)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
