"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function Shell({ children, eyebrow, title, action }) {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const savedUser = window.localStorage.getItem("sona-auth");
    if (!savedUser) {
      router.replace("/");
      return;
    }
    setEmail(JSON.parse(savedUser).email || "Guest");
  }, [router]);

  function logout() {
    window.localStorage.removeItem("sona-auth");
    router.replace("/");
  }

  return (
    <div
      className={`dashboard-shell ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}
    >
      <Sidebar
        pathname={pathname}
        email={email}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((value) => !value)}
        onLogout={logout}
      />

      <main className="dashboard-main">
        <Header
          email={email}
          onToggleSidebar={() => setSidebarCollapsed((value) => !value)}
        />

        <section className="dashboard-header-panel">
          <div>
            <p className="section-tag mb-2">{eyebrow}</p>
            <h1>{title}</h1>
          </div>
          {action}
        </section>

        {children}
      </main>
    </div>
  );
}
