import AddBooking from "../../../../components/dashboard/booking/AddBooking";
import DashboardShell from "../../../../components/dashboard/DashboardShell";

const bookings = [
  [
    "BK-2048",
    "Olivia Bennett",
    "Premier Suite",
    "24 Sep - 27 Sep",
    "$1,860",
    "Confirmed",
  ],
  [
    "BK-2047",
    "Ethan Carter",
    "Deluxe King Room",
    "24 Sep - 26 Sep",
    "$740",
    "Checked in",
  ],
  [
    "BK-2046",
    "Mia Anderson",
    "Garden Residence",
    "25 Sep - 30 Sep",
    "$2,450",
    "Pending",
  ],
  [
    "BK-2045",
    "Noah Wilson",
    "Executive Twin",
    "26 Sep - 29 Sep",
    "$1,120",
    "Confirmed",
  ],
  [
    "BK-2044",
    "Sophia Miller",
    "Premier Suite",
    "28 Sep - 02 Oct",
    "$2,480",
    "Cancelled",
  ],
];

export default function BookingsPage() {
  return (
    <DashboardShell
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
              <h3>All bookings</h3>
            </div>
            <button type="button" className="btn btn-sm btn-outline-dark">
              <i className="bi bi-download me-2"></i>Export
            </button>
          </div>
          <div className="dashboard-filter-row">
            <button className="active" type="button">
              All bookings
            </button>
            <button type="button">Confirmed</button>
            <button type="button">Pending</button>
            <button type="button">Cancelled</button>
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
                {bookings.map(([id, guest, room, stay, amount, status]) => (
                  <tr key={id}>
                    <td className="fw-semibold">{id}</td>
                    <td>{guest}</td>
                    <td>{room}</td>
                    <td>{stay}</td>
                    <td className="fw-semibold">{amount}</td>
                    <td>
                      <span
                        className={`status-badge ${status.toLowerCase().replace(" ", "-")}`}
                      >
                        {status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
