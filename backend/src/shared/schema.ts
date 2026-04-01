import { z } from "zod";

export const healthSchema = z.object({
  status: z.literal("ok"),
  service: z.string()
});

export const userSchema = z.object({
  Role: z.string(),
  FullName: z.string().trim().min(1, "FullName is required"),
  Email: z.string().trim().email("Email must be valid"),
  Phone: z.string().trim(),
  PasswordHash: z.string(),
  City: z.string().optional(),
  State: z.string().optional(),
  Pincode: z.string().optional(),
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
