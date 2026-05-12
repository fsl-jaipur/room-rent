import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Rating } from "../models/Rating.js";
import { ContactRequest } from "../models/ContactRequest.js";
import User from "../models/User.js";

// Recomputes landlordRatingScore on target user after a new rating
async function recomputeLandlordScore(targetUserId: mongoose.Types.ObjectId) {
  const [agg] = await Rating.aggregate([
    { $match: { targetUserId, type: "landlord" } },
    { $group: { _id: null, avg: { $avg: "$score" }, count: { $sum: 1 } } },
  ]);
  if (agg) {
    await User.updateOne(
      { _id: targetUserId },
      {
        landlordRatingScore: Math.round(agg.avg * 10) / 10,
        landlordRatingCount: agg.count,
      }
    );
  }
}

// Recomputes tenantRatingScore on target user after a new rating
async function recomputeTenantScore(targetUserId: mongoose.Types.ObjectId) {
  const [agg] = await Rating.aggregate([
    { $match: { targetUserId, type: "tenant" } },
    { $group: { _id: null, avg: { $avg: "$score" }, count: { $sum: 1 } } },
  ]);
  if (agg) {
    await User.updateOne(
      { _id: targetUserId },
      {
        tenantRatingScore: Math.round(agg.avg * 10) / 10,
        tenantRatingCount: agg.count,
      }
    );
  }
}

// POST /api/ratings
// Tenant rates landlord OR landlord rates tenant — only after deal is confirmed
export const submitRating = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const raterId = (req as any).user?.id;
    if (!raterId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { connectionId, score, type, category, comment } = req.body as {
      connectionId?: string;
      score?: number;
      type?: string;
      category?: string;
      comment?: string;
    };

    if (!connectionId || !mongoose.Types.ObjectId.isValid(connectionId)) {
      res.status(400).json({ error: "Valid connectionId is required" });
      return;
    }

    const parsedScore = Number(score);
    if (!Number.isInteger(parsedScore) || parsedScore < 1 || parsedScore > 5) {
      res.status(400).json({ error: "score must be an integer between 1 and 5" });
      return;
    }

    if (type !== "landlord" && type !== "tenant") {
      res.status(400).json({ error: "type must be 'landlord' or 'tenant'" });
      return;
    }

    const connection = await ContactRequest.findById(connectionId).lean();
    if (!connection) {
      res.status(404).json({ error: "Connection not found" });
      return;
    }

    if (!connection.isConnected) {
      res.status(400).json({ error: "Ratings can only be submitted after the deal is confirmed" });
      return;
    }

    const raterStr = String(raterId);
    const tenantStr = String(connection.tenantId);
    const landlordStr = String(connection.landlordId);

    // Validate who can rate whom
    if (type === "landlord") {
      // Tenant rates the landlord
      if (raterStr !== tenantStr) {
        res.status(403).json({ error: "Only the tenant can rate the landlord for this connection" });
        return;
      }
    } else {
      // Landlord rates the tenant
      if (raterStr !== landlordStr) {
        res.status(403).json({ error: "Only the landlord can rate the tenant for this connection" });
        return;
      }
    }

    const targetUserId =
      type === "landlord"
        ? new mongoose.Types.ObjectId(landlordStr)
        : new mongoose.Types.ObjectId(tenantStr);

    // Upsert — allow updating an existing rating
    const existing = await Rating.findOne({
      connectionId: new mongoose.Types.ObjectId(connectionId),
      type,
    });

    if (existing) {
      existing.score = parsedScore;
      if (category !== undefined) existing.category = category;
      if (comment !== undefined) existing.comment = comment;
      await existing.save();
    } else {
      await Rating.create({
        targetUserId,
        ratedByUserId: new mongoose.Types.ObjectId(raterId),
        connectionId: new mongoose.Types.ObjectId(connectionId),
        type,
        score: parsedScore,
        category: category ?? undefined,
        comment: comment ?? undefined,
      });
    }

    // Recompute the score on the target user
    if (type === "landlord") {
      await recomputeLandlordScore(targetUserId);
    } else {
      await recomputeTenantScore(targetUserId);
    }

    res.status(200).json({ message: "Rating submitted", score: parsedScore });
  } catch (error) {
    next(error);
  }
};

// GET /api/ratings/user/:userId
// Returns all ratings for a user (for display)
export const getUserRatings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let { userId } = req.params;
    if (Array.isArray(userId)) userId = userId[0];
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ error: "Invalid userId" });
      return;
    }

    const type = req.query.type as string | undefined;
    const query: Record<string, unknown> = {
      targetUserId: new mongoose.Types.ObjectId(userId),
    };
    if (type === "landlord" || type === "tenant") query.type = type;

    const ratings = await Rating.find(query)
      .populate("ratedByUserId", "fullName photoUrl")
      .sort({ createdAt: -1 })
      .lean();

    const items = ratings.map((r) => {
      const rater = r.ratedByUserId as unknown as { _id: unknown; fullName?: string; photoUrl?: string };
      return {
        ratingId: String(r._id),
        score: r.score,
        type: r.type,
        category: r.category ?? null,
        comment: r.comment ?? null,
        raterName: rater?.fullName ?? "Anonymous",
        raterPhoto: rater?.photoUrl ?? null,
        createdAt: r.createdAt.toISOString(),
      };
    });

    res.status(200).json({ items });
  } catch (error) {
    next(error);
  }
};

// GET /api/ratings/my-rating/:connectionId/:type
// Check if the current user has already rated this connection
export const getMyRating = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const raterId = (req as any).user?.id;
    if (!raterId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    let { connectionId, type } = req.params;
    if (Array.isArray(connectionId)) connectionId = connectionId[0];
    if (!connectionId || !mongoose.Types.ObjectId.isValid(connectionId)) {
      res.status(400).json({ error: "Invalid connectionId" });
      return;
    }

    const existing = await Rating.findOne({
      connectionId: new mongoose.Types.ObjectId(connectionId),
      ratedByUserId: new mongoose.Types.ObjectId(raterId),
      type,
    }).lean();

    res.status(200).json({
      rating: existing
        ? { score: existing.score, category: existing.category ?? null, comment: existing.comment ?? null }
        : null,
    });
  } catch (error) {
    next(error);
  }
};

export { recomputeTenantScore };
