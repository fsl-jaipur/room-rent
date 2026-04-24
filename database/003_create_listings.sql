/*
 * ============================================================
 *  003 — Listings (Room-for-Rent Posts)
 * ============================================================
 *  One listing = one room (or unit) offered by a landlord.
 *
 *  Design highlights
 *  ─────────────────
 *  • Colony stored as NVARCHAR + indexed for exact / LIKE search.
 *  • Location (GEOGRAPHY) enables STDistance radius queries.
 *  • MonthlyRent is DECIMAL for accurate currency math.
 *  • AvailableFrom indexed for "available now" filters.
 *  • Composite indexes cover the 5 primary search paths.
 *
 *  Run order: 001 → 002 → 003 → 004 → 005
 * ============================================================
 */

USE [alternative-sql-db-4222389];
GO

IF OBJECT_ID('dbo.Listings', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Listings (
        ListingId           UNIQUEIDENTIFIER  NOT NULL  DEFAULT NEWSEQUENTIALID(),
        LandlordId          UNIQUEIDENTIFIER  NOT NULL,

        -- Room details
        Title               NVARCHAR(200)     NOT NULL,
        Description         NVARCHAR(2000)    NULL,
        FloorLevelId        TINYINT           NOT NULL,
        FurnishingTypeId    TINYINT           NOT NULL,
        MaxOccupants        TINYINT           NOT NULL,     -- 1, 2, 3, or 4
        AllowSmoking        BIT               NOT NULL  DEFAULT 0,
        FoodPreferenceId    TINYINT           NOT NULL,

        -- Pricing
        MonthlyRent         DECIMAL(10,2)     NOT NULL,
        SecurityDeposit     DECIMAL(10,2)     NULL,

        -- Availability
        AvailableFrom       DATE              NOT NULL,

        -- Location / Address
        AddressLine         NVARCHAR(300)     NOT NULL,
        Colony              NVARCHAR(150)     NOT NULL,     -- primary search field
        City                NVARCHAR(100)     NOT NULL  DEFAULT 'Jaipur',
        State               NVARCHAR(100)     NOT NULL  DEFAULT 'Rajasthan',
        Pincode             CHAR(6)           NOT NULL,
        Latitude            DECIMAL(9,6)      NOT NULL,
        Longitude           DECIMAL(9,6)      NOT NULL,
        Location            AS GEOGRAPHY::Point(Latitude, Longitude, 4326)  PERSISTED,

        -- Status
        StatusId            TINYINT           NOT NULL  DEFAULT 1,  -- 1 = Active

        -- Audit
        CreatedAt           DATETIME2(3)      NOT NULL  DEFAULT SYSUTCDATETIME(),
        UpdatedAt           DATETIME2(3)      NOT NULL  DEFAULT SYSUTCDATETIME(),

        -- ── Primary key ──
        CONSTRAINT PK_Listings PRIMARY KEY CLUSTERED (ListingId),

        -- ── Foreign keys ──
        CONSTRAINT FK_Listings_Landlord
            FOREIGN KEY (LandlordId)       REFERENCES dbo.Users (UserId),
        CONSTRAINT FK_Listings_FloorLevel
            FOREIGN KEY (FloorLevelId)     REFERENCES dbo.FloorLevels (FloorLevelId),
        CONSTRAINT FK_Listings_Furnishing
            FOREIGN KEY (FurnishingTypeId) REFERENCES dbo.FurnishingTypes (FurnishingTypeId),
        CONSTRAINT FK_Listings_FoodPref
            FOREIGN KEY (FoodPreferenceId) REFERENCES dbo.FoodPreferences (FoodPreferenceId),
        CONSTRAINT FK_Listings_Status
            FOREIGN KEY (StatusId)         REFERENCES dbo.ListingStatuses (StatusId),

        -- ── Check constraints ──
        CONSTRAINT CK_Listings_MaxOccupants CHECK (MaxOccupants BETWEEN 1 AND 4),
        CONSTRAINT CK_Listings_MonthlyRent  CHECK (MonthlyRent > 0),
        CONSTRAINT CK_Listings_Latitude     CHECK (Latitude  BETWEEN -90 AND 90),
        CONSTRAINT CK_Listings_Longitude    CHECK (Longitude BETWEEN -180 AND 180)
    );

    /* ══════════════════════════════════════════════════════════
       INDEXES — tuned for the search patterns you described
       ══════════════════════════════════════════════════════════ */

    /* 1️⃣  Index on CreatedAt — newest listings first, efficient paging */
    CREATE NONCLUSTERED INDEX IX_Listings_CreatedAt
        ON dbo.Listings (CreatedAt DESC);

    /* 2️⃣  Colony search — exact match & prefix LIKE 'Malviya Nagar%' */
    CREATE NONCLUSTERED INDEX IX_Listings_Colony
        ON dbo.Listings (Colony, StatusId)
        INCLUDE (ListingId, MonthlyRent, MaxOccupants, AvailableFrom)
        WHERE StatusId = 1;   -- filtered: only active

    /* 3️⃣  Rent range search — ORDER BY MonthlyRent, filter by status */
    CREATE NONCLUSTERED INDEX IX_Listings_Rent
        ON dbo.Listings (MonthlyRent, StatusId)
        INCLUDE (ListingId, Colony, MaxOccupants, AvailableFrom)
        WHERE StatusId = 1;

    /* 4️⃣  Roommate count search */
    CREATE NONCLUSTERED INDEX IX_Listings_MaxOccupants
        ON dbo.Listings (MaxOccupants, StatusId)
        INCLUDE (ListingId, Colony, MonthlyRent, AvailableFrom)
        WHERE StatusId = 1;

    /* 5️⃣  Spatial index for "within 5 km" radius search */
    CREATE SPATIAL INDEX SIX_Listings_Location
        ON dbo.Listings (Location)
        USING GEOGRAPHY_AUTO_GRID
        WITH (CELLS_PER_OBJECT = 16);

    /* 6️⃣  Landlord → their listings (dashboard, my-listings page) */
    CREATE NONCLUSTERED INDEX IX_Listings_LandlordId
        ON dbo.Listings (LandlordId, StatusId)
        INCLUDE (Title, MonthlyRent, AvailableFrom, CreatedAt);

    /* 7️⃣  Availability date filter */
    CREATE NONCLUSTERED INDEX IX_Listings_AvailableFrom
        ON dbo.Listings (AvailableFrom, StatusId)
        INCLUDE (ListingId, Colony, MonthlyRent)
        WHERE StatusId = 1;

    PRINT '✅  003 — Listings table created with 7 indexes.';
END
GO
