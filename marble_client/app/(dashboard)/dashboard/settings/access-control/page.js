"use client";

import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import AccessControlTabs from "@/components/dashboard/access-control/AccessControlTabs";
import AssignRoleOffcanvas from "@/components/dashboard/access-control/AssignRoleOffcanvas";
import CreateRoleOffcanvas from "@/components/dashboard/access-control/CreateRoleOffcanvas";
import CreateUserOffcanvas from "@/components/dashboard/access-control/CreateUserOffcanvas";
import RolePermissionsPanel from "@/components/dashboard/access-control/RolePermissionsPanel";
import { confirmDialog } from "@/components/dashboard/shared/ConfirmDialog";
import UserAssignmentsTab from "@/components/dashboard/access-control/UserAssignmentsTab";
import useAxiosConfig from "@/hooks/useAxiosConfig";
import useRbacAccess from "@/hooks/useRbacAccess";
import {
  assignRbacUserRoleRoute,
  createRbacRoleRoute,
  createRbacUserRoute,
  deleteRbacRoleRoute,
  deleteRbacUserRoute,
  getBranchesRoute,
  getRbacCatalogPermissionsGroupedRoute,
  getRbacRolePermissionsRoute,
  getRbacRolesRoute,
  getRbacUsersRoute,
  revokeRbacUserRoleRoute,
  syncRbacRolePermissionsRoute,
  syncRbacUserBranchesRoute,
} from "@/utils/apiRoutes";

export default function AccessControlPage() {
  const { token } = useAxiosConfig();
  const { can } = useRbacAccess();
  const canManageUsers = can("settings.users.manage");
  const canDeleteUsers = can("settings.users.delete");
  const [tabKey, setTabKey] = useState("role-permissions");
  const [roleTabKey, setRoleTabKey] = useState("summary");
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [groupedPermissions, setGroupedPermissions] = useState([]);
  const [activeRoleId, setActiveRoleId] = useState(null);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showAssignRole, setShowAssignRole] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userKeywords, setUserKeywords] = useState("");
  const [roleUsersPage, setRoleUsersPage] = useState(1);
  const [roleUsersLimit, setRoleUsersLimit] = useState(25);
  const [assignRoleUsersPage, setAssignRoleUsersPage] = useState(1);
  const [assignRoleUsersLimit, setAssignRoleUsersLimit] = useState(25);
  const [userAssignmentsPage, setUserAssignmentsPage] = useState(1);
  const [userAssignmentsLimit, setUserAssignmentsLimit] = useState(25);
  const [roleForm, setRoleForm] = useState({
    name: "",
    description: "",
  });

  const activeRole = useMemo(
    () => roles.find((role) => Number(role.id) === Number(activeRoleId)) || null,
    [roles, activeRoleId]
  );

  const defaultRoles = useMemo(
    () => roles.filter((role) => Number(role.is_default) === 1),
    [roles]
  );

  const customRoles = useMemo(
    () => roles.filter((role) => Number(role.is_default) !== 1),
    [roles]
  );

  const assignedUsersForActiveRole = useMemo(
    () =>
      users.filter((user) =>
        (user.rbacRoles || []).some(
          (role) => Number(role.id) === Number(activeRoleId)
        )
      ),
    [users, activeRoleId]
  );

  const paginatedAssignedUsers = useMemo(() => {
    const start = (roleUsersPage - 1) * roleUsersLimit;
    return assignedUsersForActiveRole.slice(start, start + roleUsersLimit);
  }, [assignedUsersForActiveRole, roleUsersPage, roleUsersLimit]);

  const paginatedAssignRoleUsers = useMemo(() => {
    const start = (assignRoleUsersPage - 1) * assignRoleUsersLimit;
    return users.slice(start, start + assignRoleUsersLimit);
  }, [users, assignRoleUsersPage, assignRoleUsersLimit]);

  const paginatedUsers = useMemo(() => {
    const start = (userAssignmentsPage - 1) * userAssignmentsLimit;
    return users.slice(start, start + userAssignmentsLimit);
  }, [users, userAssignmentsPage, userAssignmentsLimit]);

  const roleUsersPageCount = Math.max(
    Math.ceil(assignedUsersForActiveRole.length / roleUsersLimit),
    1
  );

  const assignRoleUsersPageCount = Math.max(
    Math.ceil(users.length / assignRoleUsersLimit),
    1
  );

  const userAssignmentsPageCount = Math.max(
    Math.ceil(users.length / userAssignmentsLimit),
    1
  );

  const roleUsersShowingStart =
    assignedUsersForActiveRole.length === 0
      ? 0
      : (roleUsersPage - 1) * roleUsersLimit + 1;

  const assignRoleUsersShowingStart =
    users.length === 0 ? 0 : (assignRoleUsersPage - 1) * assignRoleUsersLimit + 1;

  const userAssignmentsShowingStart =
    users.length === 0 ? 0 : (userAssignmentsPage - 1) * userAssignmentsLimit + 1;

  const loadRoles = useCallback(async () => {
    const response = await axios.get(getRbacRolesRoute, {
      params: { page: 1, limit: 200 },
    });
    const roleRows = response?.data?.data || [];
    setRoles(roleRows);
    setActiveRoleId((current) => current || roleRows[0]?.id || null);
  }, []);

  const loadUsers = useCallback(async (keywords = "") => {
    const response = await axios.get(getRbacUsersRoute, {
      params: { page: 1, limit: 200, keywords },
    });
    setUsers(response?.data?.data || []);
  }, []);

  const loadCatalog = useCallback(async () => {
    const response = await axios.get(getRbacCatalogPermissionsGroupedRoute);
    setGroupedPermissions(response?.data?.data || []);
  }, []);

  const loadBranches = useCallback(async () => {
    const response = await axios.get(getBranchesRoute, {
      params: { page: 1, limit: 500 },
    });
    setBranches(response?.data?.data || []);
  }, []);

  useEffect(() => {
    if (!token) return;

    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          loadRoles(),
          loadCatalog(),
          loadUsers(""),
          loadBranches(),
        ]);
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Unable to load access control data."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [token, loadRoles, loadCatalog, loadUsers, loadBranches]);

  useEffect(() => {
    if (!token || !activeRoleId) return;

    const loadRolePermissions = async () => {
      try {
        const response = await axios.get(getRbacRolePermissionsRoute(activeRoleId));
        setSelectedPermissionIds(
          (response?.data?.data || []).map((permission) => permission.id)
        );
      } catch (error) {
        toast.error(
          error?.response?.data?.message ||
            "Unable to load selected role permissions."
        );
      }
    };

    loadRolePermissions();
  }, [token, activeRoleId]);

  useEffect(() => {
    setRoleUsersPage(1);
  }, [activeRoleId, roleUsersLimit]);

  useEffect(() => {
    setAssignRoleUsersPage(1);
  }, [activeRoleId, assignRoleUsersLimit]);

  useEffect(() => {
    setUserAssignmentsPage(1);
  }, [userKeywords, userAssignmentsLimit]);

  useEffect(() => {
    if (!token) return;
    const delay = setTimeout(() => {
      loadUsers(userKeywords);
    }, 400);
    return () => clearTimeout(delay);
  }, [token, userKeywords, loadUsers]);

  const handleTogglePermission = async (permissionId) => {
    if (!activeRoleId) return;
    if (Number(activeRole?.is_default) === 1) {
      toast.info("Default WordPress role permissions are read-only.");
      return;
    }

    const nextPermissionIds = selectedPermissionIds.includes(permissionId)
      ? selectedPermissionIds.filter((id) => id !== permissionId)
      : [...selectedPermissionIds, permissionId];

    try {
      await axios.put(syncRbacRolePermissionsRoute(activeRoleId), {
        permission_ids: nextPermissionIds,
      });
      setSelectedPermissionIds(nextPermissionIds);
      toast.success("Permissions updated successfully.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to update permissions.");
    }
  };

  const handleRoleFormChange = (event) => {
    const { name, value } = event.target;
    setRoleForm((current) => ({ ...current, [name]: value }));
  };

  const handleCreateRole = async (event) => {
    event.preventDefault();
    if (!roleForm.name.trim()) {
      toast.error("Role name is required.");
      return;
    }

    try {
      const response = await axios.post(createRbacRoleRoute, roleForm);
      const createdRole = response.data;
      setRoles((current) => [...current, createdRole]);
      setActiveRoleId(createdRole.id);
      setRoleForm({ name: "", description: "" });
      setShowCreateRole(false);
      toast.success("Role created successfully.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to create role.");
    }
  };

  const handleDeleteRole = async (roleId) => {
    const role = roles.find((item) => Number(item.id) === Number(roleId));
    if (!role || Number(role.is_default) === 1) return;
    const confirmed = await confirmDialog({
      title: "Delete role",
      message: `Delete the "${role.name}" role? This cannot be undone.`,
    });
    if (!confirmed) return;

    try {
      await axios.delete(deleteRbacRoleRoute(roleId));
      setRoles((current) => {
        const next = current.filter((item) => Number(item.id) !== Number(roleId));
        setActiveRoleId((currentId) =>
          Number(currentId) === Number(roleId)
            ? next[0]?.id || null
            : currentId
        );
        return next;
      });
      setUsers((current) =>
        current.map((user) => ({
          ...user,
          rbacRoles: (user.rbacRoles || []).filter(
            (item) => Number(item.id) !== Number(roleId)
          ),
        }))
      );
      toast.success("Role deleted successfully.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to delete role.");
    }
  };

  const handleCreateUser = async (form) => {
    const fullName = form.full_name.trim();
    const phone = form.phone_number.trim();
    if (!fullName || !phone || !form.password) {
      toast.error("Name, phone number, and password are required.");
      return;
    }

    try {
      const response = await axios.post(createRbacUserRoute, {
        full_name: fullName,
        phone_number: phone,
        password: form.password,
        role_ids: form.role_ids,
        branch_ids: form.branch_ids,
      });
      const createdUser = response.data;
      setUsers((current) => [createdUser, ...current]);
      setShowCreateUser(false);
      setTabKey("user-assignments");
      toast.success("User created successfully.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to create user.");
    }
  };

  const handleDeleteUser = async (userId) => {
    const user = users.find((item) => Number(item.id) === Number(userId));
    if (!user) return;
    const confirmed = await confirmDialog({
      title: "Delete user",
      message: `Delete the user "${user.full_name || user.phone_number}"? This cannot be undone.`,
    });
    if (!confirmed) return;

    try {
      await axios.delete(deleteRbacUserRoute(userId));
      setUsers((current) =>
        current.filter((item) => Number(item.id) !== Number(userId))
      );
      toast.success("User deleted successfully.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to delete user.");
    }
  };

  const assignUserToRole = async (userId, roleId) => {
    try {
      await axios.post(assignRbacUserRoleRoute(userId, roleId));
      const role = roles.find((item) => Number(item.id) === Number(roleId));
      if (!role) return;

      setUsers((current) =>
        current.map((user) => {
          if (Number(user.id) !== Number(userId)) return user;
          if (
            (user.rbacRoles || []).some(
              (item) => Number(item.id) === Number(roleId)
            )
          ) {
            return user;
          }
          return {
            ...user,
            rbacRoles: [...(user.rbacRoles || []), role],
          };
        })
      );
      toast.success("Role assigned successfully.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to assign role.");
    }
  };

  const revokeUserRole = async (userId, roleId) => {
    try {
      await axios.delete(revokeRbacUserRoleRoute(userId, roleId));
      setUsers((current) =>
        current.map((user) =>
          Number(user.id) === Number(userId)
            ? {
                ...user,
                rbacRoles: (user.rbacRoles || []).filter(
                  (role) => Number(role.id) !== Number(roleId)
                ),
              }
            : user
        )
      );
      toast.success("Role removed successfully.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to remove role.");
    }
  };

  const syncUserBranches = async (userId, branchIds) => {
    try {
      const response = await axios.put(syncRbacUserBranchesRoute(userId), {
        branch_ids: branchIds,
      });
      const nextBranches = response?.data?.branches || [];
      setUsers((current) =>
        current.map((user) =>
          Number(user.id) === Number(userId)
            ? { ...user, branches: nextBranches }
            : user
        )
      );
      toast.success("Branches updated.");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to update user branches."
      );
      throw error;
    }
  };

  return (
    <>
      <section className="mt-3">
        <div className="d-flex align-items-center justify-content-between mb-2 gap-2 flex-wrap">
          <h1 className="pagetitle mb-0 fnt-color">Access Control</h1>
          <div className="d-flex align-items-center gap-2">
            {canManageUsers ? (
              <button
                type="button"
                className="btn-orange text-white fs-16 text-center border-0"
                onClick={() => setShowCreateUser(true)}
              >
                <i className="bi bi-person-plus me-1"></i>
                Create User
              </button>
            ) : null}
            <button
              type="button"
              className="btn-orange text-white fs-16 text-center border-0"
              onClick={() => setShowCreateRole(true)}
            >
              <i className="bi bi-plus-circle me-1"></i>
              Create Role
            </button>
          </div>
        </div>

        <AccessControlTabs
          activeKey={tabKey}
          className="mb-3"
          onChange={setTabKey}
          tabs={[
            { key: "role-permissions", label: "Role & Permissions" },
            { key: "user-assignments", label: "User Assignments" },
          ]}
        />

        {tabKey === "role-permissions" && (
          <RolePermissionsPanel
            activeRole={activeRole}
            activeRoleId={activeRoleId}
            customRoles={customRoles}
            defaultRoles={defaultRoles}
            groupedPermissions={groupedPermissions}
            isDefaultRoleSelected={Number(activeRole?.is_default) === 1}
            isLoading={isLoading}
            roleTabKey={roleTabKey}
            roleUsers={paginatedAssignedUsers}
            roleUsersPage={roleUsersPage}
            roleUsersPageCount={roleUsersPageCount}
            roleUsersLimit={roleUsersLimit}
            roleUsersShowingStart={roleUsersShowingStart}
            selectedPermissionIds={selectedPermissionIds}
            totalRoleUsers={assignedUsersForActiveRole.length}
            onAddRoleClick={() => setShowAssignRole(true)}
            onRoleChange={setActiveRoleId}
            onRoleTabChange={setRoleTabKey}
            onRoleUsersPageChange={setRoleUsersPage}
            onRoleUsersLimitChange={setRoleUsersLimit}
            onTogglePermission={handleTogglePermission}
            onDeleteRole={handleDeleteRole}
          />
        )}

        {tabKey === "user-assignments" && (
          <UserAssignmentsTab
            roles={roles}
            users={paginatedUsers}
            branches={branches}
            canDeleteUsers={canDeleteUsers}
            keywords={userKeywords}
            page={userAssignmentsPage}
            pageCount={userAssignmentsPageCount}
            pageLimit={userAssignmentsLimit}
            showingStart={userAssignmentsShowingStart}
            totalEntries={users.length}
            onAssignRole={assignUserToRole}
            onKeywordsChange={setUserKeywords}
            onPageChange={setUserAssignmentsPage}
            onPageLimitChange={setUserAssignmentsLimit}
            onRevokeRole={revokeUserRole}
            onSyncBranches={syncUserBranches}
            onDeleteUser={handleDeleteUser}
          />
        )}
      </section>

      <AssignRoleOffcanvas
        activeRoleId={activeRoleId}
        page={assignRoleUsersPage}
        pageCount={assignRoleUsersPageCount}
        pageLimit={assignRoleUsersLimit}
        showingStart={assignRoleUsersShowingStart}
        show={showAssignRole}
        totalEntries={users.length}
        users={paginatedAssignRoleUsers}
        onAssignRole={assignUserToRole}
        onHide={() => setShowAssignRole(false)}
        onPageChange={setAssignRoleUsersPage}
        onPageLimitChange={setAssignRoleUsersLimit}
      />

      <CreateRoleOffcanvas
        form={roleForm}
        show={showCreateRole}
        onChange={handleRoleFormChange}
        onHide={() => setShowCreateRole(false)}
        onSubmit={handleCreateRole}
      />

      <CreateUserOffcanvas
        show={showCreateUser}
        roles={roles}
        branches={branches}
        onHide={() => setShowCreateUser(false)}
        onSubmit={handleCreateUser}
      />

      <ToastContainer />
    </>
  );
}
