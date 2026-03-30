import type { Request, Response, NextFunction } from "express";

import type { UserInput } from "@rent/shared";
import { createUserRecord } from "../services/user.service";

export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.body as UserInput;
    await createUserRecord(user);

    return res.status(201).json({
      message: "User saved successfully"
    });
  } catch (error) {
    return next(error);
  }
}