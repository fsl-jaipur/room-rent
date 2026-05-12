import { Router } from "express";
import { submitRating, getUserRatings, getMyRating } from "../controllers/ratings.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", requireAuth, submitRating);
router.get("/user/:userId", getUserRatings);
router.get("/my-rating/:connectionId/:type", requireAuth, getMyRating);

export default router;
