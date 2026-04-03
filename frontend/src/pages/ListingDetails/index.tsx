import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ApiError, apiFetch } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

type ListingPhoto = {
  photoType: "Room" | "Exterior";
  photoUrl: string;
  displayOrder: number;
};

type ListingDetails = {
  listingId: string;
  landlordId: string;
  landlordName: string;
  title: string;
  description: string | null;
  floorLevelId: number;
  floorName: string;
  furnishingTypeId: number;
  furnishingName: string;
  maxOccupants: number;
  allowSmoking: boolean;
  foodPreferenceId: number;
  foodPreferenceName: string;
  monthlyRent: number;
  securityDeposit: number | null;
  availableFrom: string;
  addressLine: string;
  colony: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  statusId: number;
  createdAt: string;
  updatedAt: string;
  propertyTypeId: number | null;
  foodLevelId: number | null;
  bedType: string | null;
  singleBedCount: number | null;
  doubleBedCount: number | null;
  coverPhotoUrl: string | null;
  photos: ListingPhoto[];
};

const propertyTypeMap: Record<number, string> = {
  1: "Apartment",
  2: "Independent House",
  3: "PG",
  4: "Hostel",
};

const foodLevelMap: Record<number, string> = {
  1: "Basic",
  2: "Standard",
  3: "Premium",
};

export default function ListingDetailsPage() {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [item, setItem] = useState<ListingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!listingId) {
        setErrorMsg("Invalid listing id");
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMsg("");
      try {
        const data = await apiFetch<ListingDetails>(`/api/listings/${listingId}`, { method: "GET" });
        setItem(data);
      } catch (error: unknown) {
        if (error instanceof ApiError && error.status === 401) {
          await logout();
          navigate("/login", { replace: true });
          return;
        }
        setErrorMsg(error instanceof Error ? error.message : "Failed to load listing");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [listingId, logout, navigate]);

  const mapUrl = useMemo(() => {
    if (!item) return "";
    return `https://maps.google.com/maps?q=${item.latitude},${item.longitude}&z=15&output=embed`;
  }, [item]);

  return (
    <div className="flex-col" style={{ gap: "1rem" }}>
      <div className="flex-row justify-between">
        <Link to="/listings" style={{ textDecoration: "none" }}>
          <button className="btn btn-outline">Back to Listings</button>
        </Link>
        <button className="btn btn-outline" onClick={logout}>Logout</button>
      </div>

      {loading && <div className="glass-card text-center">Loading property details...</div>}
      {errorMsg && <div className="glass-card text-center" style={{ color: "#ef4444" }}>{errorMsg}</div>}

      {!loading && !errorMsg && item && (
        <>
          <section className="glass-card">
            <h2 style={{ marginBottom: "0.4rem" }}>{item.title}</h2>
            <p style={{ marginBottom: "0.8rem" }}>
              {item.addressLine}
            </p>
            <h3 style={{ fontSize: "1.4rem" }}>
              Rs. {Number(item.monthlyRent).toLocaleString("en-IN")} / month
            </h3>
            <p>Security Deposit: Rs. {Number(item.securityDeposit || 0).toLocaleString("en-IN")}</p>
          </section>

          <section className="glass-card">
            <h3 style={{ marginBottom: "0.8rem" }}>Property Photos</h3>
            {item.photos.length === 0 ? (
              <p>No photos available.</p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: "0.75rem",
                }}
              >
                {item.photos.map((photo, index) => (
                  <div key={`${photo.photoType}-${photo.displayOrder}-${index}`} style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid var(--border-color)" }}>
                    <img
                      src={photo.photoUrl}
                      alt={`${photo.photoType} ${photo.displayOrder}`}
                      style={{ width: "100%", height: "180px", objectFit: "cover", display: "block" }}
                    />
                    <p style={{ padding: "0.45rem 0.55rem", fontSize: "0.82rem" }}>
                      {photo.photoType} #{photo.displayOrder}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="glass-card">
            <h3 style={{ marginBottom: "0.8rem" }}>Property Information</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: "0.8rem 1rem",
              }}
            >
              <p><strong>Landlord:</strong> {item.landlordName}</p>
              <p><strong>Floor:</strong> {item.floorName}</p>
              <p><strong>Furnishing:</strong> {item.furnishingName}</p>
              <p><strong>Food Preference:</strong> {item.foodPreferenceName}</p>
              <p><strong>Occupants:</strong> {item.maxOccupants}</p>
              <p><strong>Smoking:</strong> {item.allowSmoking ? "Allowed" : "Not Allowed"}</p>
              <p><strong>Property Type:</strong> {item.propertyTypeId ? propertyTypeMap[item.propertyTypeId] || item.propertyTypeId : "N/A"}</p>
              <p><strong>Food Level:</strong> {item.foodLevelId ? foodLevelMap[item.foodLevelId] || item.foodLevelId : "N/A"}</p>
              <p><strong>Bed Type:</strong> {item.bedType || "N/A"}</p>
              <p><strong>Single Beds:</strong> {item.singleBedCount ?? "N/A"}</p>
              <p><strong>Double Beds:</strong> {item.doubleBedCount ?? "N/A"}</p>
              <p><strong>Available From:</strong> {item.availableFrom}</p>
              <p><strong>City:</strong> {item.city}</p>
              <p><strong>State:</strong> {item.state}</p>
              <p><strong>Pincode:</strong> {item.pincode}</p>
              <p><strong>Latitude:</strong> {item.latitude}</p>
              <p><strong>Longitude:</strong> {item.longitude}</p>
            </div>

            {item.description ? (
              <div style={{ marginTop: "0.8rem" }}>
                <p><strong>Description:</strong></p>
                <p>{item.description}</p>
              </div>
            ) : null}
          </section>

          <section className="glass-card">
            <h3 style={{ marginBottom: "0.8rem" }}>Map</h3>
            <iframe
              title="Property Location"
              src={mapUrl}
              loading="lazy"
              style={{ width: "100%", height: "380px", border: 0, borderRadius: "12px" }}
              referrerPolicy="no-referrer-when-downgrade"
            />
          </section>
        </>
      )}
    </div>
  );
}

