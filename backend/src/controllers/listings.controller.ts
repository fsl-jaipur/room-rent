import type { Request, Response, NextFunction } from "express";
import { GoogleMapsService } from "../services/googleMaps.service";
import { ListingsService } from "../services/listings.service";

export const createSingleListing = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Assuming authentication middleware puts landlord info on req.user.
    // For now we mock the landlordId if it's missing, since OTP is bypassed.
    const landlordId = (req as any).user?.id || req.body.landlordId;
    if (!landlordId) {
      res.status(401).json({ error: "Unauthorized / Missing LandlordId" });
      return;
    }

    const { location: coords, room } = req.body;

    if (!coords || !coords.latitude || !coords.longitude) {
      res.status(400).json({ error: "Location coordinates are required" });
      return;
    }
    if (!room) {
      res.status(400).json({ error: "Room details are required" });
      return;
    }

    // 1. Reverse Geocode
    const parsedAddress = await GoogleMapsService.reverseGeocode(
      coords.latitude,
      coords.longitude
    );

    const fullLocation = {
      ...parsedAddress,
      latitude: coords.latitude,
      longitude: coords.longitude,
    };

    // 2. Create Listing
    const payload = {
      landlordId,
      roomDetails: room,
      location: fullLocation,
    };

    const listingId = await ListingsService.createSingleListing(payload);

    res.status(201).json({
      message: "Listing created successfully",
      listingId,
    });
  } catch (error) {
    next(error);
  }
};

export const createBulkListings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const landlordId = (req as any).user?.id || req.body.landlordId;
    if (!landlordId) {
      res.status(401).json({ error: "Unauthorized / Missing LandlordId" });
      return;
    }

    const { location: coords, rooms } = req.body;

    if (!coords || !coords.latitude || !coords.longitude) {
      res.status(400).json({ error: "Location coordinates are required" });
      return;
    }
    if (!rooms || !Array.isArray(rooms) || rooms.length === 0) {
      res.status(400).json({ error: "An array of room details is required" });
      return;
    }

    // 1. Reverse Geocode (Only once for all rooms)
    const parsedAddress = await GoogleMapsService.reverseGeocode(
      coords.latitude,
      coords.longitude
    );

    const fullLocation = {
      ...parsedAddress,
      latitude: coords.latitude,
      longitude: coords.longitude,
    };

    // 2. Bulk Insert array
    const listingIds = await ListingsService.createBulkListings(
      landlordId,
      rooms,
      fullLocation
    );

    res.status(201).json({
      message: `${listingIds.length} listings created successfully`,
      listingIds,
    });
  } catch (error) {
    next(error);
  }
};
