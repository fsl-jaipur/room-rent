import React, { useEffect, useState } from "react";
import { simpleApi } from "../../lib/simpleApi";

interface AdminProperty {
  _id: string;
  title: string;
  city?: string;
  colony?: string;
  addressLine?: string;
  monthlyRent?: number;
  status?: string;
}

const AdminProperties: React.FC = () => {
  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [colony, setColony] = useState("");
  const [area, setArea] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const res = await simpleApi.get("/admin/properties", {
        params: { colony, area },
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
  }, [colony, area]);

  return (
    <section className="admin-section">
      <div className="admin-section__header">
        <div>
          <h3>Properties</h3>
          <p>Review listing inventory and filter it by colony or area.</p>
        </div>
        <div className="admin-count-pill">{properties.length} results</div>
      </div>

      <div className="admin-filters">
        <input
          className="admin-input"
          placeholder="Filter by colony"
          value={colony}
          onChange={e => setColony(e.target.value)}
        />
        <input
          className="admin-input"
          placeholder="Filter by area"
          value={area}
          onChange={e => setArea(e.target.value)}
        />
        <button type="button" className="admin-action-btn" onClick={fetchProperties}>
          Refresh
        </button>
      </div>

      {loading ? <div className="admin-feedback">Loading properties...</div> : null}

      {!loading && properties.length === 0 ? (
        <div className="admin-empty-state">No properties found for the selected filters.</div>
      ) : null}

      {!loading && properties.length > 0 ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>City</th>
                <th>Colony</th>
                <th>Area</th>
                <th>Rent</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((property) => (
                <tr key={property._id}>
                  <td>{property.title}</td>
                  <td>{property.city || "N/A"}</td>
                  <td>{property.colony || "N/A"}</td>
                  <td>{property.addressLine || "N/A"}</td>
                  <td>
                    {typeof property.monthlyRent === "number"
                      ? `Rs. ${property.monthlyRent.toLocaleString()}`
                      : "N/A"}
                  </td>
                  <td>
                    <span className="admin-status-chip is-live">
                      {property.status || "Active"}
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

export default AdminProperties;
