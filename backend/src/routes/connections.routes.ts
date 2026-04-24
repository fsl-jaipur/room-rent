import { Router } from "express";
import {
  connectOwner,
  getMyConnectionStatus,
  getLandlordConnections,
  dealDone,
  dealClose,
} from "../controllers/connections.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

// All routes require auth
router.use(requireAuth);

router.post("/", connectOwner);                              // Tenant: connect to a listing's owner
router.get("/my-status/:listingId", getMyConnectionStatus); // Tenant: check their status for a listing
router.get("/landlord", getLandlordConnections);             // Landlord: see all connection requests
router.patch("/:id/deal-done", dealDone);                   // Landlord: mark deal done → isConnected = true
router.patch("/:id/deal-close", dealClose);                 // Landlord: close deal → status = Rejected

export default router;
