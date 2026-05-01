import React, { useEffect, useState } from "react";
import { simpleApi } from "../../lib/simpleApi";

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [city, setCity] = useState("");
  const [place, setPlace] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await simpleApi.get("/admin/users", {
        params: { city, place },
      });
      setUsers(res.data.users);
    } catch {
      setUsers([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [city, place]);

  return (
    <div>
      <h3>All Users</h3>
      <div>
        <input
          placeholder="Filter by City"
          value={city}
          onChange={e => setCity(e.target.value)}
        />
        <input
          placeholder="Filter by Place"
          value={place}
          onChange={e => setPlace(e.target.value)}
        />
        <button onClick={fetchUsers}>Refresh</button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>City</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td>{u.fullName}</td>
                <td>{u.email}</td>
                <td>{u.phone}</td>
                <td>{u.city}</td>
                <td>{u.permanentAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminUsers;
