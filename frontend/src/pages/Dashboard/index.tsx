import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError, apiFetch } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import Navbar from "../../components/Navbar";
import Skeleton from "../../components/Skeleton";

type Listing = {
  listingId: string;
  title: string;
  colony: string;
  city: string;
  monthlyRent: number;
  maxOccupants: number;
  furnishingName: string;
  availableFrom: string;
  statusId: number;
  coverPhotoUrl: string | null;
};

type TenantConnection = {
  connectionId: string;
  tenantName: string;
  tenantEmail: string | null;
  tenantPhone: string | null;
  tenantPhoto: string | null;
  listingTitle: string;
  status: "Pending" | "Accepted" | "Rejected";
  isConnected: boolean;
  requestedAt: string;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { showToast } = useToast();
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [connections, setConnections] = useState<TenantConnection[]>([]);
  const [connectionsLoading, setConnectionsLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const loadMine = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const data = await apiFetch<{ listings: Listing[] }>("/api/listings/mine", { method: "GET" });
      setItems(Array.isArray(data.listings) ? data.listings : []);
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 401) {
        await logout();
        navigate("/login", { replace: true });
        return;
      }
      setErrorMsg(error instanceof Error ? error.message : "Failed to load your listings");
    } finally {
      setLoading(false);
    }
  };

  const loadConnections = async () => {
    setConnectionsLoading(true);
    try {
      const data = await apiFetch<{ items: TenantConnection[] }>("/api/connections/landlord", { method: "GET" });
      setConnections(Array.isArray(data.items) ? data.items : []);
    } catch {
      // silently ignore — not critical
    } finally {
      setConnectionsLoading(false);
    }
  };

  useEffect(() => {
    void loadMine();
    void loadConnections();
  }, []);

  const handleDealDone = async (connectionId: string) => {
    setActioningId(connectionId);
    try {
      await apiFetch(`/api/connections/${connectionId}/deal-done`, { method: "PATCH" });
      setConnections((prev) =>
        prev.map((c) => c.connectionId === connectionId ? { ...c, status: "Accepted", isConnected: true } : c)
      );
      showToast("Deal confirmed! Tenant can now leave a review.", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to confirm deal", "error");
    } finally {
      setActioningId(null);
    }
  };

  const handleDealClose = async (connectionId: string) => {
    setActioningId(connectionId);
    try {
      await apiFetch(`/api/connections/${connectionId}/deal-close`, { method: "PATCH" });
      setConnections((prev) =>
        prev.map((c) => c.connectionId === connectionId ? { ...c, status: "Rejected", isConnected: false } : c)
      );
      showToast("Request closed.", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to close request", "error");
    } finally {
      setActioningId(null);
    }
  };

  const handleDeleteConfirm = async (listingId: string) => {
    setConfirmDeleteId(null);
    setDeletingId(listingId);
    try {
      await apiFetch(`/api/listings/${listingId}`, { method: "DELETE" });
      setItems((prev) => prev.filter((item) => item.listingId !== listingId));
      showToast("Property deleted successfully", "success");
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 401) {
        await logout();
        navigate("/login", { replace: true });
        return;
      }
      showToast(error instanceof Error ? error.message : "Failed to delete property", "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <Navbar />
      <div className="listings-container">
        <div className="glass-card" style={{ marginBottom: "1rem" }}>
          <h2 style={{ marginBottom: "0.25rem" }}>My Properties</h2>
          <p style={{ margin: 0, color: "var(--text-muted)" }}>
            Open any listing to edit details.
          </p>
        </div>

        {errorMsg && (
          <div className="glass-card text-center" style={{ color: "#ef4444", marginBottom: "1rem" }}>
            {errorMsg}
          </div>
        )}

        <div className="listings-grid">
          {loading
            ? Array.from({ length: 6 }).map((_, idx) => (
                <div key={`my-listing-skeleton-${idx}`} className="listing-card" style={{ padding: 0, overflow: "hidden" }}>
                  <Skeleton style={{ width: "100%", aspectRatio: "4 / 3" }} />
                  <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <Skeleton style={{ width: "65%", height: 20 }} />
                    <Skeleton style={{ width: "45%", height: 18 }} />
                    <Skeleton style={{ width: "85%", height: 18 }} />
                  </div>
                </div>
              ))
            : items.map((item) => (
                <div key={item.listingId} className="listing-card">
                  <div className="listing-card-image">
                    {item.coverPhotoUrl ? (
                      <img src={item.coverPhotoUrl} alt={item.title} />
                    ) : (
                      <div className="listing-card-placeholder">No Image</div>
                    )}
                  </div>
                  <div className="listing-card-content">
                    <div className="listing-card-price">
                      ₹{Number(item.monthlyRent).toLocaleString("en-IN")}
                      <span className="listing-card-price-label"> /month</span>
                    </div>
                    <h3 className="listing-card-title">{item.title}</h3>
                    <p className="listing-card-location">
                      {item.colony}, {item.city}
                    </p>
                    <p style={{ margin: "0 0 0.75rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>
                      {item.furnishingName} • {item.maxOccupants} occupants • Available{" "}
                      {new Date(item.availableFrom).toLocaleDateString("en-IN")}
                    </p>
                    <button
                      className="btn btn-primary w-full"
                      onClick={() => navigate(`/listings/${item.listingId}`)}
                    >
                      Edit Property
                    </button>
                    <button
                      className="btn btn-outline w-full"
                      style={{ marginTop: "0.5rem", color: "#ef4444", borderColor: "#ef4444" }}
                      onClick={() => setConfirmDeleteId(item.listingId)}
                      disabled={deletingId === item.listingId}
                    >
                      {deletingId === item.listingId ? "Deleting..." : "Delete Property"}
                    </button>
                  </div>
                </div>
              ))}
        </div>

        {!loading && !errorMsg && items.length === 0 && (
          <div className="glass-card text-center" style={{ marginTop: "1rem" }}>
            You have not listed any property yet.
          </div>
        )}

        {/* Tenant Connection Requests */}
        <div className="glass-card" style={{ marginTop: "2rem", marginBottom: "1rem" }}>
          <h2 style={{ marginBottom: "0.25rem" }}>Tenant Requests</h2>
          <p style={{ margin: 0, color: "var(--text-muted)" }}>
            Tenants who want to connect with you. Confirm a deal to let them leave a review.
          </p>
        </div>

        {connectionsLoading ? (
          <div className="listings-grid">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={`conn-skeleton-${idx}`} className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <Skeleton style={{ width: "60%", height: 20 }} />
                <Skeleton style={{ width: "80%", height: 18 }} />
                <Skeleton style={{ width: "40%", height: 18 }} />
              </div>
            ))}
          </div>
        ) : connections.length === 0 ? (
          <div className="glass-card text-center">No tenant requests yet.</div>
        ) : (
          <div className="listings-grid">
            {connections.map((conn) => (
              <div key={conn.connectionId} className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {/* Tenant avatar + name */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  {conn.tenantPhoto ? (
                    <img
                      src={conn.tenantPhoto}
                      alt={conn.tenantName}
                      style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                    />
                  ) : (
                    <div style={{
                      width: 44, height: 44, borderRadius: "50%", background: "var(--brand-primary)",
                      color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, fontSize: "1.125rem", flexShrink: 0,
                    }}>
                      {conn.tenantName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: "0.9375rem", color: "var(--text-primary)" }}>{conn.tenantName}</p>
                    {conn.tenantEmail && <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{conn.tenantEmail}</p>}
                    {conn.tenantPhone && <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--text-muted)" }}>{conn.tenantPhone}</p>}
                  </div>
                </div>

                {/* Listing + date */}
                <div>
                  <p style={{ margin: "0 0 0.25rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                    For: <span style={{ fontWeight: 500 }}>{conn.listingTitle}</span>
                  </p>
                  <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                    Requested {new Date(conn.requestedAt).toLocaleDateString("en-IN")}
                  </p>
                </div>

                {/* Status badge */}
                {conn.status === "Pending" && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.25rem 0.65rem", borderRadius: "9999px", background: "#fffbeb", border: "1px solid #f59e0b", color: "#92400e", fontSize: "0.8125rem", fontWeight: 500 }}>
                    Pending
                  </span>
                )}
                {conn.status === "Accepted" && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.25rem 0.65rem", borderRadius: "9999px", background: "#f0fdf4", border: "1px solid #86efac", color: "#166534", fontSize: "0.8125rem", fontWeight: 500 }}>
                    Deal Confirmed
                  </span>
                )}
                {conn.status === "Rejected" && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.25rem 0.65rem", borderRadius: "9999px", background: "#fef2f2", border: "1px solid #fca5a5", color: "#991b1b", fontSize: "0.8125rem", fontWeight: 500 }}>
                    Closed
                  </span>
                )}

                {/* Action buttons */}
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    className="btn btn-outline"
                    style={{ flex: 1, fontSize: "0.875rem", padding: "0.5rem" }}
                    onClick={() => void handleDealClose(conn.connectionId)}
                    disabled={actioningId === conn.connectionId || conn.status === "Rejected"}
                  >
                    Deal Close
                  </button>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1, fontSize: "0.875rem", padding: "0.5rem" }}
                    onClick={() => void handleDealDone(conn.connectionId)}
                    disabled={actioningId === conn.connectionId || conn.isConnected}
                  >
                    {conn.isConnected ? "Deal Done ✓" : "Deal Done"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {confirmDeleteId && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div className="glass-card" style={{ maxWidth: 400, width: "90%", textAlign: "center" }}>
            <h3 style={{ marginBottom: "0.75rem" }}>Delete Property?</h3>
            <p style={{ marginBottom: "1.25rem", color: "var(--text-muted)" }}>
              This action cannot be undone. The listing will be permanently removed from public view.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <button
                className="btn btn-outline"
                onClick={() => setConfirmDeleteId(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{ background: "#ef4444", borderColor: "#ef4444" }}
                onClick={() => void handleDeleteConfirm(confirmDeleteId)}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
