import { Router } from "express";

import listingsRoutes from "./listings.routes";

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
router.use("/listings", listingsRoutes);

export default router;
