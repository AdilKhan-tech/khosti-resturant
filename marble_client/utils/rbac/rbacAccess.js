export const getRbacPermissionKeys = (user) => {
  if (!user) return [];
  const keys =
    user.permissionKeys || user.permission_keys || user.rbacPermissionKeys || [];
  return Array.isArray(keys) ? keys : [];
};

export const isRbacAdministrator = (user) => {
  if (!user) return false;
  if (user.isAdministrator === true) return true;
  if (user.role === "administrator") return true;
  const roles = user.rbacRoles || user.roles || [];
  if (!Array.isArray(roles)) return false;
  return roles.some(
    (role) =>
      role?.role_key === "administrator" || role?.roleKey === "administrator"
  );
};

/**
 * Whether a user may enter the admin dashboard at all.
 *
 * Administrators always can. Otherwise the user must hold at least one
 * non-customer permission — customer accounts only carry `account.*` keys, so
 * they are kept out of the dashboard entirely.
 */
export const hasDashboardAccess = (user) => {
  if (!user) return false;
  if (isRbacAdministrator(user)) return true;
  return getRbacPermissionKeys(user).some((key) => !key.startsWith("account."));
};

export const hasRbacPermission = (
  user,
  permissionKey,
  { adminFallback = true } = {}
) => {
  if (!user || !permissionKey) return false;
  if (adminFallback && isRbacAdministrator(user)) return true;

  const keys = getRbacPermissionKeys(user);
  return keys.includes(permissionKey);
};

export const hasAnyRbacPermission = (
  user,
  permissionKeys,
  { adminFallback = true } = {}
) => {
  if (!Array.isArray(permissionKeys) || permissionKeys.length === 0) {
    return false;
  }
  return permissionKeys.some((permissionKey) =>
    hasRbacPermission(user, permissionKey, { adminFallback })
  );
};

export const hasAllRbacPermissions = (
  user,
  permissionKeys,
  { adminFallback = true } = {}
) => {
  if (!Array.isArray(permissionKeys) || permissionKeys.length === 0) {
    return false;
  }
  return permissionKeys.every((permissionKey) =>
    hasRbacPermission(user, permissionKey, { adminFallback })
  );
};
