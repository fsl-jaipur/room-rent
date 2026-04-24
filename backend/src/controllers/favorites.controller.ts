import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Favorite } from "../models/Favorite.js";
import Listing from "../models/Listing.js";

// POST /api/favorites/:listingId  — toggle favorite on/off
export const toggleFavorite = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = (req as any).user?.id;
    if (!tenantId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    let { listingId } = req.params;
    if (Array.isArray(listingId)) listingId = listingId[0];
    if (!listingId || !mongoose.Types.ObjectId.isValid(listingId)) {
      res.status(400).json({ error: "Invalid listingId" });
      return;
    }

    const existing = await Favorite.findOne({ tenantId, listingId });
    if (existing) {
      await Favorite.deleteOne({ _id: existing._id });
      res.status(200).json({ liked: false });
    } else {
      await Favorite.create({ tenantId, listingId });
      res.status(200).json({ liked: true });
    }
  } catch (error) {
    next(error);
  }
};

// GET /api/favorites/ids  — returns just the listingId strings the user has liked
export const getFavoriteIds = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = (req as any).user?.id;
    if (!tenantId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const favs = await Favorite.find({ tenantId }).select("listingId").lean();
    const ids = favs.map((f) => String(f.listingId));
    res.status(200).json({ ids });
  } catch (error) {
    next(error);
  }
};

// GET /api/favorites  — returns liked listings with id, title, coverPhotoUrl
export const getFavorites = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = (req as any).user?.id;
    if (!tenantId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const favs = await Favorite.find({ tenantId })
      .sort({ createdAt: -1 })
      .lean();

    const listingIds = favs.map((f) => f.listingId);
    const listings = await Listing.find({ _id: { $in: listingIds }, isActive: true })
      .select("_id title photos")
      .lean();

    // Preserve the liked order
    const listingMap = new Map(listings.map((l) => [String(l._id), l]));
    const ordered = listingIds
      .map((id) => listingMap.get(String(id)))
      .filter(Boolean) as typeof listings;

    const items = ordered.map((l) => {
      const cover =
        l.photos?.find((p) => p.photoType === "Exterior") || l.photos?.[0] || null;
      return {
        listingId: String(l._id),
        title: l.title,
        coverPhotoUrl: cover?.photoUrl ?? null,
      };
    });

    res.status(200).json({ items });
  } catch (error) {
    next(error);
  }
};
