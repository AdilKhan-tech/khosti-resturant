"use client";

import { useState } from "react";
import CustomDatePiker from "../../ui/CustomDatePiker";
import CustomTimePiker from "../../ui/CustomTimePiker";
import Canvas from "../Canvas";

export default function AddBooking() {
  const [open, setOpen] = useState(false);
  const [checkIn, setCheckIn] = useState("2026-10-11");
  const [checkInTime, setCheckInTime] = useState("14:00");
  const [checkOut, setCheckOut] = useState("2026-10-16");
  const [checkOutTime, setCheckOutTime] = useState("11:00");

  return (
    <>
      <button
        type="button"
        className="btn btn-primary px-4 py-3"
        onClick={() => setOpen(true)}
      >
        <i className="bi bi-plus-lg me-2"></i>New reservation
      </button>
      <Canvas
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
              <CustomDatePiker
                label="Check-in"
                value={checkIn}
                onChange={(value) => setCheckIn(value)}
              />
            </div>
            <div className="col-6">
              <CustomDatePiker
                label="Check-out"
                value={checkOut}
                minDate={checkIn}
                onChange={(value) => setCheckOut(value)}
              />
            </div>
            <div className="col-6">
              <CustomTimePiker
                label="Check-in time"
                value={checkInTime}
                onChange={(value) => setCheckInTime(value)}
              />
            </div>
            <div className="col-6">
              <CustomTimePiker
                label="Check-out time"
                value={checkOutTime}
                onChange={(value) => setCheckOutTime(value)}
              />
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
      </Canvas>
    </>
  );
}
