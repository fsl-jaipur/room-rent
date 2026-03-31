export type Property = {
  id: string;
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
};

export const properties: Property[] = [
  {
    id: "1",
    title: "Sunrise Residency",
    image: "/placeholder.svg",
    type: "2 BHK",
    amount: 18000,
    area: "Koramangala",
    available: true,
    smoking: "Not Allowed",
    foodPreference: "Any",
    interior: "Furnished",
    address: "4th Block, Koramangala, Bangalore - 560034",
    description: "Spacious 2 BHK apartment in the heart of Koramangala with modern amenities, 24/7 water supply, and gated community security. Close to restaurants, malls, and metro station.",
    amenities: ["Parking", "Gym", "Swimming Pool", "Power Backup", "Lift", "Security"],
    deposit: 50000,
    floor: "5th of 12",
    facing: "East",
  },
  {
    id: "2",
    title: "Cozy Studio Living",
    image: "/placeholder.svg",
    type: "Studio",
    amount: 12000,
    area: "Indiranagar",
    available: true,
    smoking: "Allowed",
    foodPreference: "Any",
    interior: "Furnished",
    address: "12th Main, Indiranagar, Bangalore - 560038",
    description: "Beautiful fully furnished studio apartment perfect for working professionals. Walking distance to metro, cafes, and shopping areas.",
    amenities: ["WiFi", "AC", "Power Backup", "Laundry", "Housekeeping"],
    deposit: 30000,
    floor: "3rd of 8",
    facing: "North",
  },
  {
    id: "3",
    title: "Grand View Apartments",
    image: "/placeholder.svg",
    type: "3 BHK",
    amount: 35000,
    area: "Whitefield",
    available: true,
    smoking: "Not Allowed",
    foodPreference: "Veg",
    interior: "Semi-Furnished",
    address: "ITPL Road, Whitefield, Bangalore - 560066",
    description: "Premium 3 BHK apartment with panoramic city views, modern interiors, and world-class amenities in a gated township.",
    amenities: ["Clubhouse", "Gym", "Swimming Pool", "Tennis Court", "Parking", "Garden", "Security"],
    deposit: 100000,
    floor: "10th of 18",
    facing: "West",
  },
  {
    id: "4",
    title: "City Nest 1BHK",
    image: "/placeholder.svg",
    type: "1 BHK",
    amount: 10000,
    area: "HSR Layout",
    available: false,
    smoking: "Not Allowed",
    foodPreference: "Non-Veg",
    interior: "Unfurnished",
    address: "Sector 2, HSR Layout, Bangalore - 560102",
    description: "Affordable 1 BHK apartment in a prime location with excellent connectivity to major IT parks and public transport.",
    amenities: ["Parking", "Power Backup", "Lift", "Water Supply"],
    deposit: 25000,
    floor: "2nd of 6",
    facing: "South",
  },
  {
    id: "5",
    title: "Green Valley Homes",
    image: "/placeholder.svg",
    type: "2 BHK",
    amount: 22000,
    area: "Electronic City",
    available: true,
    smoking: "Allowed",
    foodPreference: "Any",
    interior: "Furnished",
    address: "Phase 1, Electronic City, Bangalore - 560100",
    description: "Well-maintained 2 BHK in a serene gated community surrounded by greenery. Near all major IT companies.",
    amenities: ["Garden", "Gym", "Parking", "Security", "Clubhouse", "Power Backup"],
    deposit: 60000,
    floor: "7th of 14",
    facing: "East",
  },
  {
    id: "6",
    title: "Metro Edge Studio",
    image: "/placeholder.svg",
    type: "1 BHK",
    amount: 14000,
    area: "Koramangala",
    available: true,
    smoking: "Not Allowed",
    foodPreference: "Veg",
    interior: "Semi-Furnished",
    address: "6th Block, Koramangala, Bangalore - 560095",
    description: "Bright and airy 1 BHK close to metro station. Ideal for young professionals and couples.",
    amenities: ["Lift", "Parking", "Power Backup", "Water Supply"],
    deposit: 35000,
    floor: "4th of 10",
    facing: "North",
  },
];
