import React, { useState } from "react";
import AdminUsers from "./AdminUsers";
import AdminProperties from "./AdminProperties";

const AdminDashboard: React.FC = () => {
  const [tab, setTab] = useState<"users" | "properties">("users");
  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      <div>
        <button onClick={() => setTab("users")}>Users</button>
        <button onClick={() => setTab("properties")}>Properties</button>
      </div>
      {tab === "users" ? <AdminUsers /> : <AdminProperties />}
    </div>
  );
};

export default AdminDashboard;
