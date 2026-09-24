"use client";
import Header from "@/components/dashboard/layout/Header";

const Dashboard = ({ children }) => {
  return (
    <div className="dashboard-shell bg-page min-vh-100 d-flex flex-column">
      <Header />
      {children}
    </div>
  );
};

export default Dashboard;
