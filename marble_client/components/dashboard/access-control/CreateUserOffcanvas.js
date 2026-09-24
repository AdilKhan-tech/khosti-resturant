import { useEffect, useMemo, useState } from "react";
import Offcanvas from "react-bootstrap/Offcanvas";
import { getRoleName } from "./accessControlUtils";

const EMPTY_FORM = {
  full_name: "",
  phone_number: "",
  password: "",
  role_ids: [],
  branch_ids: [],
};

export default function CreateUserOffcanvas({
  show,
  roles = [],
  branches = [],
  onHide,
  onSubmit,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (show) {
      setForm(EMPTY_FORM);
      setShowPassword(false);
    }
  }, [show]);

  const branchOptions = useMemo(
    () =>
      (branches || []).map((branch) => ({
        id: Number(branch.id),
        label: branch.name_en || branch.name_ar || `Branch #${branch.id}`,
      })),
    [branches]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const toggleId = (key, id) => {
    setForm((current) => {
      const list = current[key];
      const next = list.includes(id)
        ? list.filter((item) => item !== id)
        : [...list, id];
      return { ...current, [key]: next };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(form);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Offcanvas show={show} onHide={onHide} placement="end">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>
          <div className="fs-24 fnt-color">Create User</div>
        </Offcanvas.Title>
      </Offcanvas.Header>
      <hr className="mt-0" />
      <Offcanvas.Body>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Full name</label>
            <input
              type="text"
              className="form-control"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Phone number</label>
            <input
              type="tel"
              className="form-control"
              name="phone_number"
              placeholder="05XXXXXXXX"
              value={form.phone_number}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <div className="position-relative">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control pe-5"
                name="password"
                value={form.password}
                onChange={handleChange}
                minLength={6}
                required
              />
              <button
                type="button"
                className="btn position-absolute top-50 end-0 translate-middle-y border-0 text-secondary"
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
              </button>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Roles</label>
            <div className="border rounded-2 p-2" style={{ maxHeight: 200, overflowY: "auto" }}>
              {roles.length === 0 ? (
                <p className="text-secondary small mb-0">No roles available.</p>
              ) : (
                roles.map((role) => (
                  <div className="form-check" key={role.id}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`create-user-role-${role.id}`}
                      checked={form.role_ids.includes(Number(role.id))}
                      onChange={() => toggleId("role_ids", Number(role.id))}
                    />
                    <label
                      className="form-check-label"
                      htmlFor={`create-user-role-${role.id}`}
                    >
                      {getRoleName(role)}
                    </label>
                  </div>
                ))
              )}
            </div>
            <p className="text-secondary small mb-0 mt-1">
              Assign at least one role so the user can access the dashboard.
            </p>
          </div>

          {branchOptions.length > 0 ? (
            <div className="mb-3">
              <label className="form-label">Branches (optional)</label>
              <div className="border rounded-2 p-2" style={{ maxHeight: 180, overflowY: "auto" }}>
                {branchOptions.map((branch) => (
                  <div className="form-check" key={branch.id}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`create-user-branch-${branch.id}`}
                      checked={form.branch_ids.includes(branch.id)}
                      onChange={() => toggleId("branch_ids", branch.id)}
                    />
                    <label
                      className="form-check-label"
                      htmlFor={`create-user-branch-${branch.id}`}
                    >
                      {branch.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <button
            type="submit"
            className="btn-orange text-white border-0"
            disabled={submitting}
          >
            {submitting ? "Creating..." : "Create user"}
          </button>
        </form>
      </Offcanvas.Body>
    </Offcanvas>
  );
}
