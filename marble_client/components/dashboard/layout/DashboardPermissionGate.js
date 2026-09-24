"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import useRbacAccess from "@/hooks/useRbacAccess";
import { getRequiredPermissionsForPath } from "@/utils/rbac/dashboardNav";
import { hasDashboardAccess } from "@/utils/rbac/rbacAccess";
import PermissionDenied from "@/components/dashboard/general/PermissionDenied";

const LOGIN_PATH = "/dashboard/login";

export default function DashboardPermissionGate({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useSession();
  const { user, canAny, isLoading, isAccessPending } = useRbacAccess();
  const requiredPermissions = getRequiredPermissionsForPath(pathname);

  const unauthenticated = status === "unauthenticated";
  // Authenticated but not staff (e.g. a storefront customer) — keep them out.
  const notAuthorized =
    status === "authenticated" &&
    !isAccessPending &&
    !hasDashboardAccess(user);

  useEffect(() => {
    if (unauthenticated || notAuthorized) {
      router.replace(LOGIN_PATH);
    }
  }, [unauthenticated, notAuthorized, router]);

  if (isLoading || isAccessPending) {
    return null;
  }

  if (unauthenticated || notAuthorized) {
    return null;
  }

  if (requiredPermissions?.length && !canAny(requiredPermissions)) {
    return <PermissionDenied />;
  }

  return children;
}
