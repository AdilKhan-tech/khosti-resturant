"use client";

import { useState } from "react";
import DashboardCanvas from "../DashboardCanvas";

export default function AddBooking() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="btn btn-primary px-4 py-3"
        onClick={() => setOpen(true)}
      >
        <i className="bi bi-plus-lg me-2"></i>New reservation
      </button>
      <DashboardCanvas
        open={open}
        onClose={() => setOpen(false)}
        eyebrow="Reservations"
        title="New reservation"
        icon="bi-calendar2-plus"
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setOpen(false);
          }}
        >
          <div className="canvas-form-intro">
            Create a reservation and keep your front desk schedule up to date.
          </div>
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label">Guest name</label>
              <input
                className="form-control"
                required
                placeholder="Olivia Bennett"
              />
            </div>
            <div className="col-12">
              <label className="form-label">Room</label>
              <select className="form-select" defaultValue="premier">
                <option value="premier">Premier Suite</option>
                <option value="deluxe">Deluxe King Room</option>
                <option value="garden">Garden Residence</option>
              </select>
            </div>
            <div className="col-6">
              <label className="form-label">Check-in</label>
              <input type="date" className="form-control" required />
            </div>
            <div className="col-6">
              <label className="form-label">Check-out</label>
              <input type="date" className="form-control" required />
            </div>
            <div className="col-6">
              <label className="form-label">Guests</label>
              <input
                type="number"
                className="form-control"
                min="1"
                defaultValue="1"
              />
            </div>
            <div className="col-6">
              <label className="form-label">Payment status</label>
              <select className="form-select" defaultValue="pending">
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
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
              Create booking
            </button>
          </div>
        </form>
      </DashboardCanvas>
    </>
  );
}
