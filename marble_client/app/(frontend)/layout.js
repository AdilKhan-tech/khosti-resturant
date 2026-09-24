import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "@/public/assets/css/Frontend.css";
import Providers from "@/components/Provider";
import FrontEnd from "@/layouts/FrontEnd";
import { cookies } from "next/headers";
import { LANGUAGE_COOKIE, normalizeLanguage } from "@/utils/localizedContent";

export const metadata = {
  title: "Marble Store",
  description: "Marble Store",
};

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const language = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);
  const direction = language === "ar" ? "rtl" : "ltr";

  return (
    <html lang={language} dir={direction} suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={`lang-${language}`} suppressHydrationWarning>
        <Providers>
          <FrontEnd language={language}>
            {children}
          </FrontEnd>
        </Providers>
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
          async
        />
      </body>
    </html>
  );
}
