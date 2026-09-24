"use client";

import { usePathname } from "next/navigation";
import Dashboard from "@/layouts/Dashboard";
import Sidebar from "@/components/dashboard/layout/Sidebar";
import DashboardPermissionGate from "@/components/dashboard/layout/DashboardPermissionGate";
import ConfirmDialog from "@/components/dashboard/shared/ConfirmDialog";

/** Routes that render bare (no sidebar/header/permission gate). */
const BARE_ROUTES = new Set(["/dashboard/login"]);

export default function DashboardShell({ children }) {
  const pathname = usePathname();

  if (BARE_ROUTES.has(pathname)) {
    return children;
  }

  return (
    <>
      <Sidebar />
      <Dashboard>
        <main className="main-content-area flex-grow-1 min-w-0">
          <DashboardPermissionGate>{children}</DashboardPermissionGate>
        </main>
      </Dashboard>
      <ConfirmDialog />
    </>
  );
}
