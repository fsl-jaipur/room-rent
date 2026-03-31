'use client'

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProperty, getPropertyMeta } from "@/lib/api";
import type { PropertyMeta } from "@/lib/property";

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
  const router = useRouter();
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
    if (typeof window === "undefined") return process.env.NEXT_PUBLIC_DEFAULT_USER_ID;
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}") as StoredUser;
    return storedUser.userId || process.env.NEXT_PUBLIC_DEFAULT_USER_ID;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!userId) {
      setError("User ID not found. Set NEXT_PUBLIC_DEFAULT_USER_ID or log in with a saved userId.");
      return;
    }

    const parsedPrice = Number(price);

    if (
      !propertyName.trim() ||
      !address.trim() ||
      !Number.isFinite(parsedPrice) ||
      !typeId ||
      !roomLocationId ||
      !coolingId ||
      !interiorId ||
      !foodPreferenceId ||
      !smokingPreferenceId
    ) {
      setError("Please fill all required fields.");
      return;
    }

    const images = imagesText
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);

    const defaultLatitude = 12.9716;
    const defaultLongitude = 77.5946;

    setSubmitting(true);
    try {
      await createProperty({
        userId,
        propertyName: propertyName.trim(),
        address: address.trim(),
        latitude: defaultLatitude,
        longitude: defaultLongitude,
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
      router.push("/home");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to create property.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderOptions = (options: Array<{ id: number; name: string }>) => (
    options.map((option) => (
      <option key={option.id} value={option.id}>{option.name}</option>
    ))
  );

  return (
    <div className="min-h-screen bg-background px-5 py-6">
      <button
        onClick={() => router.back()}
        className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border"
      >
        <ArrowLeft className="h-5 w-5 text-foreground" />
      </button>

      <div className="bg-card rounded-2xl border border-border p-5 shadow-[var(--shadow-card)]">
        <h1 className="font-heading font-bold text-xl text-foreground mb-4">Add Property</h1>

        {loadingMeta ? <p className="text-sm text-muted-foreground font-body mb-4">Loading options...</p> : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="propertyName" className="text-xs font-heading">Property Name *</Label>
            <Input
              id="propertyName"
              value={propertyName}
              onChange={(e) => setPropertyName(e.target.value)}
              placeholder="e.g. Sunrise Residency"
              className="rounded-xl"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-xs font-heading">Full Address *</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="4th Block, Koramangala, Bangalore"
              className="rounded-xl"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="price" className="text-xs font-heading">Price *</Label>
            <Input
              id="price"
              type="number"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="25000"
              className="rounded-xl"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="typeId" className="text-xs font-heading">Property Type *</Label>
              <select id="typeId" className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" value={typeId} onChange={(e) => setTypeId(e.target.value)} required>
                {renderOptions(meta.propertyTypes)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="roomLocationId" className="text-xs font-heading">Room Location *</Label>
              <select id="roomLocationId" className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" value={roomLocationId} onChange={(e) => setRoomLocationId(e.target.value)} required>
                {renderOptions(meta.roomLocations)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="coolingId" className="text-xs font-heading">Cooling *</Label>
              <select id="coolingId" className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" value={coolingId} onChange={(e) => setCoolingId(e.target.value)} required>
                {renderOptions(meta.coolingTypes)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="interiorId" className="text-xs font-heading">Interior *</Label>
              <select id="interiorId" className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" value={interiorId} onChange={(e) => setInteriorId(e.target.value)} required>
                {renderOptions(meta.interiorTypes)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="foodPreferenceId" className="text-xs font-heading">Food Preference *</Label>
              <select id="foodPreferenceId" className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" value={foodPreferenceId} onChange={(e) => setFoodPreferenceId(e.target.value)} required>
                {renderOptions(meta.foodPreferences)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="smokingPreferenceId" className="text-xs font-heading">Smoking Preference *</Label>
              <select id="smokingPreferenceId" className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" value={smokingPreferenceId} onChange={(e) => setSmokingPreferenceId(e.target.value)} required>
                {renderOptions(meta.smokingPreferences)}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="inline-flex items-center gap-2 text-sm font-body text-foreground">
              <input type="checkbox" checked={balcony} onChange={(e) => setBalcony(e.target.checked)} />
              Balcony
            </label>
            <label className="inline-flex items-center gap-2 text-sm font-body text-foreground">
              <input type="checkbox" checked={attachedWashroom} onChange={(e) => setAttachedWashroom(e.target.checked)} />
              Attached Washroom
            </label>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="images" className="text-xs font-heading">Image URLs (comma or new line separated)</Label>
            <textarea
              id="images"
              value={imagesText}
              onChange={(e) => setImagesText(e.target.value)}
              placeholder="https://image1.jpg, https://image2.jpg"
              className="min-h-[90px] w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
          </div>

          {error ? <p className="text-sm text-destructive font-body">{error}</p> : null}

          <Button type="submit" className="w-full h-12 rounded-xl font-heading font-semibold" disabled={submitting || loadingMeta}>
            {submitting ? "Saving..." : "Add Property"}
          </Button>
        </form>
      </div>
    </div>
  );
}
