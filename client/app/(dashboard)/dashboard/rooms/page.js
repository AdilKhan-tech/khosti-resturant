import AddRoom from "../../../../components/dashboard/room/AddRoom";
import DashboardShell from "../../../../components/dashboard/DashboardShell";

const rooms = [
  [
    "101",
    "Deluxe King Room",
    "King bed · Garden view",
    "$260",
    "Available",
    "bi-door-open",
  ],
  [
    "204",
    "Premier Suite",
    "King bed · City view",
    "$620",
    "Occupied",
    "bi-person-check",
  ],
  [
    "308",
    "Garden Residence",
    "King bed · Private terrace",
    "$490",
    "Cleaning",
    "bi-stars",
  ],
  [
    "412",
    "Executive Twin",
    "Twin beds · Lounge access",
    "$330",
    "Available",
    "bi-door-open",
  ],
  [
    "506",
    "Signature Suite",
    "King bed · Ocean view",
    "$780",
    "Maintenance",
    "bi-tools",
  ],
];

export default function RoomsPage() {
  return (
    <DashboardShell
      eyebrow="Inventory"
      title="Rooms and availability"
      action={<AddRoom />}
    >
      <section className="dashboard-page-content">
        <div className="dashboard-room-summary">
          <div>
            <span className="room-summary-dot available"></span>
            <strong>32</strong>
            <small>Available</small>
          </div>
          <div>
            <span className="room-summary-dot occupied"></span>
            <strong>86</strong>
            <small>Occupied</small>
          </div>
          <div>
            <span className="room-summary-dot cleaning"></span>
            <strong>8</strong>
            <small>Cleaning</small>
          </div>
          <div>
            <span className="room-summary-dot maintenance"></span>
            <strong>2</strong>
            <small>Maintenance</small>
          </div>
        </div>
        <div className="dashboard-panel">
          <div className="dashboard-panel-heading">
            <div>
              <p className="section-tag mb-1">Room inventory</p>
              <h3>All rooms</h3>
            </div>
            <select className="form-select dashboard-select" defaultValue="all">
              <option value="all">All room types</option>
              <option>Suites</option>
              <option>Deluxe rooms</option>
            </select>
          </div>
          <div className="table-responsive">
            <table className="table dashboard-table align-middle mb-0">
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Category</th>
                  <th>Details</th>
                  <th>Rate / night</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rooms.map(([number, name, details, rate, status, icon]) => (
                  <tr key={number}>
                    <td>
                      <span className="room-number">{number}</span>
                    </td>
                    <td className="fw-semibold">{name}</td>
                    <td>{details}</td>
                    <td>{rate}</td>
                    <td>
                      <span
                        className={`room-status-pill ${status.toLowerCase()}`}
                      >
                        <i className={`bi ${icon} me-2`}></i>
                        {status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="dashboard-table-action"
                        aria-label={`Edit room ${number}`}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
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
