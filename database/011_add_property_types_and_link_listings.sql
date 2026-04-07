/*
 * ============================================================
 * 011 - Add PropertyTypes and link to Listings
 * ============================================================
 * Creates dbo.PropertyTypes (if missing), seeds:
 *   1 = PG
 *   2 = Individual
 *   3 = Flat
 * Adds nullable Listings.PropertyTypeId and FK.
 * ============================================================
 */

USE [alternative-sql-db-4222389];
GO

IF OBJECT_ID('dbo.PropertyTypes', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.PropertyTypes (
        PropertyTypeId TINYINT NOT NULL IDENTITY(1,1),
        PropertyTypeName VARCHAR(40) NOT NULL,
        CONSTRAINT PK_PropertyTypes PRIMARY KEY CLUSTERED (PropertyTypeId),
        CONSTRAINT UQ_PropertyTypes_Name UNIQUE (PropertyTypeName)
    );
    PRINT 'Created dbo.PropertyTypes';
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.PropertyTypes WHERE PropertyTypeName = 'PG')
BEGIN
    INSERT INTO dbo.PropertyTypes (PropertyTypeName) VALUES ('PG');
END

IF NOT EXISTS (SELECT 1 FROM dbo.PropertyTypes WHERE PropertyTypeName = 'Individual')
BEGIN
    INSERT INTO dbo.PropertyTypes (PropertyTypeName) VALUES ('Individual');
END

IF NOT EXISTS (SELECT 1 FROM dbo.PropertyTypes WHERE PropertyTypeName = 'Flat')
BEGIN
    INSERT INTO dbo.PropertyTypes (PropertyTypeName) VALUES ('Flat');
END
GO

IF COL_LENGTH('dbo.Listings', 'PropertyTypeId') IS NULL
BEGIN
    ALTER TABLE dbo.Listings
    ADD PropertyTypeId TINYINT NULL;
    PRINT 'Added dbo.Listings.PropertyTypeId';
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = 'FK_Listings_PropertyType'
      AND parent_object_id = OBJECT_ID('dbo.Listings')
)
BEGIN
    ALTER TABLE dbo.Listings WITH NOCHECK
    ADD CONSTRAINT FK_Listings_PropertyType
    FOREIGN KEY (PropertyTypeId) REFERENCES dbo.PropertyTypes (PropertyTypeId);
    PRINT 'Added FK_Listings_PropertyType';
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_Listings_PropertyType_Status'
      AND object_id = OBJECT_ID('dbo.Listings')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_Listings_PropertyType_Status
        ON dbo.Listings (PropertyTypeId, StatusId)
        INCLUDE (MonthlyRent, MaxOccupants, City)
        WHERE StatusId = 1;
    PRINT 'Added IX_Listings_PropertyType_Status';
END
GO
