export default function DashboardHeader({ email, onToggleSidebar }) {
  return (
    <header className="dashboard-topbar">
      <div className="dashboard-topbar-leading">
        <button
          type="button"
          className="dashboard-mobile-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <i className="bi bi-list"></i>
        </button>
        <div className="dashboard-search">
          <i className="bi bi-search"></i>
          <input type="text" placeholder="Search bookings, guests, rooms" />
        </div>
      </div>
      <div className="dashboard-topbar-actions">
        <button
          type="button"
          className="dashboard-icon-btn"
          aria-label="Notifications"
        >
          <i className="bi bi-bell"></i>
        </button>
        <button
          type="button"
          className="dashboard-icon-btn"
          aria-label="Messages"
        >
          <i className="bi bi-chat-left-text"></i>
        </button>
        <div className="dashboard-user-pill">
          <span className="mini-avatar">
            {(email || "A").charAt(0).toUpperCase()}
          </span>
          <span>{email || "Admin"}</span>
        </div>
      </div>
    </header>
  );
}
