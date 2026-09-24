import AccessControlTabs from "./AccessControlTabs";
import PermissionAccordion from "./PermissionAccordion";
import PermissionSummary from "./PermissionSummary";
import RoleUsersTab from "./RoleUsersTab";
import { getRoleName } from "./accessControlUtils";

export default function RolePermissionsPanel({
  activeRole,
  activeRoleId,
  customRoles,
  defaultRoles,
  groupedPermissions,
  isDefaultRoleSelected,
  isLoading,
  roleTabKey,
  roleUsers,
  roleUsersPage,
  roleUsersPageCount,
  roleUsersLimit,
  roleUsersShowingStart,
  selectedPermissionIds,
  totalRoleUsers,
  onAddRoleClick,
  onRoleChange,
  onRoleTabChange,
  onRoleUsersPageChange,
  onRoleUsersLimitChange,
  onTogglePermission,
  onDeleteRole,
}) {
  const renderRoleButton = (role) => (
    <button
      key={role.id}
      type="button"
      className={`w-100 text-start px-2 py-2 border-start-0 border-end-0 border-bottom-0 border-top rounded-2 fw-medium ${
        Number(role.id) === Number(activeRoleId)
          ? "btn-orange text-white"
          : "bg-transparent fnt-color"
      }`}
      style={{ width: "100%", minWidth: 0 }}
      onClick={() => onRoleChange(role.id)}
    >
      {getRoleName(role)}
    </button>
  );

  const isCustomRoleActive =
    activeRole && Number(activeRole.is_default) !== 1;

  return (
    <div className="row g-0">
      <div className="col-lg-3 pe-lg-3 border-end">
        <div className="py-3">
          <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-2">
            <h5 className="mb-0 fnt-color">Roles</h5>
            {isLoading && <span className="spinner-border spinner-border-sm"></span>}
          </div>

          <div className="fw-bold mb-2 px-2">Default</div>
          <div className="d-flex flex-column gap-1">
            {defaultRoles.map(renderRoleButton)}
          </div>

          {customRoles.length > 0 && (
            <>
              <div className="fw-bold mb-2 mt-3 px-2">Custom</div>
              <div className="d-flex flex-column gap-1">
                {customRoles.map(renderRoleButton)}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="col-lg-9 ps-lg-3">
        {isCustomRoleActive && onDeleteRole ? (
          <div className="d-flex justify-content-end pt-3">
            <button
              type="button"
              className="btn btn-danger d-inline-flex align-items-center gap-1"
              onClick={() => onDeleteRole(activeRoleId)}
            >
              <i className="bi bi-trash"></i>
              Delete role
            </button>
          </div>
        ) : null}
        <AccessControlTabs
          activeKey={roleTabKey}
          className="mb-3 pt-3"
          onChange={onRoleTabChange}
          tabs={[
            { key: "summary", label: "Summary" },
            { key: "permissions", label: "Permissions" },
            { key: "users", label: "Users" },
          ]}
        />

        {roleTabKey === "summary" && (
          <div className="py-3">
            {activeRole ? (
              <PermissionSummary
                groupedPermissions={groupedPermissions}
                selectedPermissionIds={selectedPermissionIds}
              />
            ) : (
              <p className="text-secondary">No role selected.</p>
            )}
          </div>
        )}

        {roleTabKey === "permissions" && (
          <div className="py-3">
            <PermissionAccordion
              groupedPermissions={groupedPermissions}
              isDefaultRoleSelected={isDefaultRoleSelected}
              selectedPermissionIds={selectedPermissionIds}
              onTogglePermission={onTogglePermission}
            />
          </div>
        )}

        {roleTabKey === "users" && (
          <RoleUsersTab
            activeRoleId={activeRoleId}
            assignedUsers={roleUsers}
            page={roleUsersPage}
            pageCount={roleUsersPageCount}
            pageLimit={roleUsersLimit}
            showingStart={roleUsersShowingStart}
            totalEntries={totalRoleUsers}
            onAddRoleClick={onAddRoleClick}
            onPageChange={onRoleUsersPageChange}
            onPageLimitChange={onRoleUsersLimitChange}
          />
        )}
      </div>
    </div>
  );
}

