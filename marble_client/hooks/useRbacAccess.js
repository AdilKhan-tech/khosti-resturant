import { useMemo } from "react";
import { useSession } from "next-auth/react";
import {
  getRbacPermissionKeys,
  hasAllRbacPermissions,
  hasAnyRbacPermission,
  hasRbacPermission,
  isRbacAdministrator,
} from "@/utils/rbac/rbacAccess";

const useRbacAccess = (options = {}) => {
  const { adminFallback = true } = options;
  const { data: session, status } = useSession();
  const user = session?.user;
  const permissionKeys = useMemo(() => getRbacPermissionKeys(user), [user]);
  const isLoading = status === "loading";
  // Wait for JWT RBAC bootstrap before gating UI (avoids false deny + menu flash).
  const isAccessPending =
    status === "authenticated" &&
    !isRbacAdministrator(user) &&
    user?.permissionKeys === undefined;

  const can = (permissionKey, runtimeOptions = {}) =>
    hasRbacPermission(user, permissionKey, {
      adminFallback,
      ...runtimeOptions,
    });

  const canAny = (permissionKeyList, runtimeOptions = {}) =>
    hasAnyRbacPermission(user, permissionKeyList, {
      adminFallback,
      ...runtimeOptions,
    });

  const canAll = (permissionKeyList, runtimeOptions = {}) =>
    hasAllRbacPermissions(user, permissionKeyList, {
      adminFallback,
      ...runtimeOptions,
    });

  return {
    user,
    permissionKeys,
    isLoading,
    isAccessPending,
    can,
    canAny,
    canAll,
  };
};

export default useRbacAccess;
