import React from "react";
import { cookies, headers } from "next/headers";
import Contact from "../../../components/frontend/contact/Contact";
import { buildPageMetadata } from "@/utils/pageSeo";
import {
  getBranchesRoute,
  getFaqsPublicRoute,
  getStorefrontPublicRoute,
} from "@/utils/apiRoutes";
import apiKeyMapping from "@/configs/apiKeyMapping";
import {
  LANGUAGE_COOKIE,
  normalizeLanguage,
} from "@/utils/localizedContent";

export async function generateMetadata() {
  return buildPageMetadata("contact", {
    title: "Contact Us | Marble Store",
    description: "Contact Marble Store",
  });
}

const DEFAULT_CONTACT = {
  hotline: "920011480",
  whatsapp: "+966594064708",
  email: "info@marblestore.com",
};

async function Page() {
  const [headersList, cookieStore] = await Promise.all([headers(), cookies()]);
  const currentDomain = headersList.get("host")?.split(":")[0] || "localhost";
  const apiKey = apiKeyMapping[currentDomain] || null;
  const language = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);
  const authHeaders = { "X-API-KEY": apiKey };

  let faqs = [];
  let branches = [];
  let contact = { ...DEFAULT_CONTACT };

  try {
    const [faqsRes, branchesRes, storefrontRes] = await Promise.all([
      fetch(getFaqsPublicRoute, { headers: authHeaders, cache: "no-store" }),
      fetch(`${getBranchesRoute}?page=1&limit=200`, {
        headers: authHeaders,
        cache: "no-store",
      }),
      fetch(getStorefrontPublicRoute, {
        headers: authHeaders,
        cache: "no-store",
      }),
    ]);

    if (faqsRes.ok) {
      const json = await faqsRes.json();
      faqs = Array.isArray(json?.data) ? json.data : [];
    }
    if (branchesRes.ok) {
      const json = await branchesRes.json();
      branches = Array.isArray(json?.data) ? json.data : [];
    }
    if (storefrontRes.ok) {
      const json = await storefrontRes.json();
      const data = json?.data || {};
      contact = {
        hotline: data.hotline || DEFAULT_CONTACT.hotline,
        whatsapp: data.whatsapp || DEFAULT_CONTACT.whatsapp,
        email: data.email || DEFAULT_CONTACT.email,
      };
    }
  } catch {
    // API unreachable — page still renders with empty sections / defaults
  }

  return (
    <Contact
      language={language}
      faqs={faqs}
      branches={branches}
      contact={contact}
    />
  );
}

export default Page;
