"use client";

import Offcanvas from "react-bootstrap/Offcanvas";

export default function DashboardCanvas({
  open,
  title,
  eyebrow,
  icon,
  onClose,
  children,
}) {
  return (
    <Offcanvas
      show={open}
      onHide={onClose}
      placement="end"
      className="dashboard-offcanvas"
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>
          <div className="dashboard-offcanvas-title">
            <span className="dashboard-canvas-icon">
              <i className={`bi ${icon}`}></i>
            </span>
            <div>
              <p className="section-tag mb-1">{eyebrow}</p>
              <h2>{title}</h2>
            </div>
          </div>
        </Offcanvas.Title>
      </Offcanvas.Header>
      <hr className="mt-0" />
      <Offcanvas.Body>{children}</Offcanvas.Body>
    </Offcanvas>
  );
}
