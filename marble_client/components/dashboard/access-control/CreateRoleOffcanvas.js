import Offcanvas from "react-bootstrap/Offcanvas";

export default function CreateRoleOffcanvas({
  form,
  show,
  onChange,
  onHide,
  onSubmit,
}) {
  return (
    <Offcanvas show={show} onHide={onHide} placement="end">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>
          <div className="fs-24 fnt-color">Create Role</div>
        </Offcanvas.Title>
      </Offcanvas.Header>
      <hr className="mt-0" />
      <Offcanvas.Body>
        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={form.name}
              onChange={onChange}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              name="description"
              rows={4}
              value={form.description}
              onChange={onChange}
            />
          </div>
          <button type="submit" className="btn-orange text-white border-0">
            Save
          </button>
        </form>
      </Offcanvas.Body>
    </Offcanvas>
  );
}

