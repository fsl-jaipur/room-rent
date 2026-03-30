import cors from "cors";
import express from "express";

import { getSetting } from "@rent/config";
import { errorHandler } from "./middlewares/error.middleware";
import { healthRouter } from "./routes/health.routes";
import { userRouter } from "./routes/user.routes";

export function createApp() {
  const app = express();
  const corsOrigin = getSetting("CORS_ORIGIN") ?? "*";

  app.use(
    cors({
      origin: corsOrigin === "*" ? true : corsOrigin
    })
  );
  app.use(express.json());

  app.use(healthRouter);
  app.use(userRouter);

  app.use(errorHandler);

  return { app, corsOrigin };
}