import { Router } from "express";
import {
  createTestimonial,
  getTestimonialsForSubject,
  getMyReview,
} from "../controllers/testimonials.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

// Public read — anyone can see reviews for a user
router.get("/subject/:subjectId", getTestimonialsForSubject);

// Authenticated write
router.post("/", requireAuth, createTestimonial);
router.get("/mine/:subjectId", requireAuth, getMyReview);

export default router;
