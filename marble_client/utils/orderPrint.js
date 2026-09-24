import axios from "axios";
import { printOrderPdfRoute } from "@/utils/apiRoutes";

/**
 * Ask Nest to generate an order PDF from MySQL `print_templates`
 * (HRM-style), then open the uploaded file URL.
 *
 * @param {string} orderNumber
 * @param {'small'|'a4'} size
 */
export async function printOrder(orderNumber, size = "small") {
  if (!orderNumber) {
    throw new Error("Order number is required to print.");
  }
  const response = await axios.get(printOrderPdfRoute(orderNumber, size));
  const url = response.data?.data?.url;
  if (!url) {
    throw new Error(response.data?.message || "PDF URL missing from response.");
  }
  window.open(url, "_blank", "noopener,noreferrer");
  return response.data.data;
}
