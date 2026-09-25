"use client";

import { useState } from "react";

const panelContent = {
  notifications: {
    title: "Notifications",
    icon: "bi-bell",
    items: [
      {
        icon: "bi-calendar-check",
        title: "New reservation received",
        detail: "A table reservation needs your attention.",
        time: "Just now",
      },
      {
        icon: "bi-door-open",
        title: "Room availability updated",
        detail: "Your room inventory was refreshed.",
        time: "12 min ago",
      },
    ],
  },
  messages: {
    title: "Messages",
    icon: "bi-chat-left-text",
    items: [
      {
        icon: "bi-person-circle",
        title: "Guest support request",
        detail: "A guest has sent a new message.",
        time: "8 min ago",
      },
      {
        icon: "bi-chat-dots",
        title: "Team update",
        detail: "Your operations team shared an update.",
        time: "1 hr ago",
      },
    ],
  },
};

export default function DashboardHeader({ email, onToggleSidebar }) {
  const [activePanel, setActivePanel] = useState(null);

  function togglePanel(panel) {
    setActivePanel((currentPanel) => (currentPanel === panel ? null : panel));
  }

  const activeContent = activePanel ? panelContent[activePanel] : null;

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
        {Object.entries(panelContent).map(([panel, content]) => (
          <button
            type="button"
            className={`dashboard-icon-btn ${activePanel === panel ? "is-active" : ""}`}
            aria-label={content.title}
            aria-expanded={activePanel === panel}
            onClick={() => togglePanel(panel)}
            key={panel}
          >
            <i className={`bi ${content.icon}`}></i>
            <span className="dashboard-icon-dot" aria-hidden="true"></span>
          </button>
        ))}
        <div className="dashboard-user-pill">
          <span className="mini-avatar">
            {(email || "A").charAt(0).toUpperCase()}
          </span>
          <span>{email || "Admin"}</span>
        </div>
        {activeContent ? (
          <div
            className="dashboard-topbar-popover"
            role="dialog"
            aria-label={activeContent.title}
          >
            <div className="dashboard-popover-head">
              <div>
                <p className="dashboard-popover-kicker">Workspace</p>
                <h2>{activeContent.title}</h2>
              </div>
              <button
                type="button"
                className="dashboard-popover-close"
                aria-label={`Close ${activeContent.title.toLowerCase()}`}
                onClick={() => setActivePanel(null)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="dashboard-popover-list">
              {activeContent.items.map((item) => (
                <div className="dashboard-popover-item" key={item.title}>
                  <span className="dashboard-popover-icon">
                    <i className={`bi ${item.icon}`}></i>
                  </span>
                  <span className="dashboard-popover-copy">
                    <strong>{item.title}</strong>
                    <small>{item.detail}</small>
                  </span>
                  <time>{item.time}</time>
                </div>
              ))}
            </div>
            <button type="button" className="dashboard-popover-link">
              View all {activeContent.title.toLowerCase()}
              <i className="bi bi-arrow-up-right"></i>
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
