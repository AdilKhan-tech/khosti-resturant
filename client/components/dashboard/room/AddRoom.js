"use client";

import { useState } from "react";
import DashboardCanvas from "../DashboardCanvas";

export default function AddRoom() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="btn btn-primary px-4 py-3"
        onClick={() => setOpen(true)}
      >
        <i className="bi bi-plus-lg me-2"></i>Add room
      </button>
      <DashboardCanvas
        open={open}
        onClose={() => setOpen(false)}
        eyebrow="Inventory"
        title="Add new room"
        icon="bi-door-open"
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setOpen(false);
          }}
        >
          <div className="canvas-form-intro">
            Add a room to your hotel inventory and define its availability and
            nightly rate.
          </div>
          <div className="row g-3">
            <div className="col-6">
              <label className="form-label">Room number</label>
              <input className="form-control" required placeholder="101" />
            </div>
            <div className="col-6">
              <label className="form-label">Nightly rate</label>
              <input
                type="number"
                className="form-control"
                required
                placeholder="260"
              />
            </div>
            <div className="col-12">
              <label className="form-label">Room name</label>
              <input
                className="form-control"
                required
                placeholder="Deluxe King Room"
              />
            </div>
            <div className="col-12">
              <label className="form-label">Room type</label>
              <select className="form-select" defaultValue="deluxe">
                <option value="deluxe">Deluxe room</option>
                <option value="suite">Suite</option>
                <option value="residence">Residence</option>
              </select>
            </div>
            <div className="col-12">
              <label className="form-label">Room details</label>
              <input
                className="form-control"
                placeholder="King bed · Garden view"
              />
            </div>
            <div className="col-12">
              <label className="form-label">Initial status</label>
              <select className="form-select" defaultValue="available">
                <option value="available">Available</option>
                <option value="cleaning">Cleaning</option>
                <option value="maintenance">Maintenance</option>
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
              Save room
            </button>
          </div>
        </form>
      </DashboardCanvas>
    </>
  );
}
