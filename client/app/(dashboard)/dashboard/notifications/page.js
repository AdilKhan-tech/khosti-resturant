import DashboardShell from "../../../../components/dashboard/DashboardShell";

const notifications = [
  [
    "New booking received",
    "Mia Anderson booked Garden Residence for 5 nights.",
    "8 minutes ago",
    "bi-calendar2-check",
    "unread",
  ],
  [
    "Payment requires review",
    "Payment PM-8819 is still pending verification.",
    "42 minutes ago",
    "bi-wallet2",
    "unread",
  ],
  [
    "Room maintenance complete",
    "Room 506 is available for housekeeping inspection.",
    "2 hours ago",
    "bi-tools",
    "",
  ],
  [
    "New guest review",
    "Sophia Miller left a 5-star review for Premier Suite.",
    "Yesterday",
    "bi-star",
    "",
  ],
];

export default function NotificationsPage() {
  return (
    <DashboardShell
      eyebrow="Stay informed"
      title="Notifications"
      action={
        <button type="button" className="btn btn-outline-dark px-4 py-3">
          <i className="bi bi-check2-all me-2"></i>Mark all read
        </button>
      }
    >
      <section className="dashboard-page-content">
        <div className="dashboard-panel">
          <div className="dashboard-panel-heading">
            <div>
              <p className="section-tag mb-1">Activity center</p>
              <h3>Recent notifications</h3>
            </div>
            <span className="notification-count">2 unread</span>
          </div>
          {notifications.map(([title, text, time, icon, unread]) => (
            <div className={`notification-row ${unread}`} key={title}>
              <span className="notification-icon">
                <i className={`bi ${icon}`}></i>
              </span>
              <div>
                <strong>{title}</strong>
                <p>{text}</p>
                <small>{time}</small>
              </div>
              {unread && <span className="notification-dot"></span>}
            </div>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}
