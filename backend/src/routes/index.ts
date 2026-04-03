import { Router } from "express";

import listingsRoutes from "./listings.routes";
import authRoutes from "./auth.routes";

const router = Router();

// Health check
router.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running 🚀",
    timestamp: new Date().toISOString(),
  });
});

// Register route modules here
router.use("/auth", authRoutes);
router.use("/listings", listingsRoutes);

export default router;
