import { CalendarDays, ExternalLink, Home, MapPin, Star, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ContactedProperties.css";
import Navbar from "../../components/Navbar";
import SiteFooter from "../../components/SiteFooter";
import Skeleton from "../../components/Skeleton";
import { apiFetch } from "../../lib/api";
import { useToast } from "../../context/ToastContext";

type ContactedProperty = {
  connectionId: string;
  listingId: string;
  title: string;
  colony: string;
  city: string;
  monthlyRent: number;
  maxOccupants: number;
  coverPhotoUrl: string | null;
  status: "Pending" | "Accepted" | "Rejected";
  isConnected: boolean;
  requestedAt: string;
  respondedAt: string | null;
  listingActive: boolean;
};

const statusClassName = (status: ContactedProperty["status"]) => {
  if (status === "Accepted") return "badge badge-verified";
  if (status === "Rejected") return "badge badge-dark";
  return "badge badge-soft";
};

export default function ContactedPropertiesPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [items, setItems] = useState<ContactedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingByConnection, setRatingByConnection] = useState<Record<string, number>>({});
  const [ratingHoverByConnection, setRatingHoverByConnection] = useState<Record<string, number>>({});
  const [submittingRatingId, setSubmittingRatingId] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ items: ContactedProperty[] }>("/api/connections/mine", { method: "GET" })
      .then((data) => setItems(Array.isArray(data.items) ? data.items : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const handleRateLandlord = async (connectionId: string, title: string) => {
    const score = ratingByConnection[connectionId];
    if (!score) return;
    setSubmittingRatingId(connectionId);
    try {
      await apiFetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId, score, type: "landlord" }),
      });
      showToast(`Rated landlord of "${title}" — ${score} star${score > 1 ? "s" : ""}`, "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to submit rating", "error");
    } finally {
      setSubmittingRatingId(null);
    }
  };

  return (
    <div className="app-shell">
      <Navbar />
      <main className="page-shell">
        <section className="page-section">
          <div className="page-container">
            <div className="profile-hero">
              <div className="contacted-properties-header">
                <div>
                  <p className="eyebrow">Tenant Activity</p>
                  <h1 className="contacted-properties-header-title">Contacted Properties</h1>
                  <p>{items.length} properties you have reached out to.</p>
                </div>
                <button className="btn btn-outline btn-sm" type="button" onClick={() => navigate("/browse")}>
                  Back to Browse
                </button>
              </div>
            </div>

            <div className="surface-card liked-properties-card">
              {loading ? (
                <Skeleton className="contacted-properties-skeleton" />
              ) : items.length === 0 ? (
                <div className="request-empty">
                  <div>
                    <Home size={48} className="contacted-properties-empty-icon" />
                    <h3 className="contacted-properties-empty-title">You have not contacted any properties yet</h3>
                    <p>Once you contact an owner, the property will show up here.</p>
                  </div>
                </div>
              ) : (
                <div className="listing-grid contacted-properties-grid">
                  {items.map((item) => (
                    <article key={item.connectionId} className="listing-card contacted-properties-card" onClick={() => navigate(`/listings/${item.listingId}`)} style={{ cursor: "pointer" }}>
                      <div className="listing-card-image">
                        <div className="listing-card-badges">
                          <div className="listing-card-badges-left">
                            <span className={statusClassName(item.status)}>{item.status}</span>
                          </div>
                        </div>
                        {item.coverPhotoUrl ? (
                          <img src={item.coverPhotoUrl} alt={item.title} />
                        ) : (
                          <div className="listing-card-placeholder">
                            <Home size={66} />
                            <span className="contacted-properties-no-image">NO IMAGE YET</span>
                          </div>
                        )}
                      </div>

                      <div className="listing-card-content">
                        <div className="listing-card-price">
                          ₹{item.monthlyRent.toLocaleString("en-IN")}
                          <span>/month</span>
                        </div>

                        <h3 className="listing-card-title">{item.title}</h3>

                        <div className="listing-card-location">
                          <MapPin size={15} />
                          {item.colony}, {item.city}
                        </div>

                        <div className="listing-card-meta">
                          <span className="listing-card-meta-item">
                            <span className="occupant-icon-group" aria-hidden="true">
                              {Array.from({ length: Math.min(Math.max(item.maxOccupants, 1), 4) }, (_, index) => (
                                <Users key={`${item.connectionId}-${index}`} size={14} />
                              ))}
                            </span>
                            <span>{item.maxOccupants} {item.maxOccupants === 1 ? "occupant" : "occupants"}</span>
                          </span>
                          <span className="listing-card-meta-item">
                            <CalendarDays size={14} />
                            Contacted {new Date(item.requestedAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>

                        {item.isConnected && (
                          <div className="contacted-properties-rate-section" onClick={(e) => e.stopPropagation()}>
                            <p className="contacted-properties-rate-label">Rate this landlord</p>
                            <div className="contacted-properties-rate-stars">
                              {[1, 2, 3, 4, 5].map((star) => {
                                const active = (ratingHoverByConnection[item.connectionId] || ratingByConnection[item.connectionId] || 0) >= star;
                                return (
                                  <button
                                    key={star}
                                    type="button"
                                    className="contacted-properties-star-btn"
                                    onMouseEnter={() => setRatingHoverByConnection((prev) => ({ ...prev, [item.connectionId]: star }))}
                                    onMouseLeave={() => setRatingHoverByConnection((prev) => ({ ...prev, [item.connectionId]: 0 }))}
                                    onClick={() => setRatingByConnection((prev) => ({ ...prev, [item.connectionId]: star }))}
                                  >
                                    <Star size={18} fill={active ? "var(--orange-500, #f97316)" : "none"} stroke={active ? "var(--orange-500, #f97316)" : "currentColor"} />
                                  </button>
                                );
                              })}
                              <button
                                className="btn btn-sm btn-primary contacted-properties-rate-submit"
                                disabled={!ratingByConnection[item.connectionId] || submittingRatingId === item.connectionId}
                                onClick={() => void handleRateLandlord(item.connectionId, item.title)}
                              >
                                {submittingRatingId === item.connectionId ? "Saving…" : "Submit"}
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="contacted-properties-card-footer">
                          <span className={`contacted-properties-card-status ${item.listingActive ? "contacted-properties-card-active" : "contacted-properties-card-inactive"}`}>
                            {item.listingActive ? "Listing active" : "Listing unavailable"}
                          </span>
                          <button className="btn btn-dark btn-sm" onClick={() => navigate(`/listings/${item.listingId}`)}>
                            <ExternalLink size={16} />
                            View Listing
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}