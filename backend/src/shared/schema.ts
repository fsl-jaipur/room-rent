import { z } from "zod";

export const healthSchema = z.object({
  status: z.literal("ok"),
  service: z.string()
});

export const userSchema = z.object({
  Role: z.string(),
  FullName: z.string().trim().min(1, "FullName is required"),
  Email: z.string().trim().email("Email must be valid"),
  Phone: z.string().trim().regex(/^\+?\d{10,15}$/, "Phone must be 10-15 digits and may start with +"),
  PasswordHash: z.string(),
  City: z.string().optional(),
  State: z.string().optional(),
  Pincode: z.string().optional(),
});

export const userIdParamSchema = z.object({
  userId: z.string().trim().min(1, "userId is required")
});

const propertyRoomSchema = z.object({
  typeId: z.number().int(),
  roomLocationId: z.number().int(),
  coolingId: z.number().int(),
  balcony: z.boolean(),
  attachedWashroom: z.boolean(),
  interiorId: z.number().int(),
  foodPreferenceId: z.number().int(),
  smokingPreferenceId: z.number().int(),
  price: z.number()
});

export const propertySchema = z.object({
  userId: z.string().trim().min(1, "userId is required"),
  propertyName: z.string().trim().min(1, "propertyName is required"),
  address: z.string().trim().min(1, "address is required"),
  latitude: z.number(),
  longitude: z.number(),
  room: propertyRoomSchema,
  images: z.array(z.string().trim().url("Each image must be a valid URL")).min(1, "At least one image is required")
});

export const propertyQuerySchema = z.object({
  userId: z.string().trim().min(1).optional()
});

export const propertyIdParamSchema = z.object({
  propertyId: z.string().trim().min(1, "propertyId is required")
});

export const listingSchema = z.object({
  Title: z.string().min(1, "Title is required"),
  Description: z.string().optional(),
  FloorLevelId: z.number().int().optional(),
  FurnishingTypeId: z.number().int().optional(),
  MaxOccupants: z.number().int().optional(),
  AllowSmoking: z.boolean().default(false),
  FoodPreferenceId: z.number().int().optional(),
  MonthlyRent: z.number(),
  SecurityDeposit: z.number(),
  AvailableFrom: z.string(), // ISO date string
  AddressLine: z.string(),
  Colony: z.string(),
  City: z.string(),
  State: z.string(),
  Pincode: z.string(),
  Latitude: z.number().optional(),
  Longitude: z.number().optional(),
  StatusId: z.number().int().default(1)
});

export type UserInput = z.infer<typeof userSchema>;
export type ListingInput = z.infer<typeof listingSchema>;
export type UserIdParam = z.infer<typeof userIdParamSchema>;
export type PropertyInput = z.infer<typeof propertySchema>;
export type PropertyQuery = z.infer<typeof propertyQuerySchema>;
export type PropertyIdParam = z.infer<typeof propertyIdParamSchema>;
