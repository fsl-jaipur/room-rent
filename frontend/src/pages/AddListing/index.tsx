import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ImageUp, MapPin, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import SiteFooter from "../../components/SiteFooter";
import { ApiError, apiFetch } from "../../lib/api";
import { forwardGeocode } from "../../lib/googleMaps";
import { useToast } from "../../context/ToastContext";

type LocationOption = {
  area: string;
  colonies: string[];
};

type RoomForm = {
  id: string;
  propertyTypeId: number | "";
  floorLevelId: number | "";
  maxOccupants: number | "";
  monthlyRent: number | "";
  furnishingTypeId: number | "";
  foodPreferenceId: number | "";
  availableFrom: string;
  description: string;
  allowSmoking: boolean;
  roomImages: (File | null)[];
  roomImagePreviews: string[];
};

const createRoom = (): RoomForm => ({
  id: crypto.randomUUID(),
  propertyTypeId: "",
  floorLevelId: "",
  maxOccupants: "",
  monthlyRent: "",
  furnishingTypeId: "",
  foodPreferenceId: "",
  availableFrom: "",
  description: "",
  allowSmoking: false,
  roomImages: [null, null, null],
  roomImagePreviews: ["", "", ""],
});

export default function AddListing() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [houseNo, setHouseNo] = useState("");
  const [landmark, setLandmark] = useState("");
  const [area, setArea] = useState("");
  const [colony, setColony] = useState("");
  const [pincode, setPincode] = useState("");
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationOptions, setLocationOptions] = useState<LocationOption[]>([]);
  const [rooms, setRooms] = useState<RoomForm[]>([createRoom()]);
  const [exteriorFile, setExteriorFile] = useState<File | null>(null);
  const [exteriorPreview, setExteriorPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let active = true;
    apiFetch<{ items: LocationOption[] }>("/api/listings/location-options", { method: "GET" })
      .then((data) => {
        if (!active) return;
        setLocationOptions(Array.isArray(data.items) ? data.items : []);
      })
      .catch(() => {
        if (!active) return;
        setLocationOptions([]);
      });

    return () => {
      active = false;
    };
  }, []);

  const areaOptions = useMemo(() => locationOptions.map((item) => item.area), [locationOptions]);
  const colonyOptions = useMemo(
    () => locationOptions.find((item) => item.area === area)?.colonies ?? [],
    [area, locationOptions],
  );

  const composedAddress = useMemo(() => {
    return [houseNo, landmark, colony, area, pincode, "Jaipur", "Rajasthan", "India"]
      .map((item) => item.trim())
      .filter(Boolean)
      .join(", ");
  }, [area, colony, houseNo, landmark, pincode]);

  const updateRoom = (roomId: string, patch: Partial<RoomForm>) => {
    setRooms((prev) => prev.map((room) => (room.id === roomId ? { ...room, ...patch } : room)));
  };

  const handleStepOne = async () => {
    if (!houseNo.trim() || !area || !colony || !/^\d{6}$/.test(pincode)) {
      setErrorMsg("Please fill all required location fields.");
      return;
    }

    setErrorMsg("");
    const result = await forwardGeocode(composedAddress);
    if (result) {
      setCoords({ latitude: result.lat, longitude: result.lng });
    } else {
      setCoords(null);
    }
    setStep(2);
  };

  const handleRoomImage = (roomId: string, index: number, file: File | null) => {
    setRooms((prev) =>
      prev.map((room) => {
        if (room.id !== roomId) return room;
        const nextImages = [...room.roomImages];
        const nextPreviews = [...room.roomImagePreviews];
        nextImages[index] = file;
        nextPreviews[index] = file ? URL.createObjectURL(file) : "";
        return { ...room, roomImages: nextImages, roomImagePreviews: nextPreviews };
      }),
    );
  };

  const validateRooms = () => {
    for (const room of rooms) {
      if (
        room.propertyTypeId === "" ||
        room.floorLevelId === "" ||
        room.maxOccupants === "" ||
        room.monthlyRent === "" ||
        room.furnishingTypeId === "" ||
        room.foodPreferenceId === "" ||
        !room.availableFrom ||
        !room.description.trim()
      ) {
        return "Please complete all room details before publishing.";
      }
      if (!room.roomImages.some(Boolean)) {
        return "Each room needs at least one image.";
      }
    }
    if (!exteriorFile) {
      return "Please upload an exterior image.";
    }
    return "";
  };

  const handleSubmit = async () => {
    const validationError = validateRooms();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const formData = new FormData();
      const payload = {
        location: coords ?? undefined,
        address: composedAddress,
        exteriorPhotoUrl: "",
        roomPhotoUrls: rooms.map((room) => room.roomImagePreviews.map(() => "")),
        rooms: rooms.map((room) => ({
          propertyTypeId: Number(room.propertyTypeId),
          floorLevelId: Number(room.floorLevelId),
          maxOccupants: Number(room.maxOccupants),
          monthlyRent: Number(room.monthlyRent),
          furnishingTypeId: Number(room.furnishingTypeId),
          foodPreferenceId: Number(room.foodPreferenceId),
          availableFrom: room.availableFrom,
          description: room.description.trim(),
          allowSmoking: room.allowSmoking,
          securityDeposit: null,
          foodLevelId: 1,
          bedType: Number(room.maxOccupants) > 1 ? "Double" : "Single",
          singleBedCount: Number(room.maxOccupants) === 1 ? 1 : 0,
          doubleBedCount: Number(room.maxOccupants) > 1 ? 1 : 0,
          rentTiers: [],
        })),
      };

      formData.append("data", JSON.stringify(payload));
      formData.append("exteriorFile", exteriorFile as File);

      rooms.forEach((room, roomIndex) => {
        room.roomImages.forEach((file, imageIndex) => {
          if (file) {
            formData.append(`roomFile-${roomIndex}-${imageIndex}`, file);
          }
        });
      });

      await apiFetch("/api/listings/submit", {
        method: "POST",
        body: formData,
      });

      setStep(3);
      showToast("Listing posted successfully", "success");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        navigate("/login");
        return;
      }
      setErrorMsg(error instanceof Error ? error.message : "Failed to publish listing");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-shell">
      <Navbar />

      <main className="page-shell">
        <section className="hero-panel hero-gradient">
          <div className="page-container" style={{ padding: "46px 0 56px" }}>
            <div style={{ textAlign: "center" }}>
              <h1 style={{ fontSize: "3.4rem", lineHeight: 1.06, marginBottom: 10 }}>Post Your Property</h1>
              <p className="section-subtitle">
                {step === 1 && "Tell us where your property is located"}
                {step === 2 && "Tell us about your property details"}
                {step === 3 && "Your property is now live!"}
              </p>

              <div className="stepper">
                <div className="stepper-bars">
                  <span className={step >= 2 ? "done" : step === 1 ? "active" : ""} />
                  <span className={step === 3 ? "done" : step === 2 ? "active" : ""} />
                  <span className={step === 3 ? "active" : ""} />
                </div>
                <div className="stepper-label">STEP {step} OF 3</div>
              </div>
            </div>

            {step === 1 ? (
              <div className="form-panel" style={{ width: "min(920px, 100%)", margin: "0 auto" }}>
                <div style={{ display: "flex", alignItems: "start", gap: 14, marginBottom: 26 }}>
                  <div className="feature-icon" style={{ marginBottom: 0 }}>
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: "2rem", marginBottom: 4 }}>Where is your property located?</h2>
                    <p>We'll precisely pinpoint your location to help tenants find you easily.</p>
                  </div>
                </div>

                <div className="field-grid-2">
                  <div className="field">
                    <label>House No. *</label>
                    <input className="input-style" value={houseNo} onChange={(e) => setHouseNo(e.target.value)} placeholder="e.g. 24/7 or A123" />
                  </div>
                  <div className="field">
                    <label>Landmark (Optional)</label>
                    <input className="input-style" value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder="e.g. Near SBI Bank" />
                  </div>
                  <div className="field">
                    <label>Area *</label>
                    <select
                      className="select-style"
                      value={area}
                      onChange={(e) => {
                        setArea(e.target.value);
                        setColony("");
                      }}
                    >
                      <option value="">Select area</option>
                      {areaOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>Colony *</label>
                    <select className="select-style" value={colony} onChange={(e) => setColony(e.target.value)} disabled={!area}>
                      <option value="">{area ? "Select colony" : "Select area first"}</option>
                      {colonyOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field" style={{ gridColumn: "1 / -1" }}>
                    <label>Pincode *</label>
                    <input
                      className="input-style"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="e.g. 302017"
                    />
                  </div>
                </div>

                {errorMsg ? <div className="error-banner" style={{ marginTop: 20 }}>{errorMsg}</div> : null}

                <div className="form-actions" style={{ justifyContent: "flex-end" }}>
                  <button className="btn btn-dark" onClick={() => void handleStepOne()}>
                    Continue to Room Details
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div style={{ width: "min(980px, 100%)", margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
                  <h2 style={{ fontSize: "2rem" }}>Room Details</h2>
                  <button className="btn btn-outline" onClick={() => setRooms((prev) => [...prev, createRoom()])}>
                    <Plus size={18} />
                    Add Another Room
                  </button>
                </div>

                {rooms.map((room, roomIndex) => (
                  <div key={room.id} className="form-panel" style={{ marginBottom: 22 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", marginBottom: 18 }}>
                      <h3 style={{ fontSize: "1.45rem" }}>Room {roomIndex + 1}</h3>
                      {rooms.length > 1 ? (
                        <button className="btn btn-outline btn-sm" onClick={() => setRooms((prev) => prev.filter((item) => item.id !== room.id))}>
                          <Trash2 size={16} />
                          Remove
                        </button>
                      ) : null}
                    </div>

                    <div className="field-grid-2">
                      <div className="field">
                        <label>Property Type *</label>
                        <select
                          className="select-style"
                          value={room.propertyTypeId}
                          onChange={(e) => updateRoom(room.id, { propertyTypeId: e.target.value ? Number(e.target.value) : "" })}
                        >
                          <option value="">Select property type</option>
                          <option value="1">PG</option>
                          <option value="2">Independent Room</option>
                          <option value="3">Flat</option>
                        </select>
                      </div>

                      <div className="field">
                        <label>Floor Level *</label>
                        <select
                          className="select-style"
                          value={room.floorLevelId}
                          onChange={(e) => updateRoom(room.id, { floorLevelId: e.target.value ? Number(e.target.value) : "" })}
                        >
                          <option value="">Select floor</option>
                          <option value="1">Ground Floor</option>
                          <option value="2">1st Floor</option>
                          <option value="3">2nd Floor</option>
                          <option value="4">3rd Floor</option>
                        </select>
                      </div>

                      <div className="field">
                        <label>Max Occupants *</label>
                        <select
                          className="select-style"
                          value={room.maxOccupants}
                          onChange={(e) => updateRoom(room.id, { maxOccupants: e.target.value ? Number(e.target.value) : "" })}
                        >
                          <option value="">Select max occupants</option>
                          <option value="1">1 occupant</option>
                          <option value="2">2 occupants</option>
                          <option value="3">3 occupants</option>
                          <option value="4">4 occupants</option>
                        </select>
                      </div>

                      <div className="field">
                        <label>Monthly Rent (₹) *</label>
                        <input
                          className="input-style"
                          value={room.monthlyRent}
                          onChange={(e) => updateRoom(room.id, { monthlyRent: e.target.value ? Number(e.target.value.replace(/\D/g, "")) : "" })}
                          placeholder="e.g. 8000"
                        />
                      </div>

                      <div className="field">
                        <label>Furnishing *</label>
                        <select
                          className="select-style"
                          value={room.furnishingTypeId}
                          onChange={(e) => updateRoom(room.id, { furnishingTypeId: e.target.value ? Number(e.target.value) : "" })}
                        >
                          <option value="">Select furnishing</option>
                          <option value="3">Furnished</option>
                          <option value="2">Semi-Furnished</option>
                          <option value="1">Unfurnished</option>
                        </select>
                      </div>

                      <div className="field">
                        <label>Food Preference *</label>
                        <select
                          className="select-style"
                          value={room.foodPreferenceId}
                          onChange={(e) => updateRoom(room.id, { foodPreferenceId: e.target.value ? Number(e.target.value) : "" })}
                        >
                          <option value="">Select food preference</option>
                          <option value="1">Veg Only</option>
                          <option value="2">Non-Veg Allowed</option>
                          <option value="3">No Restriction</option>
                        </select>
                      </div>

                      <div className="field">
                        <label>Available From *</label>
                        <input
                          className="input-style"
                          type="date"
                          value={room.availableFrom}
                          onChange={(e) => updateRoom(room.id, { availableFrom: e.target.value })}
                        />
                      </div>

                      <div className="field">
                        <label>Smoking Allowed</label>
                        <div className="radio-inline" style={{ minHeight: 56 }}>
                          <label className="checkbox-item">
                            <input
                              type="radio"
                              checked={room.allowSmoking === true}
                              onChange={() => updateRoom(room.id, { allowSmoking: true })}
                              name={`smoking-${room.id}`}
                            />
                            <span>Yes</span>
                          </label>
                          <label className="checkbox-item">
                            <input
                              type="radio"
                              checked={room.allowSmoking === false}
                              onChange={() => updateRoom(room.id, { allowSmoking: false })}
                              name={`smoking-${room.id}`}
                            />
                            <span>No</span>
                          </label>
                        </div>
                      </div>

                      <div className="field" style={{ gridColumn: "1 / -1" }}>
                        <label>Description *</label>
                        <textarea
                          className="textarea-style"
                          value={room.description}
                          onChange={(e) => updateRoom(room.id, { description: e.target.value })}
                          placeholder="Add highlights of this property"
                        />
                      </div>

                      <div className="field" style={{ gridColumn: "1 / -1" }}>
                        <label>Room Images (up to 3, at least 1 required) *</label>
                        <div className="upload-grid">
                          {room.roomImagePreviews.map((preview, imageIndex) => (
                            <label key={`${room.id}-${imageIndex}`} className={`upload-card ${preview ? "has-image" : ""}`}>
                              {preview ? <img src={preview} alt={`Room ${roomIndex + 1} ${imageIndex + 1}`} /> : null}
                              {!preview ? (
                                <>
                                  <ImageUp size={24} style={{ position: "relative", zIndex: 1 }} />
                                  <span style={{ position: "relative", zIndex: 1 }}>Image {imageIndex + 1}</span>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  className="btn btn-outline btn-sm"
                                  onClick={(event) => {
                                    event.preventDefault();
                                    handleRoomImage(room.id, imageIndex, null);
                                  }}
                                >
                                  Remove
                                </button>
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={(event) => handleRoomImage(room.id, imageIndex, event.target.files?.[0] ?? null)}
                              />
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="form-panel">
                  <div className="field">
                    <label>Exterior Image *</label>
                    <div className="upload-grid" style={{ gridTemplateColumns: "minmax(0, 260px)" }}>
                      <label className={`upload-card ${exteriorPreview ? "has-image" : ""}`}>
                        {exteriorPreview ? <img src={exteriorPreview} alt="Exterior" /> : null}
                        {!exteriorPreview ? (
                          <>
                            <ImageUp size={24} style={{ position: "relative", zIndex: 1 }} />
                            <span style={{ position: "relative", zIndex: 1 }}>Upload File</span>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={(event) => {
                              event.preventDefault();
                              setExteriorFile(null);
                              setExteriorPreview("");
                            }}
                          >
                            Remove
                          </button>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (!file) return;
                            setExteriorFile(file);
                            setExteriorPreview(URL.createObjectURL(file));
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {errorMsg ? <div className="error-banner">{errorMsg}</div> : null}

                <div className="form-actions">
                  <button className="btn btn-outline" onClick={() => setStep(1)}>
                    <ArrowLeft size={18} />
                    Back
                  </button>
                  <button className="btn btn-primary" onClick={() => void handleSubmit()} disabled={submitting}>
                    {submitting ? "Publishing..." : "Publish Listing"}
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="surface-card success-card">
                <div className="success-mark">
                  <Check size={54} />
                </div>
                <h2 style={{ fontSize: "3rem", marginBottom: 12 }}>Successfully Published!</h2>
                <p style={{ fontSize: "1.18rem", marginBottom: 28 }}>
                  Your property is now active and visible to potential tenants.
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
                  <button className="btn btn-dark" onClick={() => navigate("/my-properties")}>
                    View All Listings
                  </button>
                  <button className="btn btn-outline" onClick={() => navigate("/profile")}>
                    Go to Profile
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
