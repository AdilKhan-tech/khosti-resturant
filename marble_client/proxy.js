import { withAuth } from "next-auth/middleware";

const nextAuthSecret =
  process.env.NEXTAUTH_SECRET ||
  (process.env.NODE_ENV === "development" ? "marble-store-local-nextauth-secret" : undefined);

const LOGIN_PATH = "/dashboard/login";

export default withAuth(
  function proxy() {
    // The authorized callback below guards dashboard access.
  },
  {
    secret: nextAuthSecret,
    pages: {
      // Unauthenticated dashboard visits go to the admin login, not the storefront.
      signIn: LOGIN_PATH,
    },
    callbacks: {
      authorized: ({ req, token }) => {
        // The login page itself must stay public to avoid a redirect loop.
        if (req.nextUrl.pathname === LOGIN_PATH) return true;
        return !!token;
      },
    },
  },
);

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
