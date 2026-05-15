import { Router } from "express";
import { toggleFavorite, getFavorites } from "../controllers/favorites.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.use(requireAuth);

router.get("/", getFavorites);
router.post("/:listingId", toggleFavorite);

export default router;
