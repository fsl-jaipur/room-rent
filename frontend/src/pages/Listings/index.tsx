import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError, apiFetch } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

type Listing = {
  listingId: string;
  title: string;
  colony: string;
  city: string;
  state: string;
  monthlyRent: number;
  maxOccupants: number;
  availableFrom: string;
  landlordName: string;
};

type ListingsResponse = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  items: Listing[];
};

export default function ListingsPage() {
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const loadListings = async () => {
      try {
        const data = await apiFetch<ListingsResponse>("/api/listings?page=1&limit=20", {
          method: "GET",
        });
        setItems(data.items);
      } catch (error: unknown) {
        if (error instanceof ApiError && error.status === 401) {
          await logout();
          navigate("/login", { replace: true });
          return;
        }
        setErrorMsg(error instanceof Error ? error.message : "Failed to load listings");
      } finally {
        setLoading(false);
      }
    };

    loadListings();
  }, [logout, navigate]);

  return (
    <div className="flex-col" style={{ gap: "1.5rem" }}>
      <div className="glass-card">
        <div className="flex-row justify-between">
          <div>
            <h2 style={{ marginBottom: "0.25rem" }}>All Listings</h2>
            <p>Browse all active properties</p>
          </div>
          <div className="flex-row">
            <Link to="/add-listing" style={{ textDecoration: "none" }}>
              <button className="btn btn-primary">Add Listing</button>
            </Link>
            <button className="btn btn-outline" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      {loading && <div className="glass-card text-center">Loading listings...</div>}
      {!loading && errorMsg && (
        <div className="glass-card text-center" style={{ color: "#ef4444" }}>
          {errorMsg}
        </div>
      )}

      {!loading && !errorMsg && items.length === 0 && (
        <div className="glass-card text-center">No listings available yet.</div>
      )}

      {!loading && !errorMsg && items.length > 0 && (
        <div className="flex-col">
          {items.map((item) => (
            <div key={item.listingId} className="glass-card">
              <h3>{item.title}</h3>
              <p>
                {item.colony}, {item.city}, {item.state}
              </p>
              <p>
                Rent: Rs. {Number(item.monthlyRent).toLocaleString("en-IN")} | Occupants:{" "}
                {item.maxOccupants} | Available: {item.availableFrom}
              </p>
              <p>Listed by: {item.landlordName}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

