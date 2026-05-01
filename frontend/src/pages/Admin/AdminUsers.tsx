import React, { useEffect, useState } from "react";
import { simpleApi } from "../../lib/simpleApi";

interface AdminUser {
  _id: string;
  fullName: string;
  email?: string;
  phone: string;
  city?: string;
  permanentAddress?: string;
  role?: string;
  isActive?: boolean;
}

interface AdminUsersResponse {
  users: AdminUser[];
  total: number;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await simpleApi.get<AdminUsersResponse>("/admin/users", {
        params: { city },
      });
      setUsers(res.users);
    } catch {
      setUsers([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [city]);

  return (
    <section className="admin-section">
      <div className="admin-section__header">
        <div>
          <h3>Users</h3>
          <p>See every registered user and filter the list by city.</p>
        </div>
        <div className="admin-count-pill">{users.length} results</div>
      </div>

      <div className="admin-filters">
        <input
          className="admin-input"
          placeholder="Filter by city"
          value={city}
          onChange={e => setCity(e.target.value)}
        />
        <button type="button" className="admin-action-btn" onClick={fetchUsers}>
          Refresh
        </button>
      </div>

      {loading ? <div className="admin-feedback">Loading users...</div> : null}

      {!loading && users.length === 0 ? (
        <div className="admin-empty-state">No users found for the selected city.</div>
      ) : null}

      {!loading && users.length > 0 ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>City</th>
                <th>Address</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.fullName}</td>
                  <td>{user.email || "No email"}</td>
                  <td>{user.phone}</td>
                  <td>{user.city || "N/A"}</td>
                  <td>{user.permanentAddress || "N/A"}</td>
                  <td className="admin-text-capitalize">{user.role || "tenant"}</td>
                  <td>
                    <span className={`admin-status-chip ${user.isActive ? "is-live" : "is-muted"}`}>
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
};

export default AdminUsers;
