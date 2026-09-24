import React from "react";
import { cookies } from "next/headers";
import AboutUs from "../../../components/frontend/about/About";
import { buildPageMetadata } from "@/utils/pageSeo";
import {
  LANGUAGE_COOKIE,
  normalizeLanguage,
} from "@/utils/localizedContent";

export async function generateMetadata() {
  return buildPageMetadata("about", {
    title: "About Us | Marble Store",
    description: "About Marble Store",
  });
}

async function Page() {
  const cookieStore = await cookies();
  const language = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);

  return (
    <main>
      <AboutUs language={language} />
    </main>
  );
}

export default Page;
