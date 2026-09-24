import AccessControlPagination from "./AccessControlPagination";
import { getRoleName, getUserInitials, getUserName } from "./accessControlUtils";

export default function RoleUsersTab({
  activeRoleId,
  assignedUsers,
  page,
  pageCount,
  pageLimit,
  showingStart,
  totalEntries,
  onAddRoleClick,
  onPageChange,
  onPageLimitChange,
}) {
  return (
    <div className="py-3 access-control-user-list">
      <div className="d-flex justify-content-end mb-3">
        <button
          type="button"
          className="btn border rounded-3 fnt-color"
          disabled={!activeRoleId}
          onClick={onAddRoleClick}
        >
          <i className="bi bi-plus-lg me-1"></i>
          Add Role
        </button>
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
              </tr>
            </thead>
            <tbody>
              {assignedUsers.map((user) => (
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
                      {(user.rbacRoles || [])
                        .filter((role) => Number(role.id) === Number(activeRoleId))
                        .map((role) => (
                          <span
                            key={role.id}
                            className="access-control-role-chip d-inline-flex align-items-center gap-2"
                          >
                            {getRoleName(role)}
                          </span>
                        ))}
                    </div>
                  </td>
                </tr>
              ))}
              {totalEntries === 0 && (
                <tr>
                  <td colSpan="3" className="text-secondary py-4">
                    No users assigned to this role.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>

      <AccessControlPagination
        ariaLabel="Role users pagination"
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

