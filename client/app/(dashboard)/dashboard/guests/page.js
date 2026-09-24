import AddGuest from "../../../../components/dashboard/guest/AddGuest";
import DashboardShell from "../../../../components/dashboard/DashboardShell";

const guests = [
  [
    "Olivia Bennett",
    "olivia.bennett@email.com",
    "Premier Suite",
    "24 Sep 2026",
    "Returning",
  ],
  [
    "Ethan Carter",
    "ethan.carter@email.com",
    "Deluxe King Room",
    "24 Sep 2026",
    "Checked in",
  ],
  [
    "Mia Anderson",
    "mia.anderson@email.com",
    "Garden Residence",
    "25 Sep 2026",
    "New guest",
  ],
  [
    "Noah Wilson",
    "noah.wilson@email.com",
    "Executive Twin",
    "26 Sep 2026",
    "Returning",
  ],
  [
    "Sophia Miller",
    "sophia.miller@email.com",
    "Premier Suite",
    "28 Sep 2026",
    "VIP guest",
  ],
];

export default function GuestsPage() {
  return (
    <DashboardShell
      eyebrow="Guest relations"
      title="Know your guests"
      action={<AddGuest />}
    >
      <section className="dashboard-page-content">
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="dashboard-mini-stat">
              <i className="bi bi-people"></i>
              <div>
                <small>Total guests</small>
                <strong>1,284</strong>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="dashboard-mini-stat">
              <i className="bi bi-star"></i>
              <div>
                <small>Returning guests</small>
                <strong>68%</strong>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="dashboard-mini-stat">
              <i className="bi bi-heart"></i>
              <div>
                <small>VIP guests</small>
                <strong>42</strong>
              </div>
            </div>
          </div>
        </div>
        <div className="dashboard-panel">
          <div className="dashboard-panel-heading">
            <div>
              <p className="section-tag mb-1">Guest directory</p>
              <h3>Recent guests</h3>
            </div>
            <div className="dashboard-inline-search">
              <i className="bi bi-search"></i>
              <input placeholder="Search guests" />
            </div>
          </div>
          <div className="table-responsive">
            <table className="table dashboard-table align-middle mb-0">
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Contact</th>
                  <th>Last room</th>
                  <th>Next arrival</th>
                  <th>Profile</th>
                </tr>
              </thead>
              <tbody>
                {guests.map(([name, email, room, arrival, profile]) => (
                  <tr key={email}>
                    <td>
                      <div className="guest-cell">
                        <span className="guest-avatar">{name.charAt(0)}</span>
                        <strong>{name}</strong>
                      </div>
                    </td>
                    <td>{email}</td>
                    <td>{room}</td>
                    <td>{arrival}</td>
                    <td>
                      <span className="guest-profile-pill">{profile}</span>
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
