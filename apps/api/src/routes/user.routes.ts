import { Router } from "express";
import { z } from "zod";

import { userIdParamSchema } from "@rent/shared";
import { createUser, getUser, updateUser } from "../controllers/user.controller";
import { validateBody, validateParams } from "../middlewares/validate.middleware";

const userRouter = Router();

const userMinimalSchema = z.object({
  userName: z.string().trim().min(1, "userName is required"),
  phone: z.string().trim().regex(/^\+?\d{10,15}$/, "phone must be 10-15 digits and may start with +"),
  localAddress: z.string().trim().min(10, "localAddress is required")
});

userRouter.post("/users", validateBody(userMinimalSchema), createUser);
userRouter.get("/users/:userId", validateParams(userIdParamSchema), getUser);
userRouter.put("/users/:userId", validateParams(userIdParamSchema), validateBody(userMinimalSchema), updateUser);

export { userRouter };
