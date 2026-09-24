export const getRoleName = (role) => role?.name || role?.role_key || "Role";

export const getUserName = (user) => user?.full_name || user?.phone_number || "User";

export const getUserInitials = (user) =>
  getUserName(user)
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

