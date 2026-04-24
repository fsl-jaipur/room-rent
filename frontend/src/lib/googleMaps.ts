export type Coordinates = {
  lat: number;
  lng: number;
};

type GoogleGeocodeResult = {
  formatted_address?: string;
  geometry?: {
    location?: {
      lat?: number;
      lng?: number;
    };
  };
};

type GoogleGeocodeResponse = {
  status?: string;
  results?: GoogleGeocodeResult[];
};

export const GOOGLE_MAPS_API_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined)?.trim() || "";

export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error("Google Maps API key is not configured");
  }

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${encodeURIComponent(
      `${lat},${lng}`
    )}&key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}`
  );

  if (!response.ok) {
    throw new Error("Reverse geocoding failed");
  }

  const body = (await response.json()) as GoogleGeocodeResponse;
  const first = body.results?.[0];
  if (body.status === "OK" && first?.formatted_address) {
    return first.formatted_address;
  }

  throw new Error(body.status || "Reverse geocoding failed");
};

export const forwardGeocode = async (query: string): Promise<Coordinates | null> => {
  if (!GOOGLE_MAPS_API_KEY) return null;

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      query
    )}&key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}`
  );

  if (!response.ok) return null;

  const body = (await response.json()) as GoogleGeocodeResponse;
  const first = body.results?.[0];
  const lat = first?.geometry?.location?.lat;
  const lng = first?.geometry?.location?.lng;

  if (body.status !== "OK" || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return { lat: lat as number, lng: lng as number };
};
