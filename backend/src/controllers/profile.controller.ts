import type { Request, Response } from "express";
import crypto from "node:crypto";
import User from "../models/User.js";

type ProfilePayload = {
  fullName?: unknown;
  email?: unknown;
  location?: unknown;
  aadhaar?: unknown;
  phone?: unknown;
  photo?: unknown;
  photoUrl?: unknown;
  gender?: unknown;
};

const trimStringOrNull = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const hasOwn = (payload: object, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(payload, key);

const normalizeEmail = (value: string | null): string | null =>
  value ? value.toLowerCase() : null;

// Helper to check if a MongoDB error is a duplicate key error
const isDuplicateKeyError = (error: unknown): boolean => {
  if (typeof error !== "object" || error === null) return false;
  return (error as { code?: number }).code === 11000;
};

const getProfileByUserId = async (userId: string) => {
  const user = await User.findById(userId).lean();
  if (!user) return null;

  return {
    id: user._id,
    fullName: user.fullName ?? null,
    email: user.email ?? null,
    location: user.permanentAddress ?? null,
    aadhaar: null, // Never expose aadhaar in profile response
    phone: user.phone ?? null,
    photo: user.photoUrl ?? null,
    gender: user.gender ?? null,
  };
};

const saveProfile = async (
  userId: string,
  payload: ProfilePayload
): Promise<void> => {
  const user = await User.findById(userId);
  if (!user) throw new Error("USER_NOT_FOUND");

  const updates: Record<string, unknown> = {};

  // Full name
  const fullName = trimStringOrNull(payload.fullName);
  if (fullName !== null) {
    updates.fullName = fullName;
  }

  // Email (immutable once set)
  const email = normalizeEmail(trimStringOrNull(payload.email));
  if (email !== null) {
    const existingEmail = normalizeEmail(user.email ?? null);
    if (existingEmail === null) {
      updates.email = email;
    } else if (email !== existingEmail) {
      throw new Error("IMMUTABLE_EMAIL");
    }
  }

  // Location / Address
  const location = trimStringOrNull(payload.location);
  if (hasOwn(payload as object, "location") && location !== null) {
    updates.permanentAddress = location;
  }

  // Aadhaar
  const aadhaar = trimStringOrNull(payload.aadhaar);
  if (aadhaar !== null && !/^\d{12}$/.test(aadhaar)) {
    throw new Error("VALIDATION_AADHAAR");
  }
  if (hasOwn(payload as object, "aadhaar") && aadhaar !== null) {
    // Aadhaar is immutable once set
    if (user.aadhaarEncrypted) {
      throw new Error("IMMUTABLE_AADHAAR");
    }
    // Store as encrypted buffer and hash
    updates.aadhaarEncrypted = Buffer.from(aadhaar, "utf8");
    updates.aadhaarHash = crypto.createHash("sha256").update(aadhaar).digest();
  }

  // Phone
  const phone = trimStringOrNull(payload.phone);
  if (phone !== null) {
    updates.phone = phone;
  }

  // Photo
  const photo =
    trimStringOrNull(payload.photoUrl) ?? trimStringOrNull(payload.photo);
  if (
    (hasOwn(payload as object, "photoUrl") || hasOwn(payload as object, "photo")) &&
    photo !== null
  ) {
    updates.photoUrl = photo;
  }

  // Gender
  const gender = trimStringOrNull(payload.gender);
  if (hasOwn(payload as object, "gender") && gender !== null) {
    const normalizedGender = gender.toLowerCase();
    if (normalizedGender !== "male" && normalizedGender !== "female") {
      throw new Error("VALIDATION_GENDER");
    }
    updates.gender = normalizedGender === "male" ? "Male" : "Female";
  }

  if (Object.keys(updates).length === 0) {
    return;
  }

  await User.updateOne({ _id: userId }, { $set: updates });
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  if (!req.user?.id) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const profile = await getProfileByUserId(req.user.id);
    if (!profile) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.status(200).json({ profile });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createProfile = async (req: Request, res: Response): Promise<void> => {
  if (!req.user?.id) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    await saveProfile(req.user.id, req.body as ProfilePayload);
    const profile = await getProfileByUserId(req.user.id);
    res.status(201).json({ message: "Profile saved", profile });
  } catch (error) {
    if (error instanceof Error && error.message === "VALIDATION_AADHAAR") {
      res.status(400).json({ error: "Aadhaar must be exactly 12 digits" });
      return;
    }
    if (error instanceof Error && error.message === "VALIDATION_GENDER") {
      res.status(400).json({ error: "Gender must be Male or Female" });
      return;
    }
    if (error instanceof Error && error.message === "IMMUTABLE_EMAIL") {
      res.status(400).json({ error: "Email cannot be changed" });
      return;
    }
    if (error instanceof Error && error.message === "IMMUTABLE_AADHAAR") {
      res.status(400).json({ error: "Aadhaar cannot be changed once saved" });
      return;
    }
    if (isDuplicateKeyError(error)) {
      res.status(409).json({ error: "Email, phone, or Aadhaar already in use" });
      return;
    }
    console.error("Create profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  if (!req.user?.id) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    await saveProfile(req.user.id, req.body as ProfilePayload);
    const profile = await getProfileByUserId(req.user.id);
    res.status(200).json({ message: "Profile updated", profile });
  } catch (error) {
    if (error instanceof Error && error.message === "VALIDATION_AADHAAR") {
      res.status(400).json({ error: "Aadhaar must be exactly 12 digits" });
      return;
    }
    if (error instanceof Error && error.message === "VALIDATION_GENDER") {
      res.status(400).json({ error: "Gender must be Male or Female" });
      return;
    }
    if (error instanceof Error && error.message === "IMMUTABLE_EMAIL") {
      res.status(400).json({ error: "Email cannot be changed" });
      return;
    }
    if (error instanceof Error && error.message === "IMMUTABLE_AADHAAR") {
      res.status(400).json({ error: "Aadhaar cannot be changed once saved" });
      return;
    }
    if (isDuplicateKeyError(error)) {
      res.status(409).json({ error: "Email, phone, or Aadhaar already in use" });
      return;
    }
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
