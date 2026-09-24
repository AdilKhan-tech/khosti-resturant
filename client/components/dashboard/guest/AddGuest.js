"use client";

import { useState } from "react";
import DashboardCanvas from "../DashboardCanvas";

export default function AddGuest() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="btn btn-primary px-4 py-3"
        onClick={() => setOpen(true)}
      >
        <i className="bi bi-person-plus me-2"></i>Add guest
      </button>
      <DashboardCanvas
        open={open}
        onClose={() => setOpen(false)}
        eyebrow="Guest relations"
        title="Add new guest"
        icon="bi-person-plus"
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setOpen(false);
          }}
        >
          <div className="canvas-form-intro">
            Create a guest profile so the front desk can quickly manage stays
            and preferences.
          </div>
          <div className="row g-3">
            <div className="col-6">
              <label className="form-label">First name</label>
              <input className="form-control" required placeholder="Olivia" />
            </div>
            <div className="col-6">
              <label className="form-label">Last name</label>
              <input className="form-control" required placeholder="Bennett" />
            </div>
            <div className="col-12">
              <label className="form-label">Email address</label>
              <input
                type="email"
                className="form-control"
                required
                placeholder="guest@email.com"
              />
            </div>
            <div className="col-12">
              <label className="form-label">Phone number</label>
              <input className="form-control" placeholder="+1 555 000 0000" />
            </div>
            <div className="col-12">
              <label className="form-label">Guest type</label>
              <select className="form-select" defaultValue="new">
                <option value="new">New guest</option>
                <option value="returning">Returning guest</option>
                <option value="vip">VIP guest</option>
              </select>
            </div>
            <div className="col-12">
              <label className="form-label">Notes</label>
              <textarea
                className="form-control"
                rows="4"
                placeholder="Preferences or special requests"
              ></textarea>
            </div>
          </div>
          <div className="canvas-form-actions">
            <button
              type="button"
              className="btn btn-light form-cancel-btn"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="form-submit-btn">
              Save guest
            </button>
          </div>
        </form>
      </DashboardCanvas>
    </>
  );
}
