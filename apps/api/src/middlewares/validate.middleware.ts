import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

export function validateBody<T>(schema: z.ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        issues: result.error.issues
      });
    }

    req.body = result.data;
    return next();
  };
}
