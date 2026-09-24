import { useMemo, useState } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import AccessControlPagination from "./AccessControlPagination";
import { getRoleName, getUserInitials, getUserName } from "./accessControlUtils";

export default function UserAssignmentsTab({
  roles,
  users,
  branches = [],
  canDeleteUsers = false,
  keywords,
  page,
  pageCount,
  pageLimit,
  showingStart,
  totalEntries,
  onAssignRole,
  onKeywordsChange,
  onPageChange,
  onPageLimitChange,
  onRevokeRole,
  onSyncBranches,
  onDeleteUser,
}) {
  const [savingUserId, setSavingUserId] = useState(null);

  const branchOptions = useMemo(
    () =>
      (branches || []).map((branch) => ({
        id: Number(branch.id),
        label: branch.name_en || branch.name_ar || `Branch #${branch.id}`,
      })),
    [branches]
  );

  const toggleBranch = async (user, branchId) => {
    if (!onSyncBranches) return;
    const currentIds = (user.branches || []).map((b) => Number(b.id));
    const nextIds = currentIds.includes(branchId)
      ? currentIds.filter((id) => id !== branchId)
      : [...currentIds, branchId];
    setSavingUserId(user.id);
    try {
      await onSyncBranches(user.id, nextIds);
    } finally {
      setSavingUserId(null);
    }
  };

  return (
    <div className="py-3 access-control-user-assignments access-control-user-list">
      <div className="mb-3">
        <div className="position-relative access-control-user-search">
          <i className="bi bi-search fs-5 px-3 py-1 text-secondary position-absolute"></i>
          <input
            type="text"
            className="form-control px-5 text-dark-custom dashboard-search-input"
            placeholder="Search..."
            value={keywords}
            onChange={(event) => onKeywordsChange(event.target.value)}
          />
        </div>
      </div>

      <div className="px-0 pt-0 rounded-2 p-0 mt-3">
        <div className="table-responsive">
          <div className="data-table">
            <table className="table datatable-wrapper">
              <thead>
                <tr>
                  <th className="fw-medium fs-14 fnt-color text-nowrap">Name</th>
                  <th className="fw-medium fs-14 fnt-color text-nowrap">
                    Phone number
                  </th>
                  <th className="fw-medium fs-14 fnt-color text-nowrap">
                    Assigned roles
                  </th>
                  <th className="fw-medium fs-14 fnt-color text-nowrap">
                    Branches
                  </th>
                  {canDeleteUsers && (
                    <th className="fw-medium fs-14 fnt-color text-nowrap">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="fw-normal fs-14 fnt-color">
                      <div className="d-flex align-items-center gap-2">
                        <div className="access-control-user-avatar">
                          {getUserInitials(user)}
                        </div>
                        <div className="min-w-0">
                          <div className="fw-medium fnt-color text-truncate">
                            {getUserName(user)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="fw-normal fs-14 fnt-color">
                      {user.phone_number || "N/A"}
                    </td>
                    <td className="fw-normal fs-14 fnt-color">
                      <div className="d-flex flex-wrap align-items-center gap-2">
                        {(user.rbacRoles || []).map((role) => (
                          <span
                            key={role.id}
                            className="access-control-role-chip d-inline-flex align-items-center gap-2"
                          >
                            {getRoleName(role)}
                            <button
                              type="button"
                              className="border-0 bg-transparent p-0 lh-1 text-secondary"
                              aria-label="Remove role"
                              onClick={() => onRevokeRole(user.id, role.id)}
                            >
                              <i className="bi bi-x"></i>
                            </button>
                          </span>
                        ))}
                        <Dropdown>
                          <Dropdown.Toggle
                            as="button"
                            type="button"
                            className="access-control-add-role-btn"
                            aria-label="Assign role"
                          >
                            <i className="bi bi-plus-lg"></i>
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            {roles
                              .filter(
                                (role) =>
                                  !(user.rbacRoles || []).some(
                                    (assignedRole) =>
                                      Number(assignedRole.id) === Number(role.id)
                                  )
                              )
                              .map((role) => (
                                <Dropdown.Item
                                  key={role.id}
                                  onClick={() => onAssignRole(user.id, role.id)}
                                >
                                  {getRoleName(role)}
                                </Dropdown.Item>
                              ))}
                            {roles.every((role) =>
                              (user.rbacRoles || []).some(
                                (assignedRole) =>
                                  Number(assignedRole.id) === Number(role.id)
                              )
                            ) && (
                              <Dropdown.Item disabled>
                                No roles available
                              </Dropdown.Item>
                            )}
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                    </td>
                    <td className="fw-normal fs-14 fnt-color">
                      <div className="d-flex flex-wrap align-items-center gap-2">
                        {(user.branches || []).map((branch) => (
                          <span
                            key={branch.id}
                            className="access-control-role-chip d-inline-flex align-items-center gap-2"
                          >
                            {branch.name_en || branch.name_ar || branch.id}
                            <button
                              type="button"
                              className="border-0 bg-transparent p-0 lh-1 text-secondary"
                              aria-label="Remove branch"
                              disabled={savingUserId === user.id}
                              onClick={() => toggleBranch(user, Number(branch.id))}
                            >
                              <i className="bi bi-x"></i>
                            </button>
                          </span>
                        ))}
                        <Dropdown autoClose="outside">
                          <Dropdown.Toggle
                            as="button"
                            type="button"
                            className="access-control-add-role-btn"
                            aria-label="Assign branch"
                            disabled={savingUserId === user.id}
                          >
                            <i className="bi bi-plus-lg"></i>
                          </Dropdown.Toggle>
                          <Dropdown.Menu style={{ maxHeight: 280, overflowY: "auto" }}>
                            {branchOptions.length === 0 && (
                              <Dropdown.Item disabled>No branches</Dropdown.Item>
                            )}
                            {branchOptions.map((branch) => {
                              const assigned = (user.branches || []).some(
                                (b) => Number(b.id) === branch.id
                              );
                              return (
                                <Dropdown.Item
                                  key={branch.id}
                                  active={assigned}
                                  onClick={() => toggleBranch(user, branch.id)}
                                >
                                  {assigned ? "✓ " : ""}
                                  {branch.label}
                                </Dropdown.Item>
                              );
                            })}
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                    </td>
                    {canDeleteUsers && (
                      <td className="fw-normal fs-14 fnt-color">
                        <div className="d-flex gap-1">
                          <div
                            className="action-btn d-flex justify-content-center align-items-center bg-transparent rounded-2"
                            role="button"
                            title="Delete user"
                            onClick={() => onDeleteUser?.(user.id)}
                          >
                            <i className="bi bi-trash text-danger"></i>
                          </div>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}

                {totalEntries === 0 && (
                  <tr>
                    <td
                      colSpan={canDeleteUsers ? "5" : "4"}
                      className="text-secondary py-4"
                    >
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AccessControlPagination
        ariaLabel="User assignments pagination"
        currentPage={page}
        pageCount={pageCount}
        pageLimit={pageLimit}
        showingStart={showingStart}
        totalEntries={totalEntries}
        onPageChange={onPageChange}
        onPageLimitChange={onPageLimitChange}
      />
    </div>
  );
}
