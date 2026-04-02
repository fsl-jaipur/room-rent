import { Router } from "express";
import { createSingleListing, createBulkListings } from "../controllers/listings.controller";

const router = Router();

// In a real scenario, we would add auth middlewares here like:
// router.use(requireLandlordAuth);

// Single room submission
router.post("/", createSingleListing);

// Bulk rooms submission (multiple rooms down this location)
router.post("/bulk", createBulkListings);

export default router;
