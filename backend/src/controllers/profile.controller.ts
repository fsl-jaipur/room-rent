import type { Request, Response } from "express";
import crypto from "node:crypto";
import nodemailer from "nodemailer";
import User from "../models/User.js";
import env from "../config/env.js";

const mailer = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
});

const sha256Hex = (value: string) =>
  crypto.createHash("sha256").update(value).digest("hex");

const buildVerifyEmailHtml = (verifyLink: string, fullName: string) => `
<div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;background:#fff;border-radius:12px;border:1px solid #eee">
  <h2 style="color:#0f172a">Confirm your new email, ${fullName}</h2>
  <p style="color:#475569">You changed the email on your Roombaazi account. Click below to verify it.</p>
  <a href="${verifyLink}" style="display:inline-block;margin:24px 0;padding:14px 28px;background:#ff9737;color:#fff;border-radius:8px;text-decoration:none;font-weight:700">Verify Email</a>
  <p style="color:#94a3b8;font-size:13px">Link expires in 24 hours. If you didn't request this, ignore this email.</p>
</div>`;

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
    aadhaar: (() => {
      const raw = user.aadhaarEncrypted as unknown;
      if (!raw) return null;
      // Mongoose lean() returns BSON Binary, not a Node.js Buffer
      if (Buffer.isBuffer(raw)) return (raw as Buffer).toString('utf8') || null;
      // BSON Binary: has .buffer (Uint8Array) property
      const bsonBuf = (raw as { buffer?: Uint8Array }).buffer;
      if (bsonBuf) return Buffer.from(bsonBuf).toString('utf8') || null;
      return null;
    })(),
    phone: (() => {
      const p = user.phone ?? null;
      // Strip Google signup phone placeholder (starts with 'G' followed by digits)
      if (p && /^G\d+$/.test(p)) return null;
      return p;
    })(),
    photo: user.photoUrl ?? null,
    gender: user.gender ?? null,
  };
};

const saveProfile = async (
  userId: string,
  payload: ProfilePayload
): Promise<{ emailSent: boolean }> => {
  const user = await User.findById(userId);
  if (!user) throw new Error("USER_NOT_FOUND");

  const updates: Record<string, unknown> = {};

  // Full name
  const fullName = trimStringOrNull(payload.fullName);
  if (fullName !== null) {
    updates.fullName = fullName;
  }

  // Email
  const email = normalizeEmail(trimStringOrNull(payload.email));
  if (hasOwn(payload as object, "email") && email !== null) {
    const existingEmail = normalizeEmail(user.email ?? null);
    const emailChanged = email !== existingEmail;

    if (emailChanged) {
      // New email → unverify and generate new token
      const rawToken = crypto.randomBytes(32).toString("hex");
      updates.email = email;
      updates.isVerified = false;
      updates.emailVerifyToken = sha256Hex(rawToken);
      updates.emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      // Store raw token so we can send it after save
      (updates as Record<string, unknown>).__rawVerifyToken = rawToken;
    } else if (!user.isVerified) {
      // Same email but not verified → resend verification
      const rawToken = crypto.randomBytes(32).toString("hex");
      updates.emailVerifyToken = sha256Hex(rawToken);
      updates.emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      (updates as Record<string, unknown>).__rawVerifyToken = rawToken;
    }
    // Same email + already verified → do nothing
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
  if (hasOwn(payload as object, "phone") && phone !== null) {
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
    if (normalizedGender !== "male" && normalizedGender !== "female" && normalizedGender !== "other") {
      throw new Error("VALIDATION_GENDER");
    }
    const genderMap: Record<string, "Male" | "Female" | "Other"> = { male: "Male", female: "Female", other: "Other" };
    updates.gender = genderMap[normalizedGender];
  }

  if (Object.keys(updates).length === 0) {
    return { emailSent: false };
  }

  // Extract the raw token before saving (it must not be stored in DB as-is)
  const rawVerifyToken = (updates as Record<string, unknown>).__rawVerifyToken as string | undefined;
  delete (updates as Record<string, unknown>).__rawVerifyToken;

  await User.updateOne({ _id: userId }, { $set: updates });

  // Send verification email if needed
  let emailSent = false;
  if (rawVerifyToken && env.SMTP_USER && env.SMTP_PASS) {
    const targetEmail = (updates.email as string | undefined) ?? user.email;
    const name = (updates.fullName as string | undefined) ?? user.fullName ?? "there";
    const verifyLink = `${env.CLIENT_URL}/verify-email?token=${rawVerifyToken}`;
    try {
      await mailer.sendMail({
        from: env.EMAIL_FROM || env.SMTP_USER,
        to: targetEmail,
        subject: "Confirm your email – Roombaazi",
        html: buildVerifyEmailHtml(verifyLink, name),
      });
      emailSent = true;
    } catch (err) {
      console.error("Profile verify email send failed:", err);
    }
  }

  return { emailSent };
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
    const { emailSent } = await saveProfile(req.user.id, req.body as ProfilePayload);
    const profile = await getProfileByUserId(req.user.id);
    res.status(201).json({ message: "Profile saved", profile, emailSent });
  } catch (error) {
    if (error instanceof Error && error.message === "VALIDATION_AADHAAR") {
      res.status(400).json({ error: "Aadhaar must be exactly 12 digits" });
      return;
    }
    if (error instanceof Error && error.message === "VALIDATION_GENDER") {
      res.status(400).json({ error: "Gender must be Male, Female, or Other" });
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
    const { emailSent } = await saveProfile(req.user.id, req.body as ProfilePayload);
    const profile = await getProfileByUserId(req.user.id);
    res.status(200).json({ message: "Profile updated", profile, emailSent });
  } catch (error) {
    if (error instanceof Error && error.message === "VALIDATION_AADHAAR") {
      res.status(400).json({ error: "Aadhaar must be exactly 12 digits" });
      return;
    }
    if (error instanceof Error && error.message === "VALIDATION_GENDER") {
      res.status(400).json({ error: "Gender must be Male, Female, or Other" });
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
