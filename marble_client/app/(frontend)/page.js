import PageBanner from "@/components/frontend/PageBanner";
import EidSpecial from "@/components/frontend/home/EidSpecial";
import BestSellers from "@/components/frontend/home/BestSellers";
import Occassions from "@/components/frontend/home/Occasions";
import Categories from "@/components/frontend/home/Categories";
import MoreGift from "@/components/frontend/home/Moregift";
import { cookies } from "next/headers";
import { LANGUAGE_COOKIE, normalizeLanguage } from "@/utils/localizedContent";
import { buildPageMetadata } from "@/utils/pageSeo";

export async function generateMetadata() {
  return buildPageMetadata("home", {
    title: "Marble Store",
    description: "Marble Store — cakes, ice cream and gifts",
  });
}

export default async function Page() {
  const cookieStore = await cookies();
  const language = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);

  return (
    <main>
      <PageBanner slug="home" lang={language} />
      <EidSpecial language={language} />
      <BestSellers language={language} />
      <Occassions language={language} />
      <Categories language={language} />
      <MoreGift language={language} />
    </main>
  );
}
