import Link from "next/link";
import { cookies } from "next/headers";
import { getOrderByNumberRoute,getPaymentStatusRoute } from "@/utils/apiRoutes";
import { getLocalizedLabel, LANGUAGE_COOKIE, normalizeLanguage } from "@/utils/localizedContent";

export async function generateMetadata() {
  const cookieStore = await cookies();
  const language = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);

  return {
    title: getLocalizedLabel("lblOrderReceivedPageTitle", language),
  };
}

async function getOrder(orderId) {
  if (!orderId) return null;

  try {
    const res = await fetch(getOrderByNumberRoute(orderId), {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}
async function getPaymentStatus(order) {
  if (!order || order.payment_method !== "myfatoorah") return null;

  try {
    const res = await fetch(getPaymentStatusRoute(order.order_number), {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? json;
  } catch {
    return null;
  }
}

function money(value, currency = "SR") {
  return `${Number(value || 0).toFixed(2)} ${currency}`;
}

function orderMessage(orderNumber, language) {
  return getLocalizedLabel("lblOrderPreparedMessage", language).replace("{orderNumber}", orderNumber);
}

function paymentMethodLabel(order, language) {
  if (order.payment_method === "bank_transfer") {
    return getLocalizedLabel("lblDirectBankTransfer", language);
  }
  if (order.payment_method === "cod") {
    return getLocalizedLabel("lblCashOnDelivery", language);
  }
  if (order.payment_method === "quote") {
    return getLocalizedLabel("lblQuotationRequest", language);
  }
  if (order.payment_method === "myfatoorah") {
    return getLocalizedLabel("lblPayOnline", language, "Pay Online");
  }

  return order.payment_method_title || "";
}

function receivingTypeLabel(type, language) {
  return type === "Pickup"
    ? getLocalizedLabel("lblPickup", language)
    : getLocalizedLabel("lblDelivery", language);
}

export default async function OrderReceivedPage({ params }) {
  const { orderId } = await params;
  const cookieStore = await cookies();
  const language = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);
  const t = (labelKey, fallback) => getLocalizedLabel(labelKey, language, fallback);
  const order = await getOrder(orderId);
  const paymentStatus = await getPaymentStatus(order);

  if (!order) {
    return (
      <main className="bg-light-green min-vh-100 py-5">
        <div className="container">
          <div className="bg-white rounded-4 p-5 text-center">
            <div className="display-4 text-danger mb-3">
              <i className="bi bi-exclamation-circle"></i>
            </div>
            <h3 className="fs-30 text-light-dark font-brandon-bold">{t("lblOrderNotFound")}</h3>
            <Link href="/cart" className="btn bg-pink text-white rounded-5 font-brandon-bold fs-20 mt-3">
              {t("lblBackToCart")}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-light-green min-vh-100 py-5">
      <div className="container">
        <div className="pb-5 d-flex justify-content-center align-items-center thank-you-page">
          <div className="text-center bg-white rounded-4 p-4 p-md-5 w-100">
            <div className="display-2 text-info mb-3">
              <i className="bi bi-check-circle"></i>
            </div>
            <div className="my-3 pb-2">
              <h3 className="fs-30 text-light-dark font-brandon-bold thank-you-text">{t("lblThankYou")}</h3>
              <h3 className="fs-20 text-brown-50 font-brandon-bold">
                {orderMessage(order.order_number, language)}
              </h3>
              <h3 className="fs-20 text-brown-50 font-brandon-bold">
                {t("lblContactHelpMessage")}
              </h3>
            </div>

            <div className="row justify-content-center mt-4 text-start">
              <div className="col-12 col-lg-8">
                <div className="bg-light-white rounded-4 p-3 p-md-4">
                  <div className="d-flex justify-content-between dashedline mb-3">
                    <p className="text-brown-50">{t("lblOrderNumber")}</p>
                    <p className="text-brown font-brandon-bold">#{order.order_number}</p>
                  </div>
                  <div className="d-flex justify-content-between dashedline mb-3">
                    <p className="text-brown-50">{t("lblTotal")}</p>
                    <p className="text-brown font-brandon-bold">
                      {money(order.totals?.total, order.currency)}
                    </p>
                  </div>
                  <div className="d-flex justify-content-between dashedline mb-3">
                    <p className="text-brown-50">{t("lblPaymentMethod")}</p>
                    <p className="text-brown font-brandon-bold">{paymentMethodLabel(order, language)}</p>
                  </div>
                    {paymentStatus && (
                      <>
                        <div className="d-flex justify-content-between dashedline mb-3">
                          <p className="text-brown-50">{t("lblPaymentStatus", "Payment Status")}</p>
                          <p
                            className={`font-brandon-bold ${
                              paymentStatus.status === "paid" ? "text-success" : "text-danger"
                            }`}
                          >
                            {paymentStatus.status === "paid"
                              ? t("lblPaymentPaid", "Paid")
                              : paymentStatus.status === "failed"
                              ? t("lblPaymentFailed", "Payment failed")
                              : t("lblPaymentPending", "Awaiting payment")}
                          </p>
                        </div>
                        {paymentStatus.status !== "paid" && (
                          <div className="alert alert-warning py-2 mt-2 mb-3">
                            {t(
                              "lblPaymentNotCompletedNotice",
                              "Your payment was not completed. Please try again to confirm your order.",
                            )}
                            <br />
                            <Link href="/cart" className="fw-bold text-decoration-underline">
                              {t("lblTryAgain", "Try again")}
                            </Link>
                          </div>
                        )}
                      </>
                    )}
                  <div className="d-flex justify-content-between dashedline">
                    <p className="text-brown-50">{t("lblReceiving")}</p>
                    <p className="text-brown font-brandon-bold">
                      {receivingTypeLabel(order.receiving_info?.address_type, language)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Link href="/my-account" className="btn bg-pink text-white rounded-5 font-brandon-bold fs-20 mt-4">
              {t("lblSeeMyOrders")}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
