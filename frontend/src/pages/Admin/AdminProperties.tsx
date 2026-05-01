import React, { useEffect, useState } from "react";
import { simpleApi } from "../../lib/simpleApi";

const AdminProperties: React.FC = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [city, setCity] = useState("");
  const [colony, setColony] = useState("");
  const [area, setArea] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const res = await simpleApi.get("/admin/properties", {
        params: { city, colony, area },
      });
      setProperties(res.data.properties);
    } catch {
      setProperties([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProperties();
    // eslint-disable-next-line
  }, [city, colony, area]);

  return (
    <div>
      <h3>All Properties</h3>
      <div>
        <input
          placeholder="Filter by City"
          value={city}
          onChange={e => setCity(e.target.value)}
        />
        <input
          placeholder="Filter by Colony"
          value={colony}
          onChange={e => setColony(e.target.value)}
        />
        <input
          placeholder="Filter by Area"
          value={area}
          onChange={e => setArea(e.target.value)}
        />
        <button onClick={fetchProperties}>Refresh</button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>City</th>
              <th>Colony</th>
              <th>Area</th>
              <th>Rent</th>
            </tr>
          </thead>
          <tbody>
            {properties.map(p => (
              <tr key={p._id}>
                <td>{p.title}</td>
                <td>{p.city}</td>
                <td>{p.colony}</td>
                <td>{p.addressLine}</td>
                <td>{p.monthlyRent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminProperties;
