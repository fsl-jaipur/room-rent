import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Testimonial } from "../models/Testimonial.js";
import Listing from "../models/Listing.js";
import { ContactRequest } from "../models/ContactRequest.js";

// POST /api/testimonials
// Tenant reviews a landlord (via a listing), or landlord reviews a tenant
export const createTestimonial = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const reviewerId = (req as any).user?.id;
    if (!reviewerId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { subjectId, listingId, rating, body, reviewerRole } = req.body as {
      subjectId?: string;
      listingId?: string;
      rating?: unknown;
      body?: unknown;
      reviewerRole?: unknown;
    };

    if (!subjectId || !mongoose.Types.ObjectId.isValid(subjectId)) {
      res.status(400).json({ error: "Valid subjectId is required" });
      return;
    }
    if (String(reviewerId) === String(subjectId)) {
      res.status(400).json({ error: "You cannot review yourself" });
      return;
    }
    const ratingNum = Number(rating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      res.status(400).json({ error: "Rating must be an integer between 1 and 5" });
      return;
    }
    if (typeof body !== "string" || body.trim().length === 0) {
      res.status(400).json({ error: "Review body is required" });
      return;
    }
    if (body.trim().length > 1000) {
      res.status(400).json({ error: "Review must be 1000 characters or fewer" });
      return;
    }
    if (reviewerRole !== "Tenant" && reviewerRole !== "Landlord") {
      res.status(400).json({ error: "reviewerRole must be 'Tenant' or 'Landlord'" });
      return;
    }

    // If listingId provided, verify it exists and the subject is its landlord (for tenant→landlord reviews)
    let resolvedListingId: mongoose.Types.ObjectId | undefined;
    if (listingId) {
      if (!mongoose.Types.ObjectId.isValid(listingId)) {
        res.status(400).json({ error: "Invalid listingId" });
        return;
      }
      const listing = await Listing.findById(listingId).select("landlordId").lean();
      if (!listing) {
        res.status(404).json({ error: "Listing not found" });
        return;
      }
      resolvedListingId = new mongoose.Types.ObjectId(listingId);
    }

    // Gate: Tenant must have an accepted (isConnected=true) connection for this listing
    if (reviewerRole === "Tenant") {
      if (!resolvedListingId) {
        res.status(400).json({ error: "listingId is required for tenant reviews" });
        return;
      }
      const connection = await ContactRequest.findOne({
        tenantId: new mongoose.Types.ObjectId(reviewerId),
        listingId: resolvedListingId,
        isConnected: true,
      }).lean();
      if (!connection) {
        res.status(403).json({ error: "You must connect with the owner and have your deal confirmed before leaving a review" });
        return;
      }
    }

    // Upsert — update existing or create new
    const testimonial = await Testimonial.findOneAndUpdate(
      {
        reviewerId: new mongoose.Types.ObjectId(reviewerId),
        subjectId: new mongoose.Types.ObjectId(subjectId),
        ...(resolvedListingId ? { listingId: resolvedListingId } : { listingId: { $exists: false } }),
      },
      {
        $set: {
          rating: ratingNum,
          body: body.trim(),
          reviewerRole,
        },
        $setOnInsert: {
          reviewerId: new mongoose.Types.ObjectId(reviewerId),
          subjectId: new mongoose.Types.ObjectId(subjectId),
          ...(resolvedListingId ? { listingId: resolvedListingId } : {}),
        },
      },
      { upsert: true, new: true }
    );

    res.status(201).json({ message: "Review submitted successfully", testimonialId: String(testimonial._id) });
  } catch (error) {
    next(error);
  }
};

// GET /api/testimonials/subject/:subjectId
// Get all reviews for a user (landlord or tenant)
export const getTestimonialsForSubject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let { subjectId } = req.params;
    if (Array.isArray(subjectId)) subjectId = subjectId[0];
    if (!subjectId || !mongoose.Types.ObjectId.isValid(subjectId)) {
      res.status(400).json({ error: "Invalid subjectId" });
      return;
    }

    const testimonials = await Testimonial.find({ subjectId })
      .populate("reviewerId", "fullName photoUrl gender")
      .sort({ createdAt: -1 })
      .lean();

    const items = testimonials.map((t) => {
      const reviewer = t.reviewerId as unknown as {
        _id: unknown;
        fullName?: string;
        photoUrl?: string;
        gender?: string;
      };
      return {
        testimonialId: String(t._id),
        reviewerId: String(reviewer?._id ?? t.reviewerId),
        reviewerName: reviewer?.fullName ?? "Anonymous",
        reviewerPhoto: reviewer?.photoUrl ?? null,
        reviewerGender: reviewer?.gender ?? null,
        listingId: t.listingId ? String(t.listingId) : null,
        rating: t.rating,
        body: t.body,
        reviewerRole: t.reviewerRole,
        createdAt: t.createdAt.toISOString(),
      };
    });

    const avgRating =
      items.length > 0
        ? Math.round((items.reduce((sum, t) => sum + t.rating, 0) / items.length) * 10) / 10
        : null;

    res.status(200).json({ items, avgRating, total: items.length });
  } catch (error) {
    next(error);
  }
};

// GET /api/testimonials/mine/:subjectId — check if current user already reviewed this subject for a listing
export const getMyReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const reviewerId = (req as any).user?.id;
    if (!reviewerId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    let { subjectId } = req.params;
    if (Array.isArray(subjectId)) subjectId = subjectId[0];
    const { listingId } = req.query;

    const filter: Record<string, unknown> = {
      reviewerId: new mongoose.Types.ObjectId(reviewerId),
      subjectId: new mongoose.Types.ObjectId(subjectId),
    };
    if (typeof listingId === "string" && mongoose.Types.ObjectId.isValid(listingId)) {
      filter.listingId = new mongoose.Types.ObjectId(listingId);
    }

    const existing = await Testimonial.findOne(filter).lean();
    if (!existing) {
      res.status(200).json({ review: null });
      return;
    }

    res.status(200).json({
      review: {
        testimonialId: String(existing._id),
        rating: existing.rating,
        body: existing.body,
        reviewerRole: existing.reviewerRole,
      },
    });
  } catch (error) {
    next(error);
  }
};
