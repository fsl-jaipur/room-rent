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
      .select("_id title photos colony city state pincode monthlyRent furnishingType coolingType roomFor maxOccupants status")
      .lean();

    // Preserve the liked order
    const listingMap = new Map(listings.map((l) => [String(l._id), l]));
    const ordered = listingIds
      .map((id) => listingMap.get(String(id)))
      .filter(Boolean) as typeof listings;

    const favorites = ordered.map((l) => {
      const cover = l.photos?.find((p) => p.photoType === "Room") || l.photos?.[0] || null;
      return {
        _id: String(l._id),
        listingId: {
          _id: String(l._id),
          title: l.title,
          colony: l.colony,
          city: l.city,
          state: l.state,
          pincode: l.pincode,
          monthlyRent: l.monthlyRent,
          furnishingType: l.furnishingType,
          coolingType: l.coolingType ?? null,
          roomFor: l.roomFor ?? null,
          maxOccupants: l.maxOccupants,
          status: l.status,
          photos: l.photos ?? [],
          coverPhotoUrl: cover?.photoUrl ?? null,
        },
        tenantId: String(tenantId),
      };
    });

    res.status(200).json({ favorites });
  } catch (error) {
    next(error);
  }
};
