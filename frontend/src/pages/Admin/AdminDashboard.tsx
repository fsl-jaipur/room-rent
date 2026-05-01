import React, { useState } from "react";
import AdminUsers from "./AdminUsers";
import AdminProperties from "./AdminProperties";

const AdminDashboard: React.FC = () => {
  const [tab, setTab] = useState<"users" | "properties">("users");

  return (
    <div className="admin-dashboard-shell">
      <div className="admin-dashboard">
        <div className="admin-dashboard__hero">
          <div>
            <p className="admin-dashboard__eyebrow">Admin Panel</p>
            <h2>Control users and property listings</h2>
            <p className="admin-dashboard__subtitle">
              Switch between people and listings, then narrow results with focused filters.
            </p>
          </div>
        </div>

        <div className="admin-tabs" role="tablist" aria-label="Admin sections">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "users"}
            className={`admin-tab ${tab === "users" ? "is-active" : ""}`}
            onClick={() => setTab("users")}
          >
            Users
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "properties"}
            className={`admin-tab ${tab === "properties" ? "is-active" : ""}`}
            onClick={() => setTab("properties")}
          >
            Properties
          </button>
        </div>

        <div className="admin-panel">
          {tab === "users" ? <AdminUsers /> : <AdminProperties />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
