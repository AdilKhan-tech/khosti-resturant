import Link from "next/link";
import AddBooking from "../booking/AddBooking";
import DashboardShell from "../DashboardShell";

const stats = [
  ["Occupancy", "78%", "+6.4% this month", "bi-bar-chart-line"],
  ["Active bookings", "124", "+18 new this week", "bi-calendar2-check"],
  ["Room revenue", "$48.2k", "+12.8% this month", "bi-wallet2"],
];

const arrivals = [
  ["Olivia Bennett", "Premier Suite", "Today · 14:00", "Confirmed"],
  ["Ethan Carter", "Deluxe King Room", "Today · 16:30", "Confirmed"],
  ["Mia Anderson", "Garden Residence", "Tomorrow · 11:00", "Pending"],
];

export default function Home() {
  return (
    <DashboardShell
      eyebrow="Thursday, 24 September 2026"
      title="Good morning, welcome back."
      action={<AddBooking />}
    >
      <div id="overview">
        <section className="row g-3 mb-4">
          {stats.map(([label, value, change, icon]) => (
            <div className="col-lg-4" key={label}>
              <div className="dashboard-stat">
                <div className="dashboard-stat-icon">
                  <i className={`bi ${icon}`}></i>
                </div>
                <div className="dashboard-stat-copy">
                  <p>{label}</p>
                  <h2>{value}</h2>
                  <small>
                    <i className="bi bi-arrow-up-right me-1"></i>
                    {change}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="row g-4 dashboard-grid">
          <div className="col-xl-8">
            <div className="dashboard-panel">
              <div className="dashboard-panel-heading">
                <div>
                  <p className="section-tag mb-1">Front desk</p>
                  <h3>Upcoming arrivals</h3>
                </div>
                <Link
                  href="/dashboard/bookings"
                  className="btn btn-sm btn-outline-dark"
                >
                  View all
                </Link>
              </div>
              <div className="table-responsive">
                <table className="table dashboard-table align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Guest</th>
                      <th>Room</th>
                      <th>Arrival</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {arrivals.map(([guest, room, time, status]) => (
                      <tr key={guest}>
                        <td className="fw-semibold">{guest}</td>
                        <td>{room}</td>
                        <td>{time}</td>
                        <td>
                          <span
                            className={`status-badge ${status.toLowerCase()}`}
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
          </div>

          <div className="col-xl-4">
            <div className="dashboard-panel h-100">
              <div className="dashboard-panel-heading">
                <div>
                  <p className="section-tag mb-1">Inventory</p>
                  <h3>Room status</h3>
                </div>
                <i className="bi bi-three-dots dashboard-panel-more"></i>
              </div>
              <div className="room-status-row">
                <span>
                  <i className="bi bi-circle-fill available me-2"></i>Available
                </span>
                <strong>32 rooms</strong>
              </div>
              <div className="room-status-row">
                <span>
                  <i className="bi bi-circle-fill occupied me-2"></i>Occupied
                </span>
                <strong>86 rooms</strong>
              </div>
              <div className="room-status-row">
                <span>
                  <i className="bi bi-circle-fill cleaning me-2"></i>Cleaning
                </span>
                <strong>8 rooms</strong>
              </div>
              <div className="room-status-row">
                <span>
                  <i className="bi bi-circle-fill maintenance me-2"></i>
                  Maintenance
                </span>
                <strong>2 rooms</strong>
              </div>
              <div className="occupancy-bar mt-4">
                <span style={{ width: "78%" }}></span>
              </div>
              <p className="small text-secondary mt-2 mb-0">
                78% of rooms are occupied today
              </p>
            </div>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
