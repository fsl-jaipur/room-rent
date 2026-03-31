export type BackendPropertyRecord = {
  id: string;
  userId: string;
  propertyName: string;
  address: string;
  latitude: number;
  longitude: number;
  isActive: boolean | null;
  createdAt: string | null;
};

export type LookupOption = {
  id: number;
  name: string;
  isActive: boolean | null;
};

export type PropertyMeta = {
  propertyTypes: LookupOption[];
  roomLocations: LookupOption[];
  coolingTypes: LookupOption[];
  interiorTypes: LookupOption[];
  foodPreferences: LookupOption[];
  smokingPreferences: LookupOption[];
};

export type Property = {
  id: string;
  userId: string;
  title: string;
  image: string;
  type: "1 BHK" | "2 BHK" | "3 BHK" | "Studio";
  amount: number;
  area: string;
  available: boolean;
  smoking: "Allowed" | "Not Allowed";
  foodPreference: "Veg" | "Non-Veg" | "Any";
  interior: "Furnished" | "Semi-Furnished" | "Unfurnished";
  address: string;
  description: string;
  amenities: string[];
  deposit: number;
  floor: string;
  facing: string;
  latitude: number;
  longitude: number;
};

export type PropertyDraft = {
  propertyName: string;
  address: string;
  latitude: number;
  longitude: number;
  room: {
    typeId: number;
    roomLocationId: number;
    coolingId: number;
    interiorId: number;
    foodPreferenceId: number;
    smokingPreferenceId: number;
    price: number;
    balcony: boolean;
    attachedWashroom: boolean;
  };
  images: string[];
};

function getAreaFromAddress(address: string) {
  const [area] = address.split(",");
  return area?.trim() || address;
}

export function mapBackendPropertyToUi(property: BackendPropertyRecord): Property {
  return {
    id: property.id,
    userId: property.userId,
    title: property.propertyName,
    image: "/placeholder.svg",
    type: "1 BHK",
    amount: 0,
    area: getAreaFromAddress(property.address),
    available: property.isActive !== false,
    smoking: "Not Allowed",
    foodPreference: "Any",
    interior: "Unfurnished",
    address: property.address,
    description: `Property located at ${property.address}.`,
    amenities: [],
    deposit: 0,
    floor: "N/A",
    facing: "N/A",
    latitude: property.latitude,
    longitude: property.longitude
  };
}
