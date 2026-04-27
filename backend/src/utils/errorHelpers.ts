/**
 * Simple error handling utilities
 * Standardized error responses and handling
 */
import type { Response } from "express";

/**
 * Check if error is a MongoDB duplicate key error
 */
export function isDuplicateKeyError(error: any): { field: string } | null {
  if (error?.code === 11000 && error?.keyPattern) {
    const field = Object.keys(error.keyPattern)[0];
    return { field };
  }
  return null;
}

/**
 * Standard error responses to keep consistency
 */
export const ErrorResponses = {
  unauthorized: (res: Response) => 
    res.status(401).json({ error: "Unauthorized" }),
    
  badRequest: (res: Response, message: string = "Bad request") => 
    res.status(400).json({ error: message }),
    
  notFound: (res: Response, message: string = "Not found") => 
    res.status(404).json({ error: message }),
    
  conflict: (res: Response, message: string = "Conflict") => 
    res.status(409).json({ error: message }),
    
  forbidden: (res: Response, message: string = "Forbidden") => 
    res.status(403).json({ error: message }),
    
  internal: (res: Response, message: string = "Internal server error") => 
    res.status(500).json({ error: message }),

  // Specific auth errors
  invalidCredentials: (res: Response) => 
    res.status(401).json({ error: "Invalid credentials" }),
    
  accountDeactivated: (res: Response) => 
    res.status(403).json({ error: "Account is deactivated" }),
    
  emailExists: (res: Response) => 
    res.status(409).json({ error: "Email already registered" }),
    
  phoneExists: (res: Response) => 
    res.status(409).json({ error: "Phone already registered" })
};

/**
 * Handle duplicate key errors consistently
 */
export function handleDuplicateError(error: any, res: Response): boolean {
  const duplicate = isDuplicateKeyError(error);
  if (duplicate) {
    if (duplicate.field === "email") {
      ErrorResponses.emailExists(res);
      return true;
    }
    if (duplicate.field === "phone") {
      ErrorResponses.phoneExists(res);
      return true;
    }
    ErrorResponses.conflict(res, "Account already exists");
    return true;
  }
  return false;
}