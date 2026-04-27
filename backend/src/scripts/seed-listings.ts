/**
 * Seed script — inserts sample listings via the API.
 *
 * Usage:
 *   SEED_TOKEN=<jwt>  bun run src/scripts/seed-listings.ts
 *   SEED_LANDLORD_ID=<mongoId>  bun run src/scripts/seed-listings.ts
 *
 * At least one of SEED_TOKEN or SEED_LANDLORD_ID must be set.
 * The script reads BASE_URL from env (defaults to http://localhost:5000).
 */

import "../../src/config/env.ts";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:5000";
const TOKEN = process.env.SEED_TOKEN ?? "";
const LANDLORD_ID = process.env.SEED_LANDLORD_ID ?? "";

if (!TOKEN && !LANDLORD_ID) {
  console.error("Set SEED_TOKEN or SEED_LANDLORD_ID env var before running.");
  process.exit(1);
}

type RentTier = { occupants: number; rent: number };

interface ListingPayload {
  location: { latitude: number; longitude: number };
  address: string;
  exteriorPhotoUrl: string;
  roomPhotoUrls: string[][];
  rooms: Array<{
    propertyTypeId: number;
    floorLevelId: number;
    maxOccupants: number;
    monthlyRent: number;
    furnishingTypeId: number;
    foodPreferenceId: number;
    foodLevelId: number;
    coolingTypeId: number;
    availableFrom: string;
    description: string;
    allowSmoking: boolean;
    securityDeposit: number;
    bedType: "Single" | "Double" | "Mixed";
    singleBedCount: number;
    doubleBedCount: number;
    rentTiers: RentTier[];
  }>;
}

const listings: ListingPayload[] = [
  {
    location: { latitude: 26.9124, longitude: 75.7873 },
    address: "Mansarovar Sector 4, Jaipur, Rajasthan 302020",
    exteriorPhotoUrl:
      "https://res.cloudinary.com/akshatsharma/image/upload/v1723005017/samples/landscapes/girl-urban-view.jpg",
    roomPhotoUrls: [
      [
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005026/cld-sample-4.jpg",
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005018/samples/landscapes/architecture-signs.jpg",
      ],
      [
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005025/samples/dessert-on-a-plate.jpg",
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005025/samples/coffee.jpg",
      ],
      [
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005017/samples/landscapes/girl-urban-view.jpg",
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005018/samples/landscapes/architecture-signs.jpg",
      ],
    ],
    rooms: [
      {
        propertyTypeId: 1,
        floorLevelId: 2,
        maxOccupants: 2,
        monthlyRent: 12000,
        furnishingTypeId: 3,
        foodPreferenceId: 2,
        foodLevelId: 1,
        coolingTypeId: 1,
        availableFrom: "2026-05-01",
        description: "Fully furnished room with attached bathroom and AC",
        allowSmoking: false,
        securityDeposit: 12000,
        bedType: "Double",
        singleBedCount: 0,
        doubleBedCount: 1,
        rentTiers: [
          { occupants: 1, rent: 9000 },
          { occupants: 2, rent: 12000 },
        ],
      },
    ],
  },
  {
    location: { latitude: 26.8855, longitude: 75.8076 },
    address: "Malviya Nagar Sector 7, Jaipur, Rajasthan 302017",
    exteriorPhotoUrl:
      "https://res.cloudinary.com/akshatsharma/image/upload/v1723005017/samples/landscapes/girl-urban-view.jpg",
    roomPhotoUrls: [
      [
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005017/samples/bike.jpg",
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005025/samples/dessert-on-a-plate.jpg",
      ],
      [
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005025/samples/cup-on-a-table.jpg",
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005017/samples/bike.jpg",
      ],
    ],
    rooms: [
      {
        propertyTypeId: 1,
        floorLevelId: 1,
        maxOccupants: 1,
        monthlyRent: 8000,
        furnishingTypeId: 2,
        foodPreferenceId: 1,
        foodLevelId: 1,
        coolingTypeId: 2,
        availableFrom: "2026-05-15",
        description: "Semi-furnished single room on ground floor, 24hr water supply",
        allowSmoking: false,
        securityDeposit: 8000,
        bedType: "Single",
        singleBedCount: 1,
        doubleBedCount: 0,
        rentTiers: [{ occupants: 1, rent: 8000 }],
      },
    ],
  },
  {
    location: { latitude: 26.9015, longitude: 75.7397 },
    address: "Vaishali Nagar Extension, Jaipur, Rajasthan 302021",
    exteriorPhotoUrl:
      "https://res.cloudinary.com/akshatsharma/image/upload/v1723005018/samples/landscapes/architecture-signs.jpg",
    roomPhotoUrls: [
      [
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005026/cld-sample-4.jpg",
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005018/samples/landscapes/architecture-signs.jpg",
      ],
      [
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005025/samples/cup-on-a-table.jpg",
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005025/samples/coffee.jpg",
      ],
      [
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005017/samples/bike.jpg",
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005026/cld-sample-4.jpg",
      ],
    ],
    rooms: [
      {
        propertyTypeId: 2,
        floorLevelId: 3,
        maxOccupants: 3,
        monthlyRent: 18000,
        furnishingTypeId: 3,
        foodPreferenceId: 3,
        foodLevelId: 1,
        coolingTypeId: 1,
        availableFrom: "2026-06-01",
        description:
          "Fully furnished 2BHK on second floor with parking and modular kitchen",
        allowSmoking: false,
        securityDeposit: 36000,
        bedType: "Double",
        singleBedCount: 1,
        doubleBedCount: 1,
        rentTiers: [
          { occupants: 2, rent: 15000 },
          { occupants: 3, rent: 18000 },
        ],
      },
    ],
  },
  {
    location: { latitude: 26.8971, longitude: 75.8069 },
    address: "Pratap Nagar Sector 5, Jaipur, Rajasthan 302033",
    exteriorPhotoUrl:
      "https://res.cloudinary.com/akshatsharma/image/upload/v1724602328/kmmueabxg0zal7j5ll09.png",
    roomPhotoUrls: [
      [
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005025/samples/dessert-on-a-plate.jpg",
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005026/cld-sample-4.jpg",
      ],
    ],
    rooms: [
      {
        propertyTypeId: 1,
        floorLevelId: 2,
        maxOccupants: 2,
        monthlyRent: 10000,
        furnishingTypeId: 2,
        foodPreferenceId: 1,
        foodLevelId: 1,
        coolingTypeId: 1,
        availableFrom: "2026-05-01",
        description:
          "Semi-furnished room near Pratap Nagar metro, ideal for working professionals",
        allowSmoking: false,
        securityDeposit: 10000,
        bedType: "Double",
        singleBedCount: 0,
        doubleBedCount: 1,
        rentTiers: [
          { occupants: 1, rent: 7500 },
          { occupants: 2, rent: 10000 },
        ],
      },
    ],
  },
  {
    location: { latitude: 26.9261, longitude: 75.8069 },
    address: "Raja Park Main, Jaipur, Rajasthan 302004",
    exteriorPhotoUrl:
      "https://res.cloudinary.com/akshatsharma/image/upload/v1724602328/kmmueabxg0zal7j5ll09.png",
    roomPhotoUrls: [
      [
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005017/samples/landscapes/girl-urban-view.jpg",
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005025/samples/cup-on-a-table.jpg",
      ],
    ],
    rooms: [
      {
        propertyTypeId: 1,
        floorLevelId: 4,
        maxOccupants: 1,
        monthlyRent: 7000,
        furnishingTypeId: 1,
        foodPreferenceId: 1,
        foodLevelId: 1,
        coolingTypeId: 2,
        availableFrom: "2026-05-10",
        description:
          "Unfurnished single room on third floor, separate entrance, quiet locality",
        allowSmoking: false,
        securityDeposit: 7000,
        bedType: "Single",
        singleBedCount: 1,
        doubleBedCount: 0,
        rentTiers: [{ occupants: 1, rent: 7000 }],
      },
    ],
  },
  {
    location: { latitude: 26.9338, longitude: 75.785 },
    address: "Bani Park Extension, Jaipur, Rajasthan 302016",
    exteriorPhotoUrl:
      "https://res.cloudinary.com/akshatsharma/image/upload/v1723005017/samples/landscapes/girl-urban-view.jpg",
    roomPhotoUrls: [
      [
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005025/samples/dessert-on-a-plate.jpg",
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005017/samples/bike.jpg",
      ],
      [
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005017/samples/landscapes/girl-urban-view.jpg",
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005017/samples/bike.jpg",
      ],
      [
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005025/samples/dessert-on-a-plate.jpg",
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005025/samples/coffee.jpg",
      ],
    ],
    rooms: [
      {
        propertyTypeId: 2,
        floorLevelId: 1,
        maxOccupants: 2,
        monthlyRent: 22000,
        furnishingTypeId: 3,
        foodPreferenceId: 1,
        foodLevelId: 1,
        coolingTypeId: 1,
        availableFrom: "2026-06-15",
        description:
          "Premium fully furnished flat on ground floor, gated society, 2 covered parkings",
        allowSmoking: false,
        securityDeposit: 44000,
        bedType: "Double",
        singleBedCount: 0,
        doubleBedCount: 2,
        rentTiers: [
          { occupants: 1, rent: 18000 },
          { occupants: 2, rent: 22000 },
        ],
      },
    ],
  },
  {
    location: { latitude: 26.9062, longitude: 75.8158 },
    address: "Gopalpura, Krishna Nagar, Jaipur, Rajasthan 302015",
    exteriorPhotoUrl:
      "https://res.cloudinary.com/akshatsharma/image/upload/v1723005026/cld-sample-4.jpg",
    roomPhotoUrls: [
      [
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005017/samples/bike.jpg",
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005025/samples/coffee.jpg",
      ],
    ],
    rooms: [
      {
        propertyTypeId: 1,
        floorLevelId: 2,
        maxOccupants: 2,
        monthlyRent: 9000,
        furnishingTypeId: 2,
        foodPreferenceId: 2,
        foodLevelId: 1,
        coolingTypeId: 1,
        availableFrom: "2026-05-01",
        description: "Semi-furnished room with common kitchen access, non-veg allowed",
        allowSmoking: false,
        securityDeposit: 9000,
        bedType: "Double",
        singleBedCount: 0,
        doubleBedCount: 1,
        rentTiers: [
          { occupants: 1, rent: 7000 },
          { occupants: 2, rent: 9000 },
        ],
      },
    ],
  },
  {
    location: { latitude: 26.8784, longitude: 75.8143 },
    address: "Jagatpura Main, Jaipur, Rajasthan 302025",
    exteriorPhotoUrl:
      "https://res.cloudinary.com/akshatsharma/image/upload/v1723005026/cld-sample-4.jpg",
    roomPhotoUrls: [
      [
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005026/cld-sample-4.jpg",
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005025/samples/dessert-on-a-plate.jpg",
      ],
      [
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005017/samples/landscapes/girl-urban-view.jpg",
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005018/samples/landscapes/architecture-signs.jpg",
      ],
    ],
    rooms: [
      {
        propertyTypeId: 1,
        floorLevelId: 2,
        maxOccupants: 3,
        monthlyRent: 11000,
        furnishingTypeId: 3,
        foodPreferenceId: 1,
        foodLevelId: 1,
        coolingTypeId: 1,
        availableFrom: "2026-05-20",
        description:
          "Spacious furnished room for 3 occupants, near Jagatpura Railway Station",
        allowSmoking: false,
        securityDeposit: 11000,
        bedType: "Double",
        singleBedCount: 1,
        doubleBedCount: 1,
        rentTiers: [
          { occupants: 1, rent: 7000 },
          { occupants: 2, rent: 9500 },
          { occupants: 3, rent: 11000 },
        ],
      },
    ],
  },
  {
    location: { latitude: 26.9197, longitude: 75.7546 },
    address: "Chitrakoot Nagar, Jaipur, Rajasthan 302021",
    exteriorPhotoUrl:
      "https://res.cloudinary.com/akshatsharma/image/upload/v1723005017/samples/landscapes/girl-urban-view.jpg",
    roomPhotoUrls: [
      [
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005017/samples/landscapes/girl-urban-view.jpg",
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005025/samples/dessert-on-a-plate.jpg",
      ],
      [
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005025/samples/coffee.jpg",
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005025/samples/cup-on-a-table.jpg",
      ],
    ],
    rooms: [
      {
        propertyTypeId: 2,
        floorLevelId: 3,
        maxOccupants: 2,
        monthlyRent: 16000,
        furnishingTypeId: 3,
        foodPreferenceId: 1,
        foodLevelId: 1,
        coolingTypeId: 1,
        availableFrom: "2026-06-01",
        description: "1BHK fully furnished on second floor with balcony and CCTV society",
        allowSmoking: false,
        securityDeposit: 32000,
        bedType: "Double",
        singleBedCount: 0,
        doubleBedCount: 1,
        rentTiers: [
          { occupants: 1, rent: 13000 },
          { occupants: 2, rent: 16000 },
        ],
      },
    ],
  },
  {
    location: { latitude: 26.9553, longitude: 75.8122 },
    address: "Murlipura Scheme, Jaipur, Rajasthan 302013",
    exteriorPhotoUrl:
      "https://res.cloudinary.com/akshatsharma/image/upload/v1723005017/samples/landscapes/girl-urban-view.jpg",
    roomPhotoUrls: [
      [
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005026/cld-sample-4.jpg",
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005017/samples/landscapes/girl-urban-view.jpg",
      ],
      [
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005025/samples/cup-on-a-table.jpg",
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005025/samples/coffee.jpg",
      ],
      [
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005025/samples/dessert-on-a-plate.jpg",
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005025/samples/coffee.jpg",
      ],
    ],
    rooms: [
      {
        propertyTypeId: 1,
        floorLevelId: 1,
        maxOccupants: 1,
        monthlyRent: 6500,
        furnishingTypeId: 1,
        foodPreferenceId: 1,
        foodLevelId: 1,
        coolingTypeId: 2,
        availableFrom: "2026-05-01",
        description:
          "Unfurnished room on ground floor, suitable for students, near bus stop",
        allowSmoking: false,
        securityDeposit: 6500,
        bedType: "Single",
        singleBedCount: 1,
        doubleBedCount: 0,
        rentTiers: [{ occupants: 1, rent: 6500 }],
      },
    ],
  },
  {
    location: { latitude: 26.9432, longitude: 75.7661 },
    address: "Shastri Nagar Extension, Jaipur, Rajasthan 302016",
    exteriorPhotoUrl:
      "https://res.cloudinary.com/akshatsharma/image/upload/v1724602328/kmmueabxg0zal7j5ll09.png",
    roomPhotoUrls: [
      [
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005025/samples/cup-on-a-table.jpg",
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005017/samples/bike.jpg",
      ],
    ],
    rooms: [
      {
        propertyTypeId: 1,
        floorLevelId: 2,
        maxOccupants: 2,
        monthlyRent: 9500,
        furnishingTypeId: 2,
        foodPreferenceId: 1,
        foodLevelId: 1,
        coolingTypeId: 1,
        availableFrom: "2026-05-01",
        description: "Semi-furnished room with attached bath, close to Jhotwara Road",
        allowSmoking: true,
        securityDeposit: 9500,
        bedType: "Double",
        singleBedCount: 0,
        doubleBedCount: 1,
        rentTiers: [
          { occupants: 1, rent: 7500 },
          { occupants: 2, rent: 9500 },
        ],
      },
    ],
  },
  {
    location: { latitude: 26.8923, longitude: 75.7731 },
    address: "Durgapura, Sudama Nagar, Jaipur, Rajasthan 302018",
    exteriorPhotoUrl:
      "https://res.cloudinary.com/akshatsharma/image/upload/v1723005026/cld-sample-4.jpg",
    roomPhotoUrls: [
      [
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005025/samples/coffee.jpg",
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005018/samples/landscapes/architecture-signs.jpg",
      ],
    ],
    rooms: [
      {
        propertyTypeId: 1,
        floorLevelId: 3,
        maxOccupants: 2,
        monthlyRent: 11500,
        furnishingTypeId: 3,
        foodPreferenceId: 1,
        foodLevelId: 1,
        coolingTypeId: 1,
        availableFrom: "2026-05-15",
        description: "Fully furnished room on second floor near Durgapura Railway Station",
        allowSmoking: false,
        securityDeposit: 11500,
        bedType: "Double",
        singleBedCount: 0,
        doubleBedCount: 1,
        rentTiers: [
          { occupants: 1, rent: 9000 },
          { occupants: 2, rent: 11500 },
        ],
      },
    ],
  },
  {
    location: { latitude: 26.9103, longitude: 75.787 },
    address: "Mahaveer Nagar A, Jaipur, Rajasthan 302018",
    exteriorPhotoUrl:
      "https://res.cloudinary.com/akshatsharma/image/upload/v1724602328/kmmueabxg0zal7j5ll09.png",
    roomPhotoUrls: [
      [
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005026/cld-sample-4.jpg",
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005025/samples/cup-on-a-table.jpg",
      ],
    ],
    rooms: [
      {
        propertyTypeId: 1,
        floorLevelId: 1,
        maxOccupants: 2,
        monthlyRent: 8500,
        furnishingTypeId: 2,
        foodPreferenceId: 2,
        foodLevelId: 1,
        coolingTypeId: 2,
        availableFrom: "2026-06-01",
        description:
          "Semi-furnished room on ground floor, non-veg allowed, shared kitchen",
        allowSmoking: false,
        securityDeposit: 8500,
        bedType: "Double",
        singleBedCount: 0,
        doubleBedCount: 1,
        rentTiers: [
          { occupants: 1, rent: 6500 },
          { occupants: 2, rent: 8500 },
        ],
      },
    ],
  },
  {
    location: { latitude: 26.9489, longitude: 75.8256 },
    address: "Vidhyadhar Nagar Sector 6, Jaipur, Rajasthan 302023",
    exteriorPhotoUrl:
      "https://res.cloudinary.com/akshatsharma/image/upload/v1723005018/samples/landscapes/architecture-signs.jpg",
    roomPhotoUrls: [
      [
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005017/samples/bike.jpg",
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005025/samples/dessert-on-a-plate.jpg",
      ],
      [
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005025/samples/dessert-on-a-plate.jpg",
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005025/samples/coffee.jpg",
      ],
    ],
    rooms: [
      {
        propertyTypeId: 2,
        floorLevelId: 2,
        maxOccupants: 3,
        monthlyRent: 20000,
        furnishingTypeId: 3,
        foodPreferenceId: 1,
        foodLevelId: 1,
        coolingTypeId: 1,
        availableFrom: "2026-05-01",
        description:
          "2BHK fully furnished flat on first floor, spacious, near shopping complex",
        allowSmoking: false,
        securityDeposit: 40000,
        bedType: "Double",
        singleBedCount: 0,
        doubleBedCount: 2,
        rentTiers: [
          { occupants: 2, rent: 17000 },
          { occupants: 3, rent: 20000 },
        ],
      },
    ],
  },
  {
    location: { latitude: 26.8638, longitude: 75.8028 },
    address: "Sitapura Extension, Jaipur, Rajasthan 302022",
    exteriorPhotoUrl:
      "https://res.cloudinary.com/akshatsharma/image/upload/v1723005018/samples/landscapes/architecture-signs.jpg",
    roomPhotoUrls: [
      [
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005017/samples/landscapes/girl-urban-view.jpg",
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005025/samples/coffee.jpg",
      ],
      [
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005018/samples/landscapes/architecture-signs.jpg",
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005025/samples/coffee.jpg",
      ],
    ],
    rooms: [
      {
        propertyTypeId: 1,
        floorLevelId: 2,
        maxOccupants: 1,
        monthlyRent: 7500,
        furnishingTypeId: 2,
        foodPreferenceId: 1,
        foodLevelId: 1,
        coolingTypeId: 1,
        availableFrom: "2026-05-01",
        description:
          "Semi-furnished room near Sitapura Industrial Area, ideal for working professionals",
        allowSmoking: false,
        securityDeposit: 7500,
        bedType: "Single",
        singleBedCount: 1,
        doubleBedCount: 0,
        rentTiers: [{ occupants: 1, rent: 7500 }],
      },
    ],
  },
  {
    location: { latitude: 26.9012, longitude: 75.7498 },
    address: "Triveni Nagar Extension, Jaipur, Rajasthan 302021",
    exteriorPhotoUrl:
      "https://res.cloudinary.com/akshatsharma/image/upload/v1724602328/kmmueabxg0zal7j5ll09.png",
    roomPhotoUrls: [
      [
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005025/samples/coffee.jpg",
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005025/samples/cup-on-a-table.jpg",
      ],
      [
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005025/samples/coffee.jpg",
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005017/samples/landscapes/girl-urban-view.jpg",
      ],
    ],
    rooms: [
      {
        propertyTypeId: 1,
        floorLevelId: 4,
        maxOccupants: 2,
        monthlyRent: 10500,
        furnishingTypeId: 3,
        foodPreferenceId: 1,
        foodLevelId: 1,
        coolingTypeId: 1,
        availableFrom: "2026-05-20",
        description: "Fully furnished room on third floor with rooftop access and city view",
        allowSmoking: false,
        securityDeposit: 10500,
        bedType: "Double",
        singleBedCount: 0,
        doubleBedCount: 1,
        rentTiers: [
          { occupants: 1, rent: 8000 },
          { occupants: 2, rent: 10500 },
        ],
      },
    ],
  },
  {
    location: { latitude: 26.9195, longitude: 75.8312 },
    address: "Gandhi Nagar Extension, Jaipur, Rajasthan 302015",
    exteriorPhotoUrl:
      "https://res.cloudinary.com/akshatsharma/image/upload/v1723005026/cld-sample-4.jpg",
    roomPhotoUrls: [
      [
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005025/samples/coffee.jpg",
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005025/samples/dessert-on-a-plate.jpg",
      ],
    ],
    rooms: [
      {
        propertyTypeId: 2,
        floorLevelId: 2,
        maxOccupants: 2,
        monthlyRent: 14000,
        furnishingTypeId: 3,
        foodPreferenceId: 1,
        foodLevelId: 1,
        coolingTypeId: 1,
        availableFrom: "2026-06-01",
        description:
          "1BHK furnished flat near Gandhi Nagar Railway Station, good connectivity",
        allowSmoking: false,
        securityDeposit: 28000,
        bedType: "Double",
        singleBedCount: 0,
        doubleBedCount: 1,
        rentTiers: [
          { occupants: 1, rent: 11000 },
          { occupants: 2, rent: 14000 },
        ],
      },
    ],
  },
  {
    location: { latitude: 26.8762, longitude: 75.7589 },
    address: "Sodala Main, Jaipur, Rajasthan 302006",
    exteriorPhotoUrl:
      "https://res.cloudinary.com/akshatsharma/image/upload/v1723005018/samples/landscapes/architecture-signs.jpg",
    roomPhotoUrls: [
      [
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005017/samples/landscapes/girl-urban-view.jpg",
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005025/samples/coffee.jpg",
      ],
      [
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005018/samples/landscapes/architecture-signs.jpg",
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005025/samples/coffee.jpg",
      ],
      [
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005018/samples/landscapes/architecture-signs.jpg",
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005025/samples/cup-on-a-table.jpg",
      ],
    ],
    rooms: [
      {
        propertyTypeId: 1,
        floorLevelId: 1,
        maxOccupants: 2,
        monthlyRent: 8000,
        furnishingTypeId: 2,
        foodPreferenceId: 2,
        foodLevelId: 1,
        coolingTypeId: 2,
        availableFrom: "2026-05-01",
        description: "Semi-furnished ground floor room, non-veg allowed, near Sodala Market",
        allowSmoking: true,
        securityDeposit: 8000,
        bedType: "Double",
        singleBedCount: 0,
        doubleBedCount: 1,
        rentTiers: [
          { occupants: 1, rent: 6000 },
          { occupants: 2, rent: 8000 },
        ],
      },
    ],
  },
  {
    location: { latitude: 26.9318, longitude: 75.8445 },
    address: "Barkat Nagar Extension, Jaipur, Rajasthan 302019",
    exteriorPhotoUrl:
      "https://res.cloudinary.com/akshatsharma/image/upload/v1723005017/samples/landscapes/girl-urban-view.jpg",
    roomPhotoUrls: [
      [
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005026/cld-sample-4.jpg",
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005025/samples/cup-on-a-table.jpg",
      ],
      [
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005018/samples/landscapes/architecture-signs.jpg",
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005026/cld-sample-4.jpg",
      ],
      [
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005025/samples/dessert-on-a-plate.jpg",
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005018/samples/landscapes/architecture-signs.jpg",
      ],
    ],
    rooms: [
      {
        propertyTypeId: 1,
        floorLevelId: 3,
        maxOccupants: 1,
        monthlyRent: 7000,
        furnishingTypeId: 1,
        foodPreferenceId: 1,
        foodLevelId: 1,
        coolingTypeId: 2,
        availableFrom: "2026-05-10",
        description:
          "Unfurnished single room on second floor, peaceful area, easy commute to city",
        allowSmoking: false,
        securityDeposit: 7000,
        bedType: "Single",
        singleBedCount: 1,
        doubleBedCount: 0,
        rentTiers: [{ occupants: 1, rent: 7000 }],
      },
    ],
  },
  {
    location: { latitude: 26.9641, longitude: 75.7738 },
    address: "Ambabari Extension, Jaipur, Rajasthan 302023",
    exteriorPhotoUrl:
      "https://res.cloudinary.com/akshatsharma/image/upload/v1723005018/samples/landscapes/architecture-signs.jpg",
    roomPhotoUrls: [
      [
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005018/samples/landscapes/architecture-signs.jpg",
        "https://res.cloudinary.com/akshatsharma/image/upload/v1723005017/samples/bike.jpg",
      ],
    ],
    rooms: [
      {
        propertyTypeId: 2,
        floorLevelId: 2,
        maxOccupants: 4,
        monthlyRent: 25000,
        furnishingTypeId: 3,
        foodPreferenceId: 1,
        foodLevelId: 1,
        coolingTypeId: 1,
        availableFrom: "2026-06-01",
        description:
          "3BHK fully furnished flat on first floor, lift, generator backup, prime location",
        allowSmoking: false,
        securityDeposit: 50000,
        bedType: "Double",
        singleBedCount: 1,
        doubleBedCount: 2,
        rentTiers: [
          { occupants: 2, rent: 20000 },
          { occupants: 3, rent: 22500 },
          { occupants: 4, rent: 25000 },
        ],
      },
    ],
  },
];

async function submitListing(
  payload: ListingPayload,
  index: number
): Promise<void> {
  const form = new FormData();
  form.append("data", JSON.stringify(payload));
  if (LANDLORD_ID) form.append("landlordId", LANDLORD_ID);

  const headers: Record<string, string> = {};
  if (TOKEN) headers["Authorization"] = `Bearer ${TOKEN}`;

  const res = await fetch(`${BASE_URL}/api/listings/submit`, {
    method: "POST",
    headers,
    body: form,
  });

  const json = (await res.json()) as { listingIds?: string[]; error?: string };

  if (!res.ok) {
    console.error(`[${index + 1}] FAILED (${res.status}): ${json.error ?? JSON.stringify(json)}`);
    return;
  }

  console.log(
    `[${index + 1}] OK → ${json.listingIds?.join(", ")} | ${payload.address}`
  );
}

async function main() {
  console.log(`Seeding ${listings.length} listings to ${BASE_URL} …\n`);
  for (let i = 0; i < listings.length; i++) {
    await submitListing(listings[i]!, i);
  }
  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
