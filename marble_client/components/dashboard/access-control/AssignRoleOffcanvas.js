import Offcanvas from "react-bootstrap/Offcanvas";
import AccessControlPagination from "./AccessControlPagination";
import { getUserName } from "./accessControlUtils";

export default function AssignRoleOffcanvas({
  activeRoleId,
  page,
  pageCount,
  pageLimit,
  showingStart,
  show,
  totalEntries,
  users,
  onAssignRole,
  onHide,
  onPageChange,
  onPageLimitChange,
}) {
  return (
    <Offcanvas
      show={show}
      onHide={onHide}
      placement="end"
      className="access-control-add-role-offcanvas"
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>
          <div className="fs-24 fnt-color">Add Role</div>
        </Offcanvas.Title>
      </Offcanvas.Header>
      <hr className="mt-0 mb-0" />
      <Offcanvas.Body className="d-flex flex-column">
        <div className="fw-semibold fnt-color mb-2">{totalEntries} Employees</div>

        <div className="flex-fill">
          {users.map((user) => {
            const isAssigned = (user.rbacRoles || []).some(
              (role) => Number(role.id) === Number(activeRoleId)
            );

            return (
              <div
                key={user.id}
                className="d-flex align-items-center justify-content-between gap-3 border-bottom py-3"
              >
                <div className="d-flex align-items-center gap-2 min-w-0">
                  <i className="bi bi-person-circle fs-2 fnt-color flex-shrink-0"></i>
                  <div className="min-w-0">
                    <div className="fw-semibold fnt-color text-truncate">
                      {getUserName(user)}
                    </div>
                    <div className="fnt-color text-truncate">
                      {user.phone_number || "N/A"}
                    </div>
                  </div>
                </div>

                {isAssigned ? (
                  <span className="fnt-color flex-shrink-0">Added</span>
                ) : (
                  <button
                    type="button"
                    className="border-0 bg-transparent fnt-color flex-shrink-0"
                    onClick={() => onAssignRole(user.id, activeRoleId)}
                  >
                    +Add
                  </button>
                )}
              </div>
            );
          })}

          {totalEntries === 0 && (
            <div className="text-secondary py-4">No users found.</div>
          )}
        </div>

        <AccessControlPagination
          ariaLabel="Add role users pagination"
          currentPage={page}
          pageCount={pageCount}
          pageLimit={pageLimit}
          showingStart={showingStart}
          totalEntries={totalEntries}
          onPageChange={onPageChange}
          onPageLimitChange={onPageLimitChange}
        />
      </Offcanvas.Body>
    </Offcanvas>
  );
}

