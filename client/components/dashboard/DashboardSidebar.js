import Link from "next/link";

const navigation = [
  ["Overview", "/dashboard", "bi-grid-1x2"],
  ["Bookings", "/dashboard/bookings", "bi-calendar3"],
  ["Rooms", "/dashboard/rooms", "bi-door-open"],
  ["Guests", "/dashboard/guests", "bi-people"],
  ["Calendar", "/dashboard/calendar", "bi-calendar-week"],
  ["Services", "/dashboard/services", "bi-stars"],
  ["Payments", "/dashboard/payments", "bi-credit-card"],
  ["Reports", "/dashboard/reports", "bi-graph-up"],
  ["Reviews", "/dashboard/reviews", "bi-star"],
  ["Notifications", "/dashboard/notifications", "bi-bell"],
  ["Settings", "/dashboard/settings", "bi-gear"],
];

export default function DashboardSidebar({
  pathname,
  email,
  collapsed,
  onToggle,
  onLogout,
}) {
  return (
    <aside className={`dashboard-sidebar ${collapsed ? "is-collapsed" : ""}`}>
      <div className="dashboard-sidebar-head">
        <Link href="/" className="dashboard-brand text-decoration-none">
          <span className="brand-mark">S</span>
          <div className="dashboard-brand-copy">
            <strong>SONA</strong>
            <small>HOTEL OPERATIONS</small>
          </div>
        </Link>
        <button
          type="button"
          className="dashboard-collapse-btn"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <i
            className={`bi ${collapsed ? "bi-chevron-right" : "bi-chevron-left"}`}
          ></i>
        </button>
      </div>

      <div className="dashboard-profile">
        <div className="dashboard-avatar">
          {(email || "A").charAt(0).toUpperCase()}
        </div>
        <div className="dashboard-profile-copy">
          <p className="dashboard-profile-label">Welcome</p>
          <h6>{email || "Admin"}</h6>
        </div>
      </div>

      <p className="dashboard-label">Workspace</p>
      <nav className="dashboard-nav">
        {navigation.map(([label, href, icon]) => (
          <Link
            className={pathname === href ? "active" : ""}
            href={href}
            key={href}
            title={collapsed ? label : undefined}
          >
            <i className={`bi ${icon}`}></i>
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}
      </nav>

      <div className="dashboard-sidebar-footer">
        <div className="dashboard-footer-card">
          <p className="small mb-1">Signed in as</p>
          <p className="mb-0 text-truncate">{email || "admin@sonahotel.com"}</p>
        </div>
        <button
          type="button"
          className="btn btn-outline-light btn-sm w-100 mt-3"
          onClick={onLogout}
          title="Sign out"
        >
          <i className="bi bi-box-arrow-left"></i>
          {!collapsed && <span className="ms-2">Sign out</span>}
        </button>
      </div>
    </aside>
  );
}
