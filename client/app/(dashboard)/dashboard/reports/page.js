import DashboardShell from "../../../../components/dashboard/DashboardShell";

const channels = [
  ["Direct website", "42%", "$20,244", "bi-globe2"],
  ["Booking partners", "31%", "$14,942", "bi-building"],
  ["Travel agencies", "17%", "$8,194", "bi-briefcase"],
  ["Walk-ins", "10%", "$4,820", "bi-person-walking"],
];

export default function ReportsPage() {
  return (
    <DashboardShell
      eyebrow="Performance"
      title="Reports and insights"
      action={
        <button type="button" className="btn btn-outline-dark px-4 py-3">
          <i className="bi bi-download me-2"></i>Download report
        </button>
      }
    >
      <section className="dashboard-page-content">
        <div className="report-toolbar">
          <div>
            <p className="section-tag mb-1">September 2026</p>
            <h3>Monthly performance</h3>
          </div>
          <select className="form-select dashboard-select" defaultValue="month">
            <option value="month">This month</option>
            <option>Last month</option>
            <option>This quarter</option>
          </select>
        </div>
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="dashboard-report-card">
              <span>Revenue</span>
              <strong>$48,200</strong>
              <small className="text-success">
                <i className="bi bi-arrow-up-right me-1"></i>12.8% vs last month
              </small>
            </div>
          </div>
          <div className="col-md-4">
            <div className="dashboard-report-card">
              <span>Average occupancy</span>
              <strong>78%</strong>
              <small className="text-success">
                <i className="bi bi-arrow-up-right me-1"></i>6.4% vs last month
              </small>
            </div>
          </div>
          <div className="col-md-4">
            <div className="dashboard-report-card">
              <span>Average daily rate</span>
              <strong>$284</strong>
              <small className="text-success">
                <i className="bi bi-arrow-up-right me-1"></i>4.2% vs last month
              </small>
            </div>
          </div>
        </div>
        <div className="row g-4">
          <div className="col-xl-7">
            <div className="dashboard-panel h-100">
              <div className="dashboard-panel-heading">
                <div>
                  <p className="section-tag mb-1">Revenue trend</p>
                  <h3>Monthly revenue</h3>
                </div>
                <span className="report-period">Last 6 months</span>
              </div>
              <div className="report-chart">
                <div className="chart-grid">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="chart-bars">
                  <i style={{ height: "42%" }}></i>
                  <i style={{ height: "58%" }}></i>
                  <i style={{ height: "51%" }}></i>
                  <i style={{ height: "68%" }}></i>
                  <i style={{ height: "76%" }}></i>
                  <i className="current" style={{ height: "92%" }}></i>
                </div>
                <div className="chart-labels">
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                  <span>Jul</span>
                  <span>Aug</span>
                  <span>Sep</span>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-5">
            <div className="dashboard-panel h-100">
              <div className="dashboard-panel-heading">
                <div>
                  <p className="section-tag mb-1">Sales mix</p>
                  <h3>Booking channels</h3>
                </div>
              </div>
              {channels.map(([name, percent, amount, icon]) => (
                <div className="channel-row" key={name}>
                  <span className="channel-icon">
                    <i className={`bi ${icon}`}></i>
                  </span>
                  <div className="channel-copy">
                    <div>
                      <strong>{name}</strong>
                      <span>{amount}</span>
                    </div>
                    <div className="channel-track">
                      <i style={{ width: percent }}></i>
                    </div>
                  </div>
                  <b>{percent}</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
