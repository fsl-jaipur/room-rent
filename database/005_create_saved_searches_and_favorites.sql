/*
 * ============================================================
 *  005 — Supporting Tables
 *        • Favorites       — tenants bookmark listings
 *        • SavedSearches   — tenants save filter combos
 *        • ContactRequests — tenant → landlord interest log
 * ============================================================
 *
 *  Run order: 001 → 002 → 003 → 004 → 005
 * ============================================================
 */

USE [alternative-sql-db-4222389];
GO

-- ══════════════════════════════════════════════════════════════
--  Favorites (bookmarked listings)
-- ══════════════════════════════════════════════════════════════
IF OBJECT_ID('dbo.Favorites', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Favorites (
        FavoriteId    UNIQUEIDENTIFIER  NOT NULL  DEFAULT NEWSEQUENTIALID(),
        TenantId      UNIQUEIDENTIFIER  NOT NULL,
        ListingId     UNIQUEIDENTIFIER  NOT NULL,
        CreatedAt     DATETIME2(3)      NOT NULL  DEFAULT SYSUTCDATETIME(),

        CONSTRAINT PK_Favorites PRIMARY KEY CLUSTERED (FavoriteId),

        CONSTRAINT FK_Favorites_Tenant
            FOREIGN KEY (TenantId)  REFERENCES dbo.Users (UserId),
        CONSTRAINT FK_Favorites_Listing
            FOREIGN KEY (ListingId) REFERENCES dbo.Listings (ListingId),

        CONSTRAINT UQ_Favorites_Tenant_Listing UNIQUE (TenantId, ListingId)
    );

    /* Tenant's saved list, newest first */
    CREATE NONCLUSTERED INDEX IX_Favorites_TenantId
        ON dbo.Favorites (TenantId, CreatedAt DESC)
        INCLUDE (ListingId);

    PRINT '✅  005a — Favorites table created.';
END
GO

-- ══════════════════════════════════════════════════════════════
--  Saved Searches
-- ══════════════════════════════════════════════════════════════
IF OBJECT_ID('dbo.SavedSearches', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.SavedSearches (
        SearchId            UNIQUEIDENTIFIER  NOT NULL  DEFAULT NEWSEQUENTIALID(),
        TenantId            UNIQUEIDENTIFIER  NOT NULL,
        SearchName          NVARCHAR(100)     NULL,

        -- Filter criteria (nullable = "any")
        Colony              NVARCHAR(150)     NULL,
        MinRent             DECIMAL(10,2)     NULL,
        MaxRent             DECIMAL(10,2)     NULL,
        MaxOccupants        TINYINT           NULL,
        FloorLevelId        TINYINT           NULL,
        FurnishingTypeId    TINYINT           NULL,
        AllowSmoking        BIT               NULL,
        FoodPreferenceId    TINYINT           NULL,
        RadiusKm            DECIMAL(5,2)      NULL,   -- e.g. 5.00
        CenterLatitude      DECIMAL(9,6)      NULL,
        CenterLongitude     DECIMAL(9,6)      NULL,

        CreatedAt           DATETIME2(3)      NOT NULL  DEFAULT SYSUTCDATETIME(),

        CONSTRAINT PK_SavedSearches PRIMARY KEY CLUSTERED (SearchId),
        CONSTRAINT FK_SavedSearches_Tenant
            FOREIGN KEY (TenantId) REFERENCES dbo.Users (UserId)
    );

    CREATE NONCLUSTERED INDEX IX_SavedSearches_TenantId
        ON dbo.SavedSearches (TenantId);

    PRINT '✅  005b — SavedSearches table created.';
END
GO

-- ══════════════════════════════════════════════════════════════
--  Contact Requests (tenant shows interest in a listing)
-- ══════════════════════════════════════════════════════════════
IF OBJECT_ID('dbo.ContactRequests', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ContactRequests (
        RequestId       UNIQUEIDENTIFIER  NOT NULL  DEFAULT NEWSEQUENTIALID(),
        TenantId        UNIQUEIDENTIFIER  NOT NULL,
        ListingId       UNIQUEIDENTIFIER  NOT NULL,
        LandlordId      UNIQUEIDENTIFIER  NOT NULL,
        Message         NVARCHAR(1000)    NULL,
        Status          VARCHAR(15)       NOT NULL  DEFAULT 'Pending',  -- Pending | Accepted | Rejected
        CreatedAt       DATETIME2(3)      NOT NULL  DEFAULT SYSUTCDATETIME(),
        RespondedAt     DATETIME2(3)      NULL,

        CONSTRAINT PK_ContactRequests PRIMARY KEY CLUSTERED (RequestId),

        CONSTRAINT FK_ContactRequests_Tenant
            FOREIGN KEY (TenantId)   REFERENCES dbo.Users (UserId),
        CONSTRAINT FK_ContactRequests_Listing
            FOREIGN KEY (ListingId)  REFERENCES dbo.Listings (ListingId),
        CONSTRAINT FK_ContactRequests_Landlord
            FOREIGN KEY (LandlordId) REFERENCES dbo.Users (UserId),

        CONSTRAINT CK_ContactRequests_Status
            CHECK (Status IN ('Pending', 'Accepted', 'Rejected'))
    );

    /* Landlord dashboard: incoming requests */
    CREATE NONCLUSTERED INDEX IX_ContactRequests_LandlordId
        ON dbo.ContactRequests (LandlordId, Status)
        INCLUDE (TenantId, ListingId, CreatedAt);

    /* Tenant: my sent requests */
    CREATE NONCLUSTERED INDEX IX_ContactRequests_TenantId
        ON dbo.ContactRequests (TenantId, CreatedAt DESC)
        INCLUDE (ListingId, Status);

    /* Prevent duplicate requests for same listing */
    CREATE UNIQUE NONCLUSTERED INDEX UX_ContactRequests_TenantListing
        ON dbo.ContactRequests (TenantId, ListingId)
        WHERE Status = 'Pending';

    PRINT '✅  005c — ContactRequests table created.';
END
GO
