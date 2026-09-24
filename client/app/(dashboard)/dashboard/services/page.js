import AddService from "../../../../components/dashboard/service/AddService";
import DashboardShell from "../../../../components/dashboard/DashboardShell";

const services = [
  ["Airport transfer", "Transport", "$45", "Available", "bi-car-front"],
  ["Breakfast buffet", "Dining", "$28", "Available", "bi-cup-hot"],
  ["Spa treatment", "Wellness", "$95", "Available", "bi-flower1"],
  ["Late checkout", "Stay", "$40", "Limited", "bi-clock"],
];

export default function ServicesPage() {
  return (
    <DashboardShell
      eyebrow="Guest experience"
      title="Hotel services"
      action={<AddService />}
    >
      <section className="dashboard-page-content">
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="dashboard-mini-stat">
              <i className="bi bi-stars"></i>
              <div>
                <small>Active services</small>
                <strong>18</strong>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="dashboard-mini-stat">
              <i className="bi bi-cart-check"></i>
              <div>
                <small>Orders this month</small>
                <strong>342</strong>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="dashboard-mini-stat">
              <i className="bi bi-wallet2"></i>
              <div>
                <small>Service revenue</small>
                <strong>$8.4k</strong>
              </div>
            </div>
          </div>
        </div>
        <div className="dashboard-panel">
          <div className="dashboard-panel-heading">
            <div>
              <p className="section-tag mb-1">Service catalogue</p>
              <h3>Available services</h3>
            </div>
            <button type="button" className="btn btn-sm btn-outline-dark">
              <i className="bi bi-funnel me-2"></i>Filter
            </button>
          </div>
          <div className="table-responsive">
            <table className="table dashboard-table align-middle mb-0">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {services.map(([name, category, price, status, icon]) => (
                  <tr key={name}>
                    <td>
                      <div className="service-cell">
                        <span className="service-icon">
                          <i className={`bi ${icon}`}></i>
                        </span>
                        <strong>{name}</strong>
                      </div>
                    </td>
                    <td>{category}</td>
                    <td className="fw-semibold">{price}</td>
                    <td>
                      <span className="room-status-pill available">
                        {status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="dashboard-table-action"
                        aria-label={`Edit ${name}`}
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
