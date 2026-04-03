/*
 * ============================================================
 *  001 — Lookup / Enum Tables
 * ============================================================
 *  These small, read-mostly tables replace magic strings and
 *  keep FK columns narrow (TINYINT = 1 byte).
 *
 *  Run order: 001 → 002 → 003 → 004 → 005
 * ============================================================
 */

USE [alternative-sql-db-4222389];          -- change to your actual DB name
GO

-- ──────────────────────────────────────────────
--  Floor levels
-- ──────────────────────────────────────────────
IF OBJECT_ID('dbo.FloorLevels', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.FloorLevels (
        FloorLevelId   TINYINT       NOT NULL  IDENTITY(1,1),
        FloorName      VARCHAR(20)   NOT NULL,

        CONSTRAINT PK_FloorLevels PRIMARY KEY CLUSTERED (FloorLevelId),
        CONSTRAINT UQ_FloorLevels_Name UNIQUE (FloorName)
    );

    INSERT INTO dbo.FloorLevels (FloorName)
    VALUES ('Ground Floor'), ('First Floor'), ('Second Floor'), ('Third Floor'), ('Roof');
END
GO

-- ──────────────────────────────────────────────
--  Furnishing types
-- ──────────────────────────────────────────────
IF OBJECT_ID('dbo.FurnishingTypes', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.FurnishingTypes (
        FurnishingTypeId  TINYINT       NOT NULL  IDENTITY(1,1),
        FurnishingName    VARCHAR(20)   NOT NULL,

        CONSTRAINT PK_FurnishingTypes PRIMARY KEY CLUSTERED (FurnishingTypeId),
        CONSTRAINT UQ_FurnishingTypes_Name UNIQUE (FurnishingName)
    );

    INSERT INTO dbo.FurnishingTypes (FurnishingName)
    VALUES ('Unfurnished'), ('Semi-Furnished'), ('Fully Furnished');
END
GO

-- ──────────────────────────────────────────────
--  Food preferences
-- ──────────────────────────────────────────────
IF OBJECT_ID('dbo.FoodPreferences', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.FoodPreferences (
        FoodPreferenceId  TINYINT       NOT NULL  IDENTITY(1,1),
        PreferenceName    VARCHAR(20)   NOT NULL,

        CONSTRAINT PK_FoodPreferences PRIMARY KEY CLUSTERED (FoodPreferenceId),
        CONSTRAINT UQ_FoodPreferences_Name UNIQUE (PreferenceName)
    );

    INSERT INTO dbo.FoodPreferences (PreferenceName)
    VALUES ('Veg Only'), ('Non-Veg Allowed'), ('No Restriction');
END
GO

-- ──────────────────────────────────────────────
--  Listing statuses
-- ──────────────────────────────────────────────
IF OBJECT_ID('dbo.ListingStatuses', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ListingStatuses (
        StatusId    TINYINT       NOT NULL  IDENTITY(1,1),
        StatusName  VARCHAR(20)   NOT NULL,

        CONSTRAINT PK_ListingStatuses PRIMARY KEY CLUSTERED (StatusId),
        CONSTRAINT UQ_ListingStatuses_Name UNIQUE (StatusName)
    );

    INSERT INTO dbo.ListingStatuses (StatusName)
    VALUES ('Active'), ('Paused'), ('Rented'), ('Expired'), ('Deleted');
END
GO

PRINT '✅  001 — Lookup tables created and seeded.';
GO
