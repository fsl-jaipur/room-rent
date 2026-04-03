import type { Request, Response } from "express";
import sql from "mssql";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/db.js";
import env from "../config/env.js";

type AuthUserRecord = {
  UserId: string;
  Email: string | null;
  Role: string | null;
};

type UserRole = "Landlord" | "Tenant";
const ALLOWED_ROLES: UserRole[] = ["Landlord", "Tenant"];

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const normalizeEmail = (value: string): string => value.trim().toLowerCase();

const extractSqlMessage = (error: unknown): string => {
  if (typeof error !== "object" || error === null) {
    return "";
  }

  const maybeMessage = (error as { message?: unknown }).message;
  return typeof maybeMessage === "string" ? maybeMessage : "";
};

const sendAuthCookie = (res: Response, user: AuthUserRecord) => {
  const email = user.Email ?? "";
  const role = user.Role ?? "Tenant";

  const token = jwt.sign(
    { id: user.UserId, email, role },
    env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const { fullName, email, phone, password, role } = req.body as {
    fullName?: unknown;
    email?: unknown;
    phone?: unknown;
    password?: unknown;
    role?: unknown;
  };

  if (
    !isNonEmptyString(fullName) ||
    !isNonEmptyString(email) ||
    !isNonEmptyString(phone) ||
    !isNonEmptyString(password)
  ) {
    res
      .status(400)
      .json({ error: "Please provide fullName, email, phone, and password" });
    return;
  }

  const normalizedEmail = normalizeEmail(email);
  const normalizedPhone = phone.trim();
  const normalizedFullName = fullName.trim();
  const normalizedRole: UserRole =
    typeof role === "string" && ALLOWED_ROLES.includes(role as UserRole)
      ? (role as UserRole)
      : "Tenant";

  try {
    const pool = await db.getPool();

    const userExists = await pool
      .request()
      .input("Email", sql.VarChar, normalizedEmail)
      .input("Phone", sql.VarChar, normalizedPhone)
      .query(
        "SELECT UserId, Email, Phone FROM dbo.Users WHERE Email = @Email OR Phone = @Phone"
      );

    if (userExists.recordset.length > 0) {
      const duplicateUser = userExists.recordset[0] as {
        Email: string | null;
        Phone: string;
      };
      if (duplicateUser.Email === normalizedEmail) {
        res.status(409).json({ error: "Email already registered" });
      } else {
        res.status(409).json({ error: "Phone already registered" });
      }
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await pool
      .request()
      .input("FullName", sql.NVarChar, normalizedFullName)
      .input("Email", sql.VarChar, normalizedEmail)
      .input("Phone", sql.VarChar, normalizedPhone)
      .input("PasswordHash", sql.VarChar, passwordHash)
      .input("Role", sql.VarChar, normalizedRole)
      .query(`
        INSERT INTO dbo.Users (FullName, Email, Phone, PasswordHash, Role, IsVerified)
        OUTPUT INSERTED.UserId, INSERTED.Email, INSERTED.Role
        VALUES (@FullName, @Email, @Phone, @PasswordHash, @Role, 0)
      `);

    const user = result.recordset[0] as AuthUserRecord;
    sendAuthCookie(res, user);

    res.status(201).json({
      message: "Registration successful",
      user: { id: user.UserId, email: user.Email, role: user.Role },
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "number" in error &&
      (error as { number?: number }).number !== undefined
    ) {
      const sqlError = error as { number: number };
      if (sqlError.number === 2627 || sqlError.number === 2601) {
        const sqlMessage = extractSqlMessage(error);

        if (sqlMessage.includes("UQ_Users_Email")) {
          res.status(409).json({ error: "Email already registered" });
          return;
        }

        if (sqlMessage.includes("UQ_Users_Phone")) {
          res.status(409).json({ error: "Phone already registered" });
          return;
        }

        if (sqlMessage.includes("UQ_Users_AadhaarHash")) {
          res.status(500).json({
            error:
              "Registration blocked by database constraint UQ_Users_AadhaarHash. Apply the nullable unique-index fix and try again.",
          });
          return;
        }

        res.status(409).json({ error: "Account already exists" });
        return;
      }
    }

    console.error("Registration Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as {
    email?: unknown;
    password?: unknown;
  };

  if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
    res.status(400).json({ error: "Please provide email and password" });
    return;
  }

  const normalizedEmail = normalizeEmail(email);

  try {
    const pool = await db.getPool();

    const result = await pool
      .request()
      .input("Email", sql.VarChar, normalizedEmail)
      .query(`
        SELECT UserId, Email, PasswordHash, Role, IsActive
        FROM dbo.Users
        WHERE Email = @Email
      `);

    if (result.recordset.length === 0) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const user = result.recordset[0];

    if (!user.IsActive) {
      res.status(403).json({ error: "Account is deactivated" });
      return;
    }

    if (!user.PasswordHash || typeof user.PasswordHash !== "string") {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.PasswordHash);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    sendAuthCookie(res, user);

    res.status(200).json({
      message: "Login successful",
      user: { id: user.UserId, email: user.Email, role: user.Role },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const me = async (req: Request, res: Response): Promise<void> => {
  if (!req.user?.id) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const pool = await db.getPool();
    const result = await pool
      .request()
      .input("UserId", sql.UniqueIdentifier, req.user.id)
      .query(`
        SELECT UserId, Email, Role, IsActive
        FROM dbo.Users
        WHERE UserId = @UserId
      `);

    if (result.recordset.length === 0 || !result.recordset[0].IsActive) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = result.recordset[0] as AuthUserRecord;
    res.status(200).json({
      user: { id: user.UserId, email: user.Email, role: user.Role },
    });
  } catch (error) {
    console.error("Auth me Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const logout = (_req: Request, res: Response): void => {
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.status(200).json({ message: "Logged out successfully" });
};
