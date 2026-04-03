import { Router } from "express";
import { register, login, logout } from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", requireAuth, (req, res) => {
  res.status(200).json({ user: (req as any).user });
});

export default router;
