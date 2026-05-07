import { Router } from "express";
import { toggleFavorite, getFavoriteIds, getFavorites } from "../controllers/favorites.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.use(requireAuth);

router.get("/", getFavorites);
router.get("/ids", getFavoriteIds);
router.post("/:listingId", toggleFavorite);

export default router;
