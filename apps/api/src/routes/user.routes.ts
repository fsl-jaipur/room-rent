import { Router } from "express";

import { userSchema } from "@rent/shared";
import { createUser } from "../controllers/user.controller";
import { validateBody } from "../middlewares/validate.middleware";

const userRouter = Router();

userRouter.post("/users", validateBody(userSchema), createUser);

export { userRouter };