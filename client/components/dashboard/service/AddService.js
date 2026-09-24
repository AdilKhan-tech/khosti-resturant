"use client";

import { useState } from "react";
import DashboardCanvas from "../DashboardCanvas";

export default function AddService() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="btn btn-primary px-4 py-3"
        onClick={() => setOpen(true)}
      >
        <i className="bi bi-plus-lg me-2"></i>Add service
      </button>
      <DashboardCanvas
        open={open}
        onClose={() => setOpen(false)}
        eyebrow="Guest experience"
        title="Add new service"
        icon="bi-stars"
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setOpen(false);
          }}
        >
          <div className="canvas-form-intro">
            Create a service that guests can request during their stay.
          </div>
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label">Service name</label>
              <input
                className="form-control"
                required
                placeholder="Airport transfer"
              />
            </div>
            <div className="col-6">
              <label className="form-label">Category</label>
              <select className="form-select" defaultValue="transport">
                <option value="transport">Transport</option>
                <option value="dining">Dining</option>
                <option value="wellness">Wellness</option>
                <option value="stay">Stay</option>
              </select>
            </div>
            <div className="col-6">
              <label className="form-label">Price</label>
              <input
                type="number"
                className="form-control"
                required
                placeholder="45"
              />
            </div>
            <div className="col-12">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows="4"
                placeholder="Describe what is included in this service"
              ></textarea>
            </div>
            <div className="col-12">
              <label className="form-label">Availability</label>
              <select className="form-select" defaultValue="available">
                <option value="available">Available</option>
                <option value="limited">Limited availability</option>
                <option value="hidden">Hidden from guests</option>
              </select>
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
              Save service
            </button>
          </div>
        </form>
      </DashboardCanvas>
    </>
  );
}
