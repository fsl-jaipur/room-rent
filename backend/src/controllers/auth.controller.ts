import type { Request, Response } from "express";
import sql from "mssql";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/db.js";
import env from "../config/env.js";

// Helper to generate and set token
const sendAuthCookie = (res: Response, user: any) => {
  const token = jwt.sign(
    { id: user.UserId, email: user.Email, role: user.Role },
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
  const { fullName, email, phone, password } = req.body;

  if (!fullName || !email || !phone || !password) {
    res.status(400).json({ error: "Please provide fullName, email, phone, and password" });
    return;
  }

  try {
    const pool = await db.getPool();

    // Check if user already exists
    const userExists = await pool.request()
      .input("Email", sql.NVarChar, email)
      .query("SELECT UserId FROM dbo.Users WHERE Email = @Email");

    if (userExists.recordset.length > 0) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert new Landlord
    const result = await pool.request()
      .input("FullName", sql.NVarChar, fullName)
      .input("Email", sql.NVarChar, email)
      .input("Phone", sql.VarChar, phone)
      .input("PasswordHash", sql.NVarChar, passwordHash)
      .input("Role", sql.VarChar, "Landlord")
      .query(`
        INSERT INTO dbo.Users (FullName, Email, Phone, PasswordHash, Role, IsVerified)
        OUTPUT INSERTED.UserId, INSERTED.Email, INSERTED.Role
        VALUES (@FullName, @Email, @Phone, @PasswordHash, @Role, 0)
      `);

    const user = result.recordset[0];
    
    // Create session
    sendAuthCookie(res, user);

    res.status(201).json({
      message: "Registration successful",
      user: { id: user.UserId, email: user.Email, role: user.Role }
    });
  } catch (error: any) {
    console.error("Registration Error: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Please provide email and password" });
    return;
  }

  try {
    const pool = await db.getPool();

    // Find User
    const result = await pool.request()
      .input("Email", sql.NVarChar, email)
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

    // Verify Password
    const isMatch = await bcrypt.compare(password, user.PasswordHash);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Create session
    sendAuthCookie(res, user);

    res.status(200).json({
      message: "Login successful",
      user: { id: user.UserId, email: user.Email, role: user.Role }
    });
  } catch (error: any) {
    console.error("Login Error: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const logout = (req: Request, res: Response): void => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0)
  });
  res.status(200).json({ message: "Logged out successfully" });
};
