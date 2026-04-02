import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import env from "./config/env";
import { getPool, closePool } from "./config/db";
import routes from "./routes/index";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";

const app = express();

// --------------- Middleware ---------------
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --------------- Routes ---------------
app.use("/api", routes);

// --------------- Error handling ---------------
app.use(notFoundHandler);
app.use(errorHandler);

// --------------- Start server ---------------
const start = async () => {
  try {
    // Connect to Azure SQL Server
    await getPool();

    app.listen(env.PORT, () => {
      console.log(
        `🚀 Server running on http://localhost:${env.PORT} [${env.NODE_ENV}]`
      );
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  await closePool();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await closePool();
  process.exit(0);
});

start();

export default app;
