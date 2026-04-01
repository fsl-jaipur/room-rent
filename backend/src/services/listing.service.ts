import { PrismaClient } from "@prisma/client";
import type { ListingInput } from "../shared/schema";

const prisma = new PrismaClient();

export async function createListingRecord(landlordId: string, data: ListingInput) {
  return await prisma.listings.create({
    data: {
      ...data,
      LandlordId: landlordId,
      StatusId: 1, // Default Active
      AvailableFrom: new Date(data.AvailableFrom),
    }
  });
}

export async function getListingRecord(listingId: number) {
  return await prisma.listings.findUnique({
    where: { ListingId: listingId },
    include: {
      Photos: true,
      FloorLevel: true,
      FurnishingType: true,
      FoodPreference: true,
      Landlord: {
        select: { FullName: true, Phone: true, Email: true, PhotoUrl: true }
      }
    }
  });
}

export async function getAllListings(filters: any) {
  const whereClause: any = { StatusId: 1 };
  if (filters.City) whereClause.City = { contains: filters.City };
  if (filters.MinRent) whereClause.MonthlyRent = { gte: parseFloat(filters.MinRent) };
  if (filters.MaxRent) whereClause.MonthlyRent = { lte: parseFloat(filters.MaxRent) };

  return await prisma.listings.findMany({
    where: whereClause,
    include: {
      Photos: true,
      FurnishingType: true,
    },
    orderBy: { CreatedAt: 'desc' }
  });
}
