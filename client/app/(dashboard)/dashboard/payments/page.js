import DashboardShell from "../../../../components/dashboard/DashboardShell";

const payments = [
  ["PM-8821", "Olivia Bennett", "BK-2048", "24 Sep 2026", "$1,860", "Paid"],
  ["PM-8820", "Ethan Carter", "BK-2047", "24 Sep 2026", "$740", "Paid"],
  ["PM-8819", "Mia Anderson", "BK-2046", "23 Sep 2026", "$600", "Pending"],
  ["PM-8818", "Noah Wilson", "BK-2045", "22 Sep 2026", "$1,120", "Refunded"],
];

export default function PaymentsPage() {
  return (
    <DashboardShell
      eyebrow="Finance"
      title="Payments and transactions"
      action={
        <button type="button" className="btn btn-outline-dark px-4 py-3">
          <i className="bi bi-download me-2"></i>Export payments
        </button>
      }
    >
      <section className="dashboard-page-content">
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="dashboard-report-card">
              <span>Collected this month</span>
              <strong>$42,680</strong>
              <small className="text-success">
                <i className="bi bi-arrow-up-right me-1"></i>10.4% vs last month
              </small>
            </div>
          </div>
          <div className="col-md-4">
            <div className="dashboard-report-card">
              <span>Pending payments</span>
              <strong>$3,240</strong>
              <small className="text-warning">12 transactions to review</small>
            </div>
          </div>
          <div className="col-md-4">
            <div className="dashboard-report-card">
              <span>Refunds issued</span>
              <strong>$860</strong>
              <small className="text-secondary">
                4 transactions this month
              </small>
            </div>
          </div>
        </div>
        <div className="dashboard-panel">
          <div className="dashboard-panel-heading">
            <div>
              <p className="section-tag mb-1">Transaction ledger</p>
              <h3>Recent payments</h3>
            </div>
            <select className="form-select dashboard-select" defaultValue="all">
              <option value="all">All statuses</option>
              <option>Paid</option>
              <option>Pending</option>
              <option>Refunded</option>
            </select>
          </div>
          <div className="table-responsive">
            <table className="table dashboard-table align-middle mb-0">
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Guest</th>
                  <th>Booking</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(([id, guest, booking, date, amount, status]) => (
                  <tr key={id}>
                    <td className="fw-semibold">{id}</td>
                    <td>{guest}</td>
                    <td>{booking}</td>
                    <td>{date}</td>
                    <td className="fw-semibold">{amount}</td>
                    <td>
                      <span className={`status-badge ${status.toLowerCase()}`}>
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
