import sql from "mssql";
import { getPool } from "../config/db";
import type { ParsedAddress } from "./googleMaps.service";

export interface CreateListingDto {
  landlordId: string;
  roomDetails: {
    floorLevelId: number;
    maxOccupants: number;
    foodPreferenceId: number;
    allowSmoking: boolean;
    monthlyRent: number;
    furnishingTypeId: number;
    availableFrom: string; 
  };
  location: ParsedAddress & { latitude: number; longitude: number };
}

export class ListingsService {
  /**
   * Helper to generate a standardized title
   */
  private static generateTitle(colony: string, furnishingTypeId: number): string {
    const fnTypeMap: Record<number, string> = {
      1: "Unfurnished",
      2: "Semi-Furnished",
      3: "Fully-Furnished",
    };
    const fnType = fnTypeMap[furnishingTypeId] || "Room";
    return `${fnType} in ${colony}`;
  }

  /**
   * Creates a single Listing
   */
  static async createSingleListing(data: CreateListingDto): Promise<string> {
    const pool = await getPool();
    const title = this.generateTitle(data.location.colony, data.roomDetails.furnishingTypeId);

    const result = await pool.request()
      .input("LandlordId", sql.UniqueIdentifier, data.landlordId)
      .input("Title", sql.NVarChar(200), title)
      .input("FloorLevelId", sql.TinyInt, data.roomDetails.floorLevelId)
      .input("FurnishingTypeId", sql.TinyInt, data.roomDetails.furnishingTypeId)
      .input("MaxOccupants", sql.TinyInt, data.roomDetails.maxOccupants)
      .input("AllowSmoking", sql.Bit, data.roomDetails.allowSmoking)
      .input("FoodPreferenceId", sql.TinyInt, data.roomDetails.foodPreferenceId)
      .input("MonthlyRent", sql.Decimal(10, 2), data.roomDetails.monthlyRent)
      .input("AvailableFrom", sql.Date, data.roomDetails.availableFrom)
      // Location
      .input("AddressLine", sql.NVarChar(300), data.location.addressLine)
      .input("Colony", sql.NVarChar(150), data.location.colony)
      .input("City", sql.NVarChar(100), data.location.city)
      .input("State", sql.NVarChar(100), data.location.state)
      .input("Pincode", sql.Char(6), data.location.pincode)
      .input("Latitude", sql.Decimal(9, 6), data.location.latitude)
      .input("Longitude", sql.Decimal(9, 6), data.location.longitude)
      .query(`
        INSERT INTO dbo.Listings (
          LandlordId, Title, FloorLevelId, FurnishingTypeId, MaxOccupants, AllowSmoking,
          FoodPreferenceId, MonthlyRent, AvailableFrom,
          AddressLine, Colony, City, State, Pincode, Latitude, Longitude
        )
        OUTPUT INSERTED.ListingId
        VALUES (
          @LandlordId, @Title, @FloorLevelId, @FurnishingTypeId, @MaxOccupants, @AllowSmoking,
          @FoodPreferenceId, @MonthlyRent, @AvailableFrom,
          @AddressLine, @Colony, @City, @State, @Pincode, @Latitude, @Longitude
        );
      `);

    return result.recordset[0].ListingId;
  }

  /**
   * Creates multiple Listings in a single transaction
   */
  static async createBulkListings(
    landlordId: string,
    roomsData: CreateListingDto["roomDetails"][],
    location: CreateListingDto["location"]
  ): Promise<string[]> {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    
    await transaction.begin();

    try {
      const listingIds: string[] = [];
      const request = new sql.Request(transaction);

      // We use a parameterized query for each room to ensure safe inserts
      // SQL Server node driver allows loop-based request inputs directly against a transaction
      for (let i = 0; i < roomsData.length; i++) {
        const room = roomsData[i];
        if (!room) continue;
        const title = this.generateTitle(location.colony, room.furnishingTypeId);

        // We must re-instantiate request per query to clear params OR use dynamically named params. 
        // A fresh request object bound to the same transaction is cleaner.
        const iterReq = new sql.Request(transaction);

        iterReq.input("LandlordId", sql.UniqueIdentifier, landlordId);
        iterReq.input("Title", sql.NVarChar(200), title);
        iterReq.input("FloorLevelId", sql.TinyInt, room.floorLevelId);
        iterReq.input("FurnishingTypeId", sql.TinyInt, room.furnishingTypeId);
        iterReq.input("MaxOccupants", sql.TinyInt, room.maxOccupants);
        iterReq.input("AllowSmoking", sql.Bit, room.allowSmoking);
        iterReq.input("FoodPreferenceId", sql.TinyInt, room.foodPreferenceId);
        iterReq.input("MonthlyRent", sql.Decimal(10, 2), room.monthlyRent);
        iterReq.input("AvailableFrom", sql.Date, room.availableFrom);
        
        iterReq.input("AddressLine", sql.NVarChar(300), location.addressLine);
        iterReq.input("Colony", sql.NVarChar(150), location.colony);
        iterReq.input("City", sql.NVarChar(100), location.city);
        iterReq.input("State", sql.NVarChar(100), location.state);
        iterReq.input("Pincode", sql.Char(6), location.pincode);
        iterReq.input("Latitude", sql.Decimal(9, 6), location.latitude);
        iterReq.input("Longitude", sql.Decimal(9, 6), location.longitude);

        const result = await iterReq.query(`
          INSERT INTO dbo.Listings (
            LandlordId, Title, FloorLevelId, FurnishingTypeId, MaxOccupants, AllowSmoking,
            FoodPreferenceId, MonthlyRent, AvailableFrom,
            AddressLine, Colony, City, State, Pincode, Latitude, Longitude
          )
          OUTPUT INSERTED.ListingId
          VALUES (
            @LandlordId, @Title, @FloorLevelId, @FurnishingTypeId, @MaxOccupants, @AllowSmoking,
            @FoodPreferenceId, @MonthlyRent, @AvailableFrom,
            @AddressLine, @Colony, @City, @State, @Pincode, @Latitude, @Longitude
          );
        `);
        
        listingIds.push(result.recordset[0].ListingId);
      }

      await transaction.commit();
      return listingIds;

    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
}
