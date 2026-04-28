/**
 * Simple JWT token management
 * Centralized token creation and cookie handling
 */
import jwt from "jsonwebtoken";
import type { Response } from "express";
import type { IUser } from "../models/User.js";
import env from "../config/env.js";

/**
 * Create JWT token for user
 */
export function createAuthToken(user: IUser): string {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: "User" // Simplified - removed role complexity
    },
    env.JWT_SECRET,
    { expiresIn: "7d" } // 7 days
  );
}

/**
 * Send auth cookie with JWT token
 * Returns the token for API responses
 */
export function sendAuthCookie(res: Response, user: IUser): string {
  const token = createAuthToken(user);
  
  // Set HTTP-only cookie (primary authentication method)
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });
  
  return token;
}

/**
 * Clear authentication cookie
 */
export function clearAuthCookie(res: Response): void {
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: env.NODE_ENV === "production", 
    sameSite: "strict",
  });
}

/**
 * Simple user data for responses (no sensitive info)
 */
export function getUserPublicData(user: IUser) {
  return {
    id: user._id,
    email: user.email,
    gender: user.gender ?? null,
    isVerified: Boolean(user.isVerified),
    hasFullName: Boolean(user.fullName?.trim()),
    hasEmail: Boolean(user.email?.trim()),
    hasPhone: Boolean(user.phone?.trim()),
    hasGender: Boolean(user.gender),
    hasPhoto: Boolean(user.photoUrl),
    hasAadhaar: Boolean(user.aadhaarEncrypted),
  };
}