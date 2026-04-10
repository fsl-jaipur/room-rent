import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError, apiFetch } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Skeleton from "../../components/Skeleton";

const FALLBACK_AREA_OPTIONS = [
  "Sanganer",
  "Malviya Nagar",
  "Mansarovar",
  "Jagatpura",
  "Vaishali Nagar",
  "Tonk Phatak",
  "Vidhyadhar Nagar",
];

const FALLBACK_COLONY_OPTIONS_BY_AREA: Record<string, string[]> = {
  Sanganer: ["Saini Colony", "Panchwati Colony", "Sitaram Colony", "Nand Colony", "Kohinoor Nagar"],
  "Malviya Nagar": ["Model Town", "Shanti Nagar", "Patel Colony", "Sector 1", "Sector 9"],
  Mansarovar: ["Patel Marg", "Agarwal Farm", "Rajat Path", "Shipra Path", "Madhyam Marg"],
  Jagatpura: ["Ramnagariya", "Ashadeep Green Avenue", "Mahima Panache", "Ramnagariya South"],
  "Vaishali Nagar": ["Gandhi Path", "Nemi Nagar", "Chitrakoot", "Hanuman Nagar", "Queens Road"],
  "Tonk Phatak": ["Barkat Nagar", "Gopalpura Bypass", "Mahesh Nagar", "Lal Kothi"],
  "Vidhyadhar Nagar": ["Sector 1", "Sector 2", "Sector 3", "Sector 5", "Central Spine"],
};

type LocationOption = {
  area: string;
  colonies: string[];
};

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

export default function ProfilePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [form, setForm] = useState<ProfilePayload>(emptyPayload);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [houseNo, setHouseNo] = useState("");
  const [landmark, setLandmark] = useState("");
  const [area, setArea] = useState("");
  const [colony, setColony] = useState("");
  const [pincode, setPincode] = useState("");
  const [locationOptions, setLocationOptions] = useState<LocationOption[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const areaToColonies = useMemo(() => {
    if (locationOptions.length === 0) return FALLBACK_COLONY_OPTIONS_BY_AREA;
    const mapped: Record<string, string[]> = {};
    locationOptions.forEach((item) => {
      mapped[item.area] = item.colonies;
    });
    return mapped;
  }, [locationOptions]);
  const areaOptions = useMemo(
    () => (locationOptions.length ? locationOptions.map((item) => item.area) : FALLBACK_AREA_OPTIONS),
    [locationOptions]
  );
  const colonyOptions = area ? (areaToColonies[area] ?? []) : [];

  const composeLocation = (partsInput: {
    houseNo?: string;
    landmark?: string;
    colony?: string;
    area?: string;
    pincode?: string;
  }) => {
    return [
      (partsInput.houseNo || "").trim(),
      (partsInput.landmark || "").trim(),
      (partsInput.colony || "").trim(),
      (partsInput.area || "").trim(),
      (partsInput.pincode || "").trim(),
      "Jaipur",
      "Rajasthan",
      "India",
    ]
      .filter(Boolean)
      .join(", ");
  };

  const parseLocation = (value: string) => {
    const parts = value
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    const normalized = parts.map((part) => part.toLowerCase());

    const matchedArea =
      areaOptions.find((candidate) =>
        normalized.some((piece) => piece.includes(candidate.toLowerCase()))
      ) || "";

    const matchedPincode =
      parts.find((part) => /\b\d{6}\b/.test(part))?.match(/\b\d{6}\b/)?.[0] || "";

    const areaColonies = matchedArea ? (areaToColonies[matchedArea] ?? []) : [];
    const matchedColony =
      areaColonies.find((candidate) =>
        normalized.some((piece) => piece.includes(candidate.toLowerCase()))
      ) ||
      parts.find((part) => /(colony|nagar|vihar|enclave|society|park|marg)$/i.test(part)) ||
      "";

    const matchedHouseNo =
      parts.find((part) => /\d/.test(part) && !/(jaipur|rajasthan|india)/i.test(part) && !/\b\d{6}\b/.test(part)) ||
      "";

    const usedValues = new Set(
      [matchedArea, matchedPincode, matchedColony, matchedHouseNo]
        .map((item) => item.toLowerCase())
        .filter(Boolean)
    );
    const matchedLandmark =
      parts.find((part) => !usedValues.has(part.toLowerCase()) && !/(jaipur|rajasthan|india)/i.test(part)) || "";

    return {
      houseNo: matchedHouseNo,
      landmark: matchedLandmark,
      area: matchedArea,
      colony: matchedColony,
      pincode: matchedPincode,
    };
  };

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const data = await apiFetch<{ profile: Profile }>("/api/auth/profile", {
        method: "GET",
      });

      const nextProfile = data.profile;
      const parsedLocation = parseLocation(nextProfile.location || "");
      setForm({
        fullName: nextProfile.fullName || "",
        email: nextProfile.email || "",
        location: nextProfile.location || "",
        aadhaar: nextProfile.aadhaar || "",
        phone: nextProfile.phone || "",
        photo: nextProfile.photo || "",
        gender: nextProfile.gender || "",
      });
      setHouseNo(parsedLocation.houseNo);
      setLandmark(parsedLocation.landmark);
      setArea(parsedLocation.area);
      setColony(parsedLocation.colony);
      setPincode(parsedLocation.pincode);
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
  }, [logout, navigate]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    let mounted = true;
    const loadLocationOptions = async () => {
      try {
        const response = await apiFetch<{ items: LocationOption[] }>("/api/listings/location-options", {
          method: "GET",
        });
        if (!mounted) return;
        if (Array.isArray(response.items) && response.items.length > 0) {
          setLocationOptions(response.items);
        }
      } catch (error: unknown) {
        if (error instanceof ApiError && error.status === 401) {
          await logout();
          navigate("/login", { replace: true });
        }
      }
    };
    void loadLocationOptions();
    return () => {
      mounted = false;
    };
  }, [logout, navigate]);

  useEffect(() => {
    if (!form.location.trim()) return;
    const parsed = parseLocation(form.location);
    if (!houseNo && parsed.houseNo) setHouseNo(parsed.houseNo);
    if (!landmark && parsed.landmark) setLandmark(parsed.landmark);
    if (!area && parsed.area) setArea(parsed.area);
    if (!colony && parsed.colony) setColony(parsed.colony);
    if (!pincode && parsed.pincode) setPincode(parsed.pincode);
  }, [form.location, areaOptions, areaToColonies, houseNo, landmark, area, colony, pincode]);

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

  const avatarFallback = (form.fullName || form.email || "U").trim().charAt(0).toUpperCase();

  useEffect(() => {
    const locationText = composeLocation({ houseNo, landmark, colony, area, pincode });
    setForm((prev) => ({ ...prev, location: locationText }));
  }, [houseNo, landmark, colony, area, pincode]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="profile-container profile-page">
          <div className="glass-card profile-header-card">
            <div style={{ width: "100%" }}>
              <Skeleton style={{ width: 140, height: 14, marginBottom: 10 }} />
              <Skeleton style={{ width: 220, height: 28, marginBottom: 8 }} />
              <Skeleton style={{ width: "60%", height: 16 }} />
            </div>
          </div>
          <div className="glass-card profile-main-card">
            <div className="profile-main-grid">
              <div className="flex-col" style={{ alignItems: "center" }}>
                <Skeleton style={{ width: 160, height: 160, borderRadius: "50%" }} />
                <Skeleton style={{ width: "100%", height: 40, marginTop: "1rem" }} />
              </div>
              <div className="profile-form-grid">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <Skeleton key={`profile-field-skeleton-${idx}`} style={{ width: "100%", height: 44 }} />
                ))}
                <Skeleton style={{ gridColumn: "1 / -1", width: "100%", height: 220 }} />
              </div>
            </div>
          </div>
        </div>
      </>
    );
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
              <div className="location-fields-grid">
                <input
                  type="text"
                  className="input-style"
                  value={houseNo}
                  onChange={(e) => setHouseNo(e.target.value)}
                  placeholder="House No."
                />
                <input
                  type="text"
                  className="input-style"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Landmark (Optional)"
                />
                <select
                  className="input-style"
                  value={area}
                  onChange={(e) => {
                    const selectedArea = e.target.value;
                    setArea(selectedArea);
                    const validColonies = areaToColonies[selectedArea] ?? [];
                    if (!validColonies.includes(colony)) {
                      setColony("");
                    }
                  }}
                >
                  <option value="">Select area</option>
                  {areaOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="input-style"
                  value={pincode}
                  onChange={(e) => {
                    setPincode(e.target.value.replace(/\D/g, "").slice(0, 6));
                  }}
                  placeholder="Pincode"
                />
                <select
                  className="input-style"
                  value={colony}
                  onChange={(e) => setColony(e.target.value)}
                  disabled={!area}
                >
                  <option value="">{area ? "Select colony" : "Select area first"}</option>
                  {colonyOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                className="input-style"
                value={form.location}
                readOnly
                style={{ marginTop: "0.75rem" }}
              />
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
