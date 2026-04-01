import { useEffect, useMemo, useState, type FormEvent } from "react";

import { createProperty, DEFAULT_USER_ID, getPropertyMeta } from "../api";
import { navigate } from "../router";
import type { PropertyMeta } from "../types";

type StoredUser = {
  userId?: string;
};

const defaultMeta: PropertyMeta = {
  propertyTypes: [],
  roomLocations: [],
  coolingTypes: [],
  interiorTypes: [],
  foodPreferences: [],
  smokingPreferences: []
};

export default function AddPropertyPage() {
  const [propertyName, setPropertyName] = useState("");
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState("");
  const [imagesText, setImagesText] = useState("");
  const [balcony, setBalcony] = useState(false);
  const [attachedWashroom, setAttachedWashroom] = useState(false);
  const [typeId, setTypeId] = useState("");
  const [roomLocationId, setRoomLocationId] = useState("");
  const [coolingId, setCoolingId] = useState("");
  const [interiorId, setInteriorId] = useState("");
  const [foodPreferenceId, setFoodPreferenceId] = useState("");
  const [smokingPreferenceId, setSmokingPreferenceId] = useState("");
  const [meta, setMeta] = useState<PropertyMeta>(defaultMeta);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const userId = useMemo(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}") as StoredUser;
    return storedUser.userId || DEFAULT_USER_ID;
  }, []);

  useEffect(() => {
    const loadMeta = async () => {
      setLoadingMeta(true);
      setError("");
      try {
        const data = await getPropertyMeta();
        setMeta(data);
        setTypeId(String(data.propertyTypes[0]?.id ?? ""));
        setRoomLocationId(String(data.roomLocations[0]?.id ?? ""));
        setCoolingId(String(data.coolingTypes[0]?.id ?? ""));
        setInteriorId(String(data.interiorTypes[0]?.id ?? ""));
        setFoodPreferenceId(String(data.foodPreferences[0]?.id ?? ""));
        setSmokingPreferenceId(String(data.smokingPreferences[0]?.id ?? ""));
      } catch (metaError) {
        setError(metaError instanceof Error ? metaError.message : "Failed to load dropdown data.");
      } finally {
        setLoadingMeta(false);
      }
    };

    void loadMeta();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!userId) {
      setError("User ID not found. Set VITE_DEFAULT_USER_ID or save a userId in localStorage.");
      return;
    }

    const parsedPrice = Number(price);

    if (!propertyName.trim() || !address.trim() || !Number.isFinite(parsedPrice)) {
      setError("Please fill all required fields.");
      return;
    }

    const images = imagesText
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);

    setSubmitting(true);
    try {
      await createProperty({
        userId,
        propertyName: propertyName.trim(),
        address: address.trim(),
        latitude: 12.9716,
        longitude: 77.5946,
        room: {
          typeId: Number(typeId),
          roomLocationId: Number(roomLocationId),
          coolingId: Number(coolingId),
          interiorId: Number(interiorId),
          foodPreferenceId: Number(foodPreferenceId),
          smokingPreferenceId: Number(smokingPreferenceId),
          price: parsedPrice,
          balcony,
          attachedWashroom
        },
        images
      });
      navigate("/home");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to create property.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="container">
      <div className="row">
        <h1>Add Property</h1>
        <button className="secondary" onClick={() => window.history.back()}>Back</button>
      </div>

      {loadingMeta ? <p>Loading options...</p> : null}

      <form className="card" onSubmit={handleSubmit}>
        <input placeholder="Property Name" value={propertyName} onChange={(event) => setPropertyName(event.target.value)} />
        <input placeholder="Address" value={address} onChange={(event) => setAddress(event.target.value)} />
        <input placeholder="Price" type="number" value={price} onChange={(event) => setPrice(event.target.value)} />

        <div className="grid-two">
          <select value={typeId} onChange={(event) => setTypeId(event.target.value)}>
            {meta.propertyTypes.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
          </select>
          <select value={roomLocationId} onChange={(event) => setRoomLocationId(event.target.value)}>
            {meta.roomLocations.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
          </select>
        </div>

        <div className="grid-two">
          <select value={coolingId} onChange={(event) => setCoolingId(event.target.value)}>
            {meta.coolingTypes.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
          </select>
          <select value={interiorId} onChange={(event) => setInteriorId(event.target.value)}>
            {meta.interiorTypes.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
          </select>
        </div>

        <div className="grid-two">
          <select value={foodPreferenceId} onChange={(event) => setFoodPreferenceId(event.target.value)}>
            {meta.foodPreferences.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
          </select>
          <select value={smokingPreferenceId} onChange={(event) => setSmokingPreferenceId(event.target.value)}>
            {meta.smokingPreferences.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
          </select>
        </div>

        <label><input type="checkbox" checked={balcony} onChange={(event) => setBalcony(event.target.checked)} /> Balcony</label>
        <label><input type="checkbox" checked={attachedWashroom} onChange={(event) => setAttachedWashroom(event.target.checked)} /> Attached Washroom</label>

        <textarea
          placeholder="Image URLs (comma/new line separated)"
          value={imagesText}
          onChange={(event) => setImagesText(event.target.value)}
        />

        {error ? <p className="error">{error}</p> : null}
        <button type="submit" disabled={submitting || loadingMeta}>{submitting ? "Saving..." : "Add Property"}</button>
      </form>
    </main>
  );
}
