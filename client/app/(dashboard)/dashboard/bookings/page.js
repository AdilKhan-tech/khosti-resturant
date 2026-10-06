"use client";

import { useState } from "react";
import AddBooking from "../../../../components/dashboard/booking/AddBooking";
import Shell from "../../../../components/dashboard/Shell";
import { filterBookings } from "../../../../lib/bookingFilters";

const bookings = [
  {
    id: "BK-2048",
    guest: "Olivia Bennett",
    room: "Premier Suite",
    stay: "24 Sep - 27 Sep",
    amount: "$1,860",
    status: "Confirmed",
  },
  {
    id: "BK-2047",
    guest: "Ethan Carter",
    room: "Deluxe King Room",
    stay: "24 Sep - 26 Sep",
    amount: "$740",
    status: "Checked in",
  },
  {
    id: "BK-2046",
    guest: "Mia Anderson",
    room: "Garden Residence",
    stay: "25 Sep - 30 Sep",
    amount: "$2,450",
    status: "Pending",
  },
  {
    id: "BK-2045",
    guest: "Noah Wilson",
    room: "Executive Twin",
    stay: "26 Sep - 29 Sep",
    amount: "$1,120",
    status: "Confirmed",
  },
  {
    id: "BK-2044",
    guest: "Sophia Miller",
    room: "Premier Suite",
    stay: "28 Sep - 02 Oct",
    amount: "$2,480",
    status: "Cancelled",
  },
];

const bookingTabs = ["All bookings", "Confirmed", "Pending", "Cancelled"];

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState("All bookings");
  const visibleBookings = filterBookings(bookings, activeTab);

  return (
    <Shell
      eyebrow="Reservations"
      title="Manage bookings"
      action={<AddBooking />}
    >
      <section className="dashboard-page-content">
        <div className="row g-3 mb-4">
          {[
            ["Total bookings", "248", "bi-calendar2-check"],
            ["Arrivals today", "18", "bi-box-arrow-in-right"],
            ["Pending review", "07", "bi-hourglass-split"],
          ].map(([label, value, icon]) => (
            <div className="col-md-4" key={label}>
              <div className="dashboard-mini-stat">
                <i className={`bi ${icon}`}></i>
                <div>
                  <small>{label}</small>
                  <strong>{value}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="dashboard-panel">
          <div className="dashboard-panel-heading">
            <div>
              <p className="section-tag mb-1">Reservation desk</p>
              <h3>{activeTab}</h3>
            </div>
            <button type="button" className="btn btn-sm btn-outline-dark">
              <i className="bi bi-download me-2"></i>Export
            </button>
          </div>
          <div className="dashboard-filter-row">
            {bookingTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className={activeTab === tab ? "active" : ""}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="table-responsive">
            <table className="table dashboard-table align-middle mb-0">
              <thead>
                <tr>
                  <th>Booking</th>
                  <th>Guest</th>
                  <th>Room</th>
                  <th>Stay</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {visibleBookings.map(
                  ({ id, guest, room, stay, amount, status }) => (
                    <tr key={id}>
                      <td className="fw-semibold">{id}</td>
                      <td>{guest}</td>
                      <td>{room}</td>
                      <td>{stay}</td>
                      <td className="fw-semibold">{amount}</td>
                      <td>
                        <span
                          className={`status-badge ${status.toLowerCase().replace(/\s+/g, "-")}`}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </Shell>
  );
}
