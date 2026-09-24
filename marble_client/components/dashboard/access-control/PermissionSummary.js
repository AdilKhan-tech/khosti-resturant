export default function PermissionSummary({ groupedPermissions, selectedPermissionIds }) {
  return (
    <>
      <p className="fnt-color mb-3">
        These are the permissions that users will be granted when given this role
      </p>
      <div>
        {groupedPermissions.length === 0 && (
          <p className="text-secondary mb-0">No permissions are available.</p>
        )}
        {groupedPermissions.map((group) => (
          <div key={group?.module?.id}>
            <h5 className="fnt-color mb-2">
              {group?.module?.name || "Module"}
            </h5>
            {(group?.permissions || []).map((permission) => {
              const enabled = selectedPermissionIds.includes(permission.id);

              return (
                <div
                  key={permission.id}
                  className="d-flex align-items-start gap-3 border-bottom py-3"
                >
                  <div className={`${enabled ? "text-success" : "text-danger"} pt-1`}>
                    <i
                      className={`bi ${
                        enabled ? "bi-check-circle-fill" : "bi-x-circle-fill"
                      }`}
                    ></i>
                  </div>
                  <div className="flex-fill">
                    <div className="fw-semibold fnt-color">
                      {permission.description}
                    </div>
                    <div className="text-secondary small">{permission.perm_key}</div>
                  </div>
                  <div className="fw-semibold fnt-color text-nowrap">
                    {enabled ? (
                      <>
                        <i className="bi bi-check-lg me-1"></i>
                        Enabled
                      </>
                    ) : (
                      <i className="bi bi-x-lg text-secondary"></i>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}

