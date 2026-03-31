import { z } from "zod";

export const healthSchema = z.object({
  status: z.literal("ok"),
  service: z.string()
});

export const userSchema = z.object({
  userName: z.string().trim().min(1, "userName is required"),
  phone: z.string().trim().regex(/^\+?\d{10,15}$/, "phone must be 10-15 digits and may start with +"),
  userEmail: z.string().trim().email("userEmail must be valid"),
  aadhaarNumber: z
    .string()
    .trim()
    .regex(/^\d{12}$/, "aadhaarNumber must be exactly 12 digits"),
  localAddress: z.string().trim().min(10, "localAddress is required"),
  hometownAddress: z.string().trim().min(10, "hometownAddress is required"),
  profilePhotoUrl: z.string().trim().url("profilePhotoUrl must be a valid URL")
});

export type Health = z.infer<typeof healthSchema>;
export type UserInput = z.infer<typeof userSchema>;