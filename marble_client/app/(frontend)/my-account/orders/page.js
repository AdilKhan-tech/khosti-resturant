import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { cookies } from "next/headers";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getCustomerOrdersRoute, getOrderStatusesRoute } from "@/utils/apiRoutes";
import { getLocalizedLabel, LANGUAGE_COOKIE, normalizeLanguage } from "@/utils/localizedContent";
import QuoteResponseActions from "./QuoteResponseActions";

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

async function getOrdersData(session, t) {
  const user = session?.user;
  if (!user?.id || !user?.accessToken) {
    return { orders: [], statusLabels: {}, error: null };
  }

  let orders;
  try {
    const ordersJson = await fetchJson(
      `${getCustomerOrdersRoute(user.id)}?limit=100`,
      user.accessToken,
    );
    orders = ordersJson.data || [];
  } catch {
    return { orders: [], statusLabels: {}, error: t("lblUnableLoadOrders") };
  }

  // Status labels are admin-scoped; customers rely on localized fallbacks, so a
  // failure here (e.g. 403 for non-staff) must not break the orders list.
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

  return { orders, statusLabels, error: null };
}

function formatOrderDate(value, language) {
  if (!value) return getLocalizedLabel("lblNotAvailable", language);
  return new Date(value).toLocaleDateString(language === "ar" ? "ar" : "en", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  });
}

function formatMoney(value, currency = "SR") {
  return `${Number(value || 0).toFixed(2)} ${currency}`;
}

function statusClass(status) {
  if (["cancelled", "failed", "refunded"].includes(status)) return "text-danger";
  if (["completed", "accepted"].includes(status)) return "text-blue";
  return "text-brown";
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

function orderImages(order) {
  return (order.items || []).map((item) => item.image).filter(Boolean).slice(0, 4);
}

function accountOrderUrl(orderNumber) {
  return `/my-account/orders/${encodeURIComponent(orderNumber)}`;
}

export default async function MyAccountOrdersPage() {
  const [session, cookieStore] = await Promise.all([getServerSession(authOptions), cookies()]);
  const language = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);
  const t = (labelKey, fallback) => getLocalizedLabel(labelKey, language, fallback);
  const { orders, statusLabels, error } = await getOrdersData(session, t);

  return (
    <div className="mt-3">
      <p className="fs-25 Brandon_Grotesque mt-3">{t("lblOrdersHistory")}</p>
      <div className="text-end d-sm-none"></div>
      <div className="bg-white rounded-4 order-history overflow-auto">
        {!session?.user ? (
          <p className="m-0 p-3">{t("lblLoginToViewOrders")}</p>
        ) : error ? (
          <p className="m-0 p-3 text-danger">{error}</p>
        ) : orders.length > 0 ? (
          <div className="table-responsive border-start border-end rounded-4 overflow-hidden">
            <table className="woocommerce-orders table align-middle mb-0 w-100 min-w-760">
              <thead className="table-light">
                <tr>
                  <th className="border-order-left bg-pink text-brown py-3">{t("lblNo")}</th>
                  <th className="bg-pink text-brown py-3">{t("lblStatus")}</th>
                  <th className="bg-pink text-brown py-3">{t("lblItems")}</th>
                  <th className="bg-pink text-brown py-3">{t("lblReceiving")}</th>
                  <th className="bg-pink text-brown py-3">{t("lblTotal")}</th>
                  <th className="bg-pink text-brown py-3">{t("lblActions")}</th>
                  <th className="border-order-right bg-pink text-brown py-3 text-nowrap w-120px">{t("lblViewOrder")}</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const images = orderImages(order);
                  return (
                    <tr
                      key={order.order_number}
                      className={`woocommerce-orders-table__row woocommerce-orders-table__row--status-${order.status} order`}
                    >
                      <td className="woocommerce-orders-table__cell woocommerce-orders-table__cell-order-number px-ort-12 text-center">
                        <Link
                          href={accountOrderUrl(order.order_number)}
                          className="text-blue font-brandon-bold text-decoration-none"
                        >
                          {order.order_number}
                        </Link>
                      </td>
                      <td className="woocommerce-orders-table__cell woocommerce-orders-table__cell-order-status pr-ort-12">
                        <div className={`statusName font-brandon-bold fs-16 ${statusClass(order.status)}`}>
                          {statusLabel(order.status, statusLabels, language)}
                        </div>
                      </td>
                      <td className="woocommerce-orders-table__cell woocommerce-orders-table__cell-item-images">
                        <div className="order-td-Images">
                          <div className="d-flex gap-2 min-w-90px">
                            {images.length > 0 ? (
                              images.map((image, index) => (
                                <div
                                  className="rounded-3 overflow-hidden bg-light flex-shrink-0 size-42"
                                  key={`${order.order_number}-${index}`}
                                >
                                  <img
                                    className="d-block w-100 h-100 object-fit-cover"
                                    src={image}
                                    alt={t("lblOrderItemAlt")}
                                  />
                                </div>
                              ))
                            ) : (
                              <span className="text-muted fs-14">{t("lblNoImage")}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="woocommerce-orders-table__cell woocommerce-orders-table__cell-order-date px-ort-12">
                        <time dateTime={order.created_at}>{formatOrderDate(order.created_at, language)}</time>
                        <div className="small text-muted">{receivingTypeLabel(order.receiving_info?.address_type, language)}</div>
                      </td>
                      <td className="woocommerce-orders-table__cell woocommerce-orders-table__cell-order-total px-ort-12">
                        {formatMoney(order.totals?.total, order.currency)}
                      </td>
                      <td className="woocommerce-orders-table__cell woocommerce-orders-table__cell-order-actions w-160px">
                        {order.status === "qfa" && (
                          <QuoteResponseActions orderNumber={order.order_number} order={order} language={language} />
                        )}
                        {order.status === "pending" && (
                          <span className="woocommerce-button button accept text-blue bg-transparent fs-14">
                            <i className="bi bi-check-circle-fill me-2"></i>{t("lblPayNow")}
                          </span>
                        )}
                        {order.status === "cancelled" && (
                          <span className="woocommerce-button button repeat text-danger bg-transparent fs-14">{t("lblRejected")}</span>
                        )}
                        {order.status === "completed" && (
                          <span className="woocommerce-button button repeat text-blue bg-transparent fs-14">{t("lblAccepted")}</span>
                        )}
                      </td>
                      <td className="woocommerce-orders-table__cell woocommerce-orders-table__cell-order-number px-ort-12 text-center">
                        <Link
                          href={accountOrderUrl(order.order_number)}
                          className="text-blue font-brandon-bold text-decoration-none"
                        >
                          <i className="bi bi-eye-fill me-2"></i>{t("lblView")}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="m-0 p-3">
            {t("lblNoOrdersYet")} <Link href="/product-category/cakes">{t("lblBrowseProducts")}</Link>
          </p>
        )}
      </div>

    </div>
  );
}
