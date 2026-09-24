import DashboardShell from "../../../../components/dashboard/DashboardShell";

const reviews = [
  [
    "Sophia Miller",
    "Premier Suite",
    "Beautiful stay, the team made every detail feel special.",
    "5.0",
    "Today",
  ],
  [
    "James Taylor",
    "Deluxe King Room",
    "The room was spotless and the breakfast was excellent.",
    "4.5",
    "Yesterday",
  ],
  [
    "Amelia Brown",
    "Garden Residence",
    "Quiet, comfortable and perfectly located.",
    "4.8",
    "22 Sep",
  ],
];

export default function ReviewsPage() {
  return (
    <DashboardShell
      eyebrow="Guest feedback"
      title="Reviews and reputation"
      action={
        <button type="button" className="btn btn-outline-dark px-4 py-3">
          <i className="bi bi-download me-2"></i>Export reviews
        </button>
      }
    >
      <section className="dashboard-page-content">
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="dashboard-report-card">
              <span>Overall rating</span>
              <strong>
                4.8 <small className="rating-stars">★★★★★</small>
              </strong>
              <small className="text-success">+0.3 this quarter</small>
            </div>
          </div>
          <div className="col-md-4">
            <div className="dashboard-report-card">
              <span>Total reviews</span>
              <strong>486</strong>
              <small className="text-secondary">32 new this month</small>
            </div>
          </div>
          <div className="col-md-4">
            <div className="dashboard-report-card">
              <span>Response rate</span>
              <strong>96%</strong>
              <small className="text-success">Above hotel average</small>
            </div>
          </div>
        </div>
        <div className="dashboard-panel">
          <div className="dashboard-panel-heading">
            <div>
              <p className="section-tag mb-1">Guest voice</p>
              <h3>Recent reviews</h3>
            </div>
            <button type="button" className="btn btn-sm btn-outline-dark">
              View all
            </button>
          </div>
          {reviews.map(([name, room, text, rating, date]) => (
            <div className="review-row" key={name}>
              <span className="guest-avatar">{name.charAt(0)}</span>
              <div className="review-copy">
                <div>
                  <strong>{name}</strong>
                  <small>
                    {room} · {date}
                  </small>
                </div>
                <p>{text}</p>
              </div>
              <b className="rating-stars">{rating} ★</b>
            </div>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}
