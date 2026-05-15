import { Router } from "express";
import {
  register,
  login,
  password,
  googleLogin,
  logout,
  checkToken,
  verifyEmail,
  resendVerificationEmail,
} from "../controllers/auth.controller.js";
import {
  createProfile,
  getProfile,
  updateProfile,
} from "../controllers/profile.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);
router.post("/login", login);
router.post("/password", password);
router.post("/google", googleLogin);
router.post("/logout", logout);
router.get("/check-token", requireAuth, checkToken);
router.get("/profile", requireAuth, getProfile);
router.post("/profile", requireAuth, createProfile);
router.patch("/profile-update", requireAuth, updateProfile);

export default router;
