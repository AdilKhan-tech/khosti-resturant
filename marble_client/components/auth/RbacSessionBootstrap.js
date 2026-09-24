"use client";

import { useEffect, useRef } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { getRbacAccessContextRoute } from "@/utils/apiRoutes";

const getCurrentPermissionKeys = (user) => {
  if (!user) return [];
  const keys = user.permissionKeys || [];
  return Array.isArray(keys) ? keys : [];
};

const RbacSessionBootstrap = () => {
  const { data: session, status, update } = useSession();
  const attemptedForUserIdRef = useRef(null);

  useEffect(() => {
    const user = session?.user;
    const userId = user?.id;
    if (status !== "authenticated" || !userId) return;

    // If permission keys are already in the JWT session, skip refetch (HRM parity).
    // This stops the full-menu flash on refresh.
    const existingPermissionKeys = getCurrentPermissionKeys(user);
    if (existingPermissionKeys.length > 0 || user?.permissionKeys !== undefined) {
      return;
    }

    if (attemptedForUserIdRef.current === userId) return;
    attemptedForUserIdRef.current = userId;

    const fetchAccessContext = async () => {
      try {
        const response = await axios.get(getRbacAccessContextRoute, {
          headers: user?.accessToken
            ? { Authorization: `Bearer ${user.accessToken}` }
            : undefined,
        });
        const data = response?.data || {};
        await update({
          permissionKeys: Array.isArray(data.permissionKeys)
            ? data.permissionKeys
            : [],
          rbacRoles: Array.isArray(data.roles) ? data.roles : [],
          branchIds: Array.isArray(data.branchIds) ? data.branchIds : [],
          branchNames: Array.isArray(data.branchNames) ? data.branchNames : [],
          branchScoped: Boolean(data.branchScoped),
          isAdministrator: Boolean(data.isAdministrator),
        });
      } catch {
        // Mark RBAC as resolved so gates do not wait forever on API failure.
        await update({
          permissionKeys: [],
          rbacRoles: [],
          branchIds: [],
          branchNames: [],
          branchScoped: false,
          isAdministrator: false,
        });
      }
    };

    fetchAccessContext();
  }, [session, status, update]);

  return null;
};

export default RbacSessionBootstrap;
