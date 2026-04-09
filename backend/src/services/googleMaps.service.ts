import env from "../config/env";

export interface ParsedAddress {
  addressLine: string;
  colony: string;
  city: string;
  state: string;
  pincode: string;
}

export class GoogleMapsService {
  /**
   * Translates latitude and longitude into a structured address object
   * using the Google Geocoding API.
   */
  static async reverseGeocode(lat: number, lng: number): Promise<ParsedAddress> {
    const apiKey = env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error("Missing Google Maps API Key");
    }
    console.log(lat, lng);

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

      

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Maps API error: ${response.statusText}`);
    }

    const data = (await response.json()) as any;
    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      throw new Error(`Geocoding failed for coordinates [${lat}, ${lng}]: ${data.status}`);
    }

    // The first result is the most specific one
    const result = data.results[0];
    const addressComponents = result.address_components;

    const getComponent = (type: string) => {
      const comp = addressComponents.find((c: any) => c.types.includes(type));
      return comp ? comp.long_name : "";
    };

    // Construct the structured address
    // Colony / Sublocality (Usually sublocality_level_1 or neighborhood)
    const sublocality = getComponent("sublocality_level_1") || getComponent("neighborhood") || getComponent("sublocality");
    const route = getComponent("route");
    const streetNumber = getComponent("street_number");
    
    // AddressLine is a composition of components
    const addressLine = result.formatted_address; // Alternatively, combine street_number + route
    
    return {
      addressLine: addressLine || "Unknown Address",
      colony: sublocality || "Unknown Colony",
      city: getComponent("locality") || "Unknown City",
      state: getComponent("administrative_area_level_1") || "Unknown State",
      pincode: getComponent("postal_code") || "000000",
    };
  }

  /**
   * Translates a plain English address into coordinates and structured address.
   */
  static async forwardGeocode(address: string): Promise<{ latitude: number; longitude: number; parsed: ParsedAddress }> {
    const apiKey = env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) throw new Error("Missing Google Maps API Key");

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Google Maps API error: ${response.statusText}`);

    const data = (await response.json()) as any;
    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      throw new Error(`Geocoding failed for address [${address}]: ${data.status}`);
    }

    const result = data.results[0];
    const { lat, lng } = result.geometry.location;

    const addressComponents = result.address_components;
    const getComponent = (type: string) => {
      const comp = addressComponents.find((c: any) => c.types.includes(type));
      return comp ? comp.long_name : "";
    };

    const sublocality = getComponent("sublocality_level_1") || getComponent("neighborhood") || getComponent("sublocality");
    
    const parsedAddress = {
      addressLine: result.formatted_address || "Unknown Address",
      colony: sublocality || "Unknown Colony",
      city: getComponent("locality") || "Unknown City",
      state: getComponent("administrative_area_level_1") || "Unknown State",
      pincode: getComponent("postal_code") || "000000",
    };

    return {
      latitude: lat,
      longitude: lng,
      parsed: parsedAddress
    };
  }
}
