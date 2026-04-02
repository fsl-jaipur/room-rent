import type { NextFunction, Request, Response } from "express";
import { createUserRecord, getUserRecord, updateUserRecord } from "../services/user.service";
import { userIdParamSchema, userSchema } from "../shared/schema";
import { z } from "zod";

export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const validatedData = userSchema.parse(req.body);
    const user = await createUserRecord(validatedData);

    return res.status(201).json({
      message: "User saved successfully",
      user
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    return next(error);
  }
}

export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = userIdParamSchema.parse(req.params);
    const user = await getUserRecord(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      message: "User fetched successfully",
      user
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = userIdParamSchema.parse(req.params);
    const validatedData = userSchema.partial().parse(req.body);

    const updatedUser = await updateUserRecord(userId, validatedData);

    return res.status(200).json({
      message: "User updated successfully",
      user: updatedUser
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    return next(error);
  }
}
