import { PrismaClient } from "@prisma/client";

import { getRequiredSetting } from "../config/settings";
import type { PropertyInput, UserInput } from "../shared/schema";

let prisma: PrismaClient | null = null;

type PrismaErrorWithCode = {
  code?: string;
};

function isPrismaErrorWithCode(error: unknown): error is PrismaErrorWithCode {
  return typeof error === "object" && error !== null && "code" in error;
}

export class DuplicateUserError extends Error {
  readonly statusCode = 409;

  constructor(conflicts?: string[]) {
    const conflictFields = conflicts && conflicts.length > 0 ? conflicts.join(", ") : "unique fields";
    super(`User already exists with the same ${conflictFields}.`);
    this.name = "DuplicateUserError";
  }
}

export class UserNotFoundError extends Error {
  readonly statusCode = 404;

  constructor(userId: string) {
    super(`User not found for userId: ${userId}`);
    this.name = "UserNotFoundError";
  }
}

export class PropertyNotFoundError extends Error {
  readonly statusCode = 404;

  constructor(propertyId: string) {
    super(`Property not found for propertyId: ${propertyId}`);
    this.name = "PropertyNotFoundError";
  }
}

function getDbClient() {
  const configuredDatabaseUrl = getRequiredSetting("DATABASE_URL");
  process.env.DATABASE_URL = configuredDatabaseUrl;

  if (!prisma) {
    prisma = new PrismaClient();
  }

  return prisma;
}

function getConflictFields(
  existing: { Email: string; Phone: string },
  user: Pick<UserInput, "Email" | "Phone">
) {
  const conflicts: string[] = [];

  if (existing.Email === user.Email) conflicts.push("Email");
  if (existing.Phone === user.Phone) conflicts.push("Phone");

  return conflicts;
}

export async function pingDb() {
  const db = getDbClient();
  return db.$queryRaw`SELECT 1 AS ok`;
}

export async function getUserById(userId: string) {
  const db = getDbClient();

  const user = await db.users.findUnique({
    where: { UserId: userId },
    select: {
      UserId: true,
      Role: true,
      FullName: true,
      Email: true,
      Phone: true,
      City: true,
      State: true,
      Pincode: true,
      PhotoUrl: true,
      IsVerified: true,
      IsActive: true,
      CreatedAt: true,
      UpdatedAt: true
    }
  });

  if (!user) {
    throw new UserNotFoundError(userId);
  }

  return user;
}

export async function saveUser(user: UserInput) {
  const db = getDbClient();

  const existing = await db.users.findFirst({
    where: {
      OR: [{ Email: user.Email }, { Phone: user.Phone }]
    },
    select: { Email: true, Phone: true }
  });

  if (existing) {
    throw new DuplicateUserError(getConflictFields(existing, user));
  }

  try {
    await db.users.create({
      data: {
        Role: user.Role,
        FullName: user.FullName,
        Email: user.Email,
        Phone: user.Phone,
        PasswordHash: user.PasswordHash,
        City: user.City ?? null,
        State: user.State ?? null,
        Pincode: user.Pincode ?? null,
        IsActive: true
      }
    });
  } catch (error) {
    if (isPrismaErrorWithCode(error) && error.code === "P2002") {
      throw new DuplicateUserError(["Email or Phone"]);
    }

    throw error;
  }
}

export async function updateUser(userId: string, user: UserInput) {
  const db = getDbClient();

  const existingUser = await db.users.findUnique({
    where: { UserId: userId },
    select: { UserId: true }
  });

  if (!existingUser) {
    throw new UserNotFoundError(userId);
  }

  const conflictingUser = await db.users.findFirst({
    where: {
      UserId: { not: userId },
      OR: [{ Email: user.Email }, { Phone: user.Phone }]
    },
    select: { Email: true, Phone: true }
  });

  if (conflictingUser) {
    throw new DuplicateUserError(getConflictFields(conflictingUser, user));
  }

  try {
    await db.users.update({
      where: { UserId: userId },
      data: {
        Role: user.Role,
        FullName: user.FullName,
        Email: user.Email,
        Phone: user.Phone,
        PasswordHash: user.PasswordHash,
        City: user.City ?? null,
        State: user.State ?? null,
        Pincode: user.Pincode ?? null,
        IsActive: true
      }
    });
  } catch (error) {
    if (isPrismaErrorWithCode(error)) {
      if (error.code === "P2002") {
        throw new DuplicateUserError(["Email or Phone"]);
      }

      if (error.code === "P2025") {
        throw new UserNotFoundError(userId);
      }
    }

    throw error;
  }
}

type PropertyRecord = {
  id: string;
  userId: string;
  propertyName: string;
  address: string;
  latitude: number;
  longitude: number;
  isActive: boolean | null;
  createdAt: Date | null;
};

type PropertyLookupOption = {
  id: number;
  name: string;
  isActive: boolean | null;
};

export type PropertyMeta = {
  propertyTypes: PropertyLookupOption[];
  roomLocations: PropertyLookupOption[];
  coolingTypes: PropertyLookupOption[];
  interiorTypes: PropertyLookupOption[];
  foodPreferences: PropertyLookupOption[];
  smokingPreferences: PropertyLookupOption[];
};

export async function getPropertyMeta() {
  const db = getDbClient();

  const [propertyTypes, roomLocations, coolingTypes, interiorTypes, foodPreferences, smokingPreferences] = await Promise.all([
    db.$queryRaw<PropertyLookupOption[]>`SELECT [Id] as id, [PropertyName] as name, [IsActive] as isActive FROM [dbo].[PropertyTypes] WHERE [IsActive] = 1 ORDER BY [PropertyName]`,
    db.$queryRaw<PropertyLookupOption[]>`SELECT [Id] as id, [Name] as name, [IsActive] as isActive FROM [dbo].[RoomLocation] WHERE [IsActive] = 1 ORDER BY [Name]`,
    db.$queryRaw<PropertyLookupOption[]>`SELECT [Id] as id, [Name] as name, [IsActive] as isActive FROM [dbo].[CoolingType] WHERE [IsActive] = 1 ORDER BY [Name]`,
    db.$queryRaw<PropertyLookupOption[]>`SELECT [Id] as id, [Name] as name, [IsActive] as isActive FROM [dbo].[InteriorType] WHERE [IsActive] = 1 ORDER BY [Name]`,
    db.$queryRaw<PropertyLookupOption[]>`SELECT [Id] as id, [Name] as name, [IsActive] as isActive FROM [dbo].[FoodPreference] WHERE [IsActive] = 1 ORDER BY [Name]`,
    db.$queryRaw<PropertyLookupOption[]>`SELECT [Id] as id, [Name] as name, [IsActive] as isActive FROM [dbo].[SmokingPreference] WHERE [IsActive] = 1 ORDER BY [Name]`
  ]);

  return {
    propertyTypes,
    roomLocations,
    coolingTypes,
    interiorTypes,
    foodPreferences,
    smokingPreferences
  } as PropertyMeta;
}

export async function createProperty(property: PropertyInput) {
  const db = getDbClient();

  await db.$transaction(async (tx: any) => {
    const insertedPropertyRows = await tx.$queryRaw<Array<{ id: number }>>`
      INSERT INTO [dbo].[Properties] ([UserId], [PropertyName], [Address], [Latitude], [Longitude], [IsActive], [CreatedAt])
      OUTPUT INSERTED.[Id] as id
      VALUES (${property.userId}, ${property.propertyName}, ${property.address}, ${property.latitude}, ${property.longitude}, 1, GETUTCDATE())
    `;

    const propertyId = insertedPropertyRows[0]?.id;

    if (!propertyId) {
      throw new Error("Failed to create property record");
    }

    const insertedRoomRows = await tx.$queryRaw<Array<{ id: number }>>`
      INSERT INTO [dbo].[PropertyRooms]
      ([PropertyId], [TypeId], [RoomLocationId], [CoolingId], [Balcony], [AttachedWashroom], [InteriorId], [FoodPreferenceId], [SmokingPreferenceId], [Price], [IsActive], [CreatedAt])
      OUTPUT INSERTED.[Id] as id
      VALUES
      (
        ${propertyId},
        ${property.room.typeId},
        ${property.room.roomLocationId},
        ${property.room.coolingId},
        ${property.room.balcony ? 1 : 0},
        ${property.room.attachedWashroom ? 1 : 0},
        ${property.room.interiorId},
        ${property.room.foodPreferenceId},
        ${property.room.smokingPreferenceId},
        ${property.room.price},
        1,
        GETUTCDATE()
      )
    `;

    const roomId = insertedRoomRows[0]?.id;

    if (!roomId) {
      throw new Error("Failed to create property room record");
    }

    for (let index = 0; index < property.images.length; index += 1) {
      const imageUrl = property.images[index];
      await tx.$executeRaw`
        INSERT INTO [dbo].[PropertyImages] ([PropertyId], [RoomId], [ImageUrl], [IsPrimary], [CreatedAt])
        VALUES (${propertyId}, ${roomId}, ${imageUrl}, ${index === 0 ? 1 : 0}, GETUTCDATE())
      `;
    }
  });
}

export async function listProperties(userId?: string) {
  const db = getDbClient();

  if (userId) {
    return db.$queryRaw<PropertyRecord[]>`
      SELECT
        [Id] AS id,
        [UserId] AS userId,
        [PropertyName] AS propertyName,
        [Address] AS address,
        [Latitude] AS latitude,
        [Longitude] AS longitude,
        [IsActive] AS isActive,
        [CreatedAt] AS createdAt
      FROM [dbo].[Properties]
      WHERE [IsActive] = 1 AND [UserId] = ${userId}
      ORDER BY [CreatedAt] DESC
    `;
  }

  return db.$queryRaw<PropertyRecord[]>`
    SELECT
      [Id] AS id,
      [UserId] AS userId,
      [PropertyName] AS propertyName,
      [Address] AS address,
      [Latitude] AS latitude,
      [Longitude] AS longitude,
      [IsActive] AS isActive,
      [CreatedAt] AS createdAt
    FROM [dbo].[Properties]
    WHERE [IsActive] = 1
    ORDER BY [CreatedAt] DESC
  `;
}

export async function getPropertyById(propertyId: string) {
  const db = getDbClient();

  const rows = await db.$queryRaw<PropertyRecord[]>`
    SELECT
      [Id] AS id,
      [UserId] AS userId,
      [PropertyName] AS propertyName,
      [Address] AS address,
      [Latitude] AS latitude,
      [Longitude] AS longitude,
      [IsActive] AS isActive,
      [CreatedAt] AS createdAt
    FROM [dbo].[Properties]
    WHERE [Id] = ${propertyId} AND [IsActive] = 1
  `;

  const property = rows[0];

  if (!property) {
    throw new PropertyNotFoundError(propertyId);
  }

  return property;
}

export async function editProperty(propertyId: string, property: PropertyInput) {
  const db = getDbClient();

  const affectedRows = await db.$executeRaw`
    UPDATE [dbo].[Properties]
    SET
      [UserId] = ${property.userId},
      [PropertyName] = ${property.propertyName},
      [Address] = ${property.address},
      [Latitude] = ${property.latitude},
      [Longitude] = ${property.longitude},
      [IsActive] = 1
    WHERE [Id] = ${propertyId} AND [IsActive] = 1
  `;

  if (affectedRows === 0) {
    throw new PropertyNotFoundError(propertyId);
  }
}

export async function softDeleteProperty(propertyId: string) {
  const db = getDbClient();

  const affectedRows = await db.$executeRaw`
    UPDATE [dbo].[Properties]
    SET [IsActive] = 0
    WHERE [Id] = ${propertyId} AND [IsActive] = 1
  `;

  if (affectedRows === 0) {
    throw new PropertyNotFoundError(propertyId);
  }
}
