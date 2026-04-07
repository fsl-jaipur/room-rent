import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { ApiError, apiFetch } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const mapMarkerIcon = L.icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type Profile = {
  id: string;
  fullName: string | null;
  email: string | null;
  location: string | null;
  aadhaar: string | null;
  phone: string | null;
  photo: string | null;
  gender: "Male" | "Female" | null;
};

type ProfilePayload = {
  fullName: string;
  email: string;
  location: string;
  aadhaar: string;
  phone: string;
  photo: string;
  gender: "Male" | "Female" | "";
};

const emptyPayload: ProfilePayload = {
  fullName: "",
  email: "",
  location: "",
  aadhaar: "",
  phone: "",
  photo: "",
  gender: "",
};

type Coordinates = {
  lat: number;
  lng: number;
};

const DEFAULT_COORDINATES: Coordinates = { lat: 26.9124, lng: 75.7873 };

const parseLatLngFromText = (value: string): Coordinates | null => {
  const match = value.match(
    /^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/
  );
  if (!match) return null;
  const lat = Number(match[1]);
  const lng = Number(match[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
};

const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
      String(lat)
    )}&lon=${encodeURIComponent(String(lng))}`
  );
  if (!response.ok) {
    throw new Error("Reverse geocoding failed");
  }
  const body = (await response.json()) as { display_name?: string };
  return body.display_name?.trim() || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
};

const forwardGeocode = async (query: string): Promise<Coordinates | null> => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
      query
    )}&limit=1`
  );
  if (!response.ok) return null;
  const body = (await response.json()) as Array<{ lat?: string; lon?: string }>;
  const first = body[0];
  if (!first?.lat || !first?.lon) return null;
  const lat = Number(first.lat);
  const lng = Number(first.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
};

function MapViewportSync({ center }: { center: Coordinates }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], map.getZoom(), { animate: true });
  }, [center.lat, center.lng, map]);
  return null;
}

function MapLocationPicker({
  center,
  onSelect,
}: {
  center: Coordinates;
  onSelect: (coords: Coordinates) => void;
}) {
  useMapEvents({
    click(event) {
      onSelect({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });

  return (
    <Marker
      position={[center.lat, center.lng]}
      icon={mapMarkerIcon}
      draggable
      eventHandlers={{
        dragend: (event) => {
          const marker = event.target as L.Marker;
          const next = marker.getLatLng();
          onSelect({ lat: next.lat, lng: next.lng });
        },
      }}
    />
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [form, setForm] = useState<ProfilePayload>(emptyPayload);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [mapCoordinates, setMapCoordinates] = useState<Coordinates>(DEFAULT_COORDINATES);
  const [resolvingMapLocation, setResolvingMapLocation] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const syncMapFromLocationText = async (locationText: string) => {
    const trimmed = locationText.trim();
    if (!trimmed) return;
    const parsed = parseLatLngFromText(trimmed);
    if (parsed) {
      setMapCoordinates(parsed);
      return;
    }
    const coords = await forwardGeocode(trimmed);
    if (coords) {
      setMapCoordinates(coords);
    }
  };

  const loadProfile = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const data = await apiFetch<{ profile: Profile }>("/api/auth/profile", {
        method: "GET",
      });

      const nextProfile = data.profile;
      setForm({
        fullName: nextProfile.fullName || "",
        email: nextProfile.email || "",
        location: nextProfile.location || "",
        aadhaar: nextProfile.aadhaar || "",
        phone: nextProfile.phone || "",
        photo: nextProfile.photo || "",
        gender: nextProfile.gender || "",
      });
      await syncMapFromLocationText(nextProfile.location || "");
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 401) {
        await logout();
        navigate("/login", { replace: true });
        return;
      }
      setErrorMsg(error instanceof Error ? error.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProfile();
  }, []);

  const handleSave = async () => {
    const trimmedAadhaar = form.aadhaar.trim();
    if (trimmedAadhaar && !/^\d{12}$/.test(trimmedAadhaar)) {
      setErrorMsg("Aadhaar must be exactly 12 digits");
      setSuccessMsg("");
      return;
    }

    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const data = await apiFetch<{ message: string; profile: Profile }>("/api/auth/profile", {
        method: "PUT",
        body: JSON.stringify(form),
      });
      setSuccessMsg(data.message);
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 401) {
        await logout();
        navigate("/login", { replace: true });
        return;
      }
      setErrorMsg(error instanceof Error ? error.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const formData = new FormData();
      formData.append("image", file);
      const data = await apiFetch<{ url: string }>("/api/uploads/image", {
        method: "POST",
        body: formData,
      });
      setForm((prev) => ({ ...prev, photo: data.url }));
    } catch (error: unknown) {
      setErrorMsg(error instanceof Error ? error.message : "Image upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const updateLocationFromCoordinates = async (coords: Coordinates) => {
    setMapCoordinates(coords);
    setResolvingMapLocation(true);
    setErrorMsg("");
    try {
      const exactAddress = await reverseGeocode(coords.lat, coords.lng);
      setForm((prev) => ({ ...prev, location: exactAddress }));
    } catch {
      setForm((prev) => ({
        ...prev,
        location: `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`,
      }));
    } finally {
      setResolvingMapLocation(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser");
      return;
    }

    setLocating(true);
    setErrorMsg("");
    setSuccessMsg("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        try {
          setMapCoordinates({ lat, lng });
          const exactAddress = await reverseGeocode(lat, lng);
          setForm((prev) => ({ ...prev, location: exactAddress }));
        } catch {
          setForm((prev) => ({ ...prev, location: `${lat.toFixed(6)}, ${lng.toFixed(6)}` }));
        } finally {
          setLocating(false);
        }
      },
      () => {
        setErrorMsg("Unable to fetch current location. Check browser permission.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const avatarFallback = (form.fullName || form.email || "U").trim().charAt(0).toUpperCase();
  const locationButtonText = useMemo(() => {
    if (locating) return "Locating...";
    if (resolvingMapLocation) return "Updating location...";
    return "Use current location";
  }, [locating, resolvingMapLocation]);

  if (loading) {
    return <div className="text-center mt-4">Loading profile...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="profile-container profile-page">
        <div className="glass-card profile-header-card">
          <div>
            <p className="profile-eyebrow">Account Center</p>
            <h2 style={{ marginBottom: "0.25rem", fontSize: "1.75rem" }}>My Profile</h2>
            <p style={{ margin: 0 }}>Manage identity, contact details, and preferences.</p>
          </div>
          <div className="profile-status-chips">
            <span className="badge badge-info">Verified Rental Profile</span>
            {form.gender && <span className="badge badge-primary">{form.gender}</span>}
          </div>
        </div>

      {errorMsg && (
        <div className="glass-card text-center" style={{ color: "#ef4444", marginBottom: "1rem" }}>
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="glass-card text-center" style={{ color: "#10b981", marginBottom: "1rem" }}>
          {successMsg}
        </div>
      )}

      <div className="glass-card profile-main-card">
        <div className="profile-main-grid">
          <div className="flex-col" style={{ alignItems: "center" }}>
            <div className="profile-avatar">
              {form.photo.trim() ? (
                <img
                  src={form.photo}
                  alt="Profile"
                />
              ) : (
                avatarFallback
              )}
            </div>
            <label className="btn btn-outline" style={{ cursor: "pointer", marginTop: "1rem", width: '100%' }}>
              {uploading ? "Uploading..." : "Change Photo"}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => void handlePhotoUpload(e)}
                style={{ display: "none" }}
                disabled={uploading}
              />
            </label>
          </div>

          <div className="profile-form-grid">
            <div className="form-group">
              <label>Photo URL</label>
              <input
                type="url"
                className="input-style"
                value={form.photo}
                onChange={(e) => setForm((prev) => ({ ...prev, photo: e.target.value }))}
                placeholder="https://example.com/my-photo.jpg"
              />
            </div>

            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                className="input-style"
                value={form.fullName}
                onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                placeholder="Your full name"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                className="input-style"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="you@example.com"
              />
            </div>

            <div className="form-group">
              <label>Gender</label>
              <select
                className="input-style"
                value={form.gender}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    gender: e.target.value as "Male" | "Female" | "",
                  }))
                }
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="form-group profile-location-field">
              <label>Location</label>
              <div className="flex-row" style={{ alignItems: "stretch" }}>
                <input
                  type="text"
                  className="input-style"
                  value={form.location}
                  onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="City / Area"
                />
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleUseCurrentLocation}
                  disabled={locating || resolvingMapLocation}
                  style={{ whiteSpace: "nowrap" }}
                >
                  {locationButtonText}
                </button>
              </div>
              <div className="profile-map-wrap">
                <MapContainer
                  center={[mapCoordinates.lat, mapCoordinates.lng]}
                  zoom={15}
                  scrollWheelZoom
                  className="map-preview-frame profile-map-frame"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapViewportSync center={mapCoordinates} />
                  <MapLocationPicker center={mapCoordinates} onSelect={(coords) => void updateLocationFromCoordinates(coords)} />
                </MapContainer>
                <p className="profile-map-help">
                  Click on map or drag the marker to update your location.
                </p>
              </div>
            </div>

            <div className="form-group">
              <label>Aadhaar</label>
              <input
                type="text"
                className="input-style"
                value={form.aadhaar}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    aadhaar: e.target.value.replace(/\D/g, "").slice(0, 12),
                  }))
                }
                placeholder="12-digit Aadhaar number"
                inputMode="numeric"
                maxLength={12}
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                className="input-style"
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="Phone number"
              />
            </div>

            <div className="flex-row" style={{ justifyContent: "space-between" }}>
              <div className="flex-row">
                <button
                  className="btn btn-primary"
                  onClick={() => void handleSave()}
                  disabled={saving || uploading}
                >
                  {saving ? "Updating..." : "Update Profile"}
                </button>
              </div>
              <button className="btn btn-outline" onClick={() => void loadProfile()}>
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
