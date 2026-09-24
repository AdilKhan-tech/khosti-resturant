import Accordion from "react-bootstrap/Accordion";
import Form from "react-bootstrap/Form";

export default function PermissionAccordion({
  groupedPermissions,
  isDefaultRoleSelected,
  selectedPermissionIds,
  onTogglePermission,
  showControls = true,
}) {
  return (
    <Accordion className="mt-3 access-control-accordion">
      {groupedPermissions.map((group, index) => (
        <Accordion.Item
          eventKey={String(index)}
          key={group?.module?.id || index}
          className="bg-transparent border rounded-3 mb-2 overflow-hidden"
        >
          <Accordion.Header>
            <span className="fw-semibold">
              {group?.module?.name || "Module"}
            </span>
          </Accordion.Header>
          <Accordion.Body className="px-0 pb-0 bg-transparent">
            <div className="table-responsive">
              <table className="table mb-0 align-middle">
                <tbody>
                  {(group?.permissions || []).map((permission, permissionIndex) => {
                    const enabled = selectedPermissionIds.includes(permission.id);

                    return (
                      <tr
                        key={permission.id}
                        className={
                          permissionIndex % 2 === 1 ? "permission-row-muted" : ""
                        }
                      >
                        <td className="border-bottom">
                          <div className="fw-semibold">
                            {permission.description}
                          </div>
                          <div className="text-secondary small">
                            {permission.perm_key}
                          </div>
                        </td>
                        <td className="border-bottom text-end">
                          {showControls ? (
                            <Form.Check
                              type="checkbox"
                              disabled={isDefaultRoleSelected}
                              checked={enabled}
                              onChange={() => onTogglePermission(permission.id)}
                            />
                          ) : (
                            <span
                              className={`badge ${
                                enabled ? "text-bg-success" : "text-bg-light"
                              }`}
                            >
                              {enabled ? "Enabled" : "Disabled"}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Accordion.Body>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}

