/*
 * ============================================================
 *  002 — Users (Landlords + Tenants)
 * ============================================================
 *  A single Users table with a Role column.
 *  - Aadhaar is stored encrypted (VARBINARY) with a SHA-256
 *    hash for uniqueness checks without decryption.
 *  - Location stored as GEOGRAPHY for proximity search.
 *
 *  Run order: 001 → 002 → 003 → 004 → 005
 * ============================================================
 */

USE [alternative-sql-db-4222389];
GO

IF OBJECT_ID('dbo.Users', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Users (
        UserId              UNIQUEIDENTIFIER  NOT NULL  DEFAULT NEWSEQUENTIALID(),
        Role                VARCHAR(10)       NULL      CONSTRAINT DF_Users_Role DEFAULT 'Tenant',   -- 'Landlord' | 'Tenant'

        -- Identity
        FullName            NVARCHAR(120)     NOT NULL,
        Email               VARCHAR(254)      NULL,
        Phone               VARCHAR(15)       NOT NULL,
        PasswordHash        VARCHAR(255)      NULL,

        -- Aadhaar (sensitive — encrypted at app layer)
        AadhaarEncrypted    VARBINARY(512)    NULL,      -- AES-256 ciphertext
        AadhaarHash         BINARY(32)        NULL,      -- SHA-256 for uniqueness

        -- Address
        PermanentAddress    NVARCHAR(500)     NULL,
        City                NVARCHAR(100)     NULL,
        State               NVARCHAR(100)     NULL,
        Pincode             CHAR(6)           NULL,

        -- Profile photo (URL / blob path)
        PhotoUrl            VARCHAR(500)      NULL,

        -- Geo-location (for tenants doing proximity search)
        Location            GEOGRAPHY         NULL,

        -- Account state
        IsVerified          BIT               NOT NULL  CONSTRAINT DF_Users_IsVerified  DEFAULT 0,
        IsActive            BIT               NOT NULL  CONSTRAINT DF_Users_IsActive    DEFAULT 1,

        -- Audit
        CreatedAt           DATETIME2(3)      NOT NULL  DEFAULT SYSUTCDATETIME(),
        UpdatedAt           DATETIME2(3)      NOT NULL  DEFAULT SYSUTCDATETIME(),

        -- Constraints
        CONSTRAINT PK_Users PRIMARY KEY CLUSTERED (UserId),
        CONSTRAINT UQ_Users_Email UNIQUE (Email),
        CONSTRAINT UQ_Users_Phone UNIQUE (Phone),
        CONSTRAINT UQ_Users_AadhaarHash UNIQUE (AadhaarHash),
        CONSTRAINT CK_Users_Role CHECK (Role IN ('Landlord', 'Tenant'))
    );

    /* ── Index on CreatedAt for efficient range scans ── */
    CREATE NONCLUSTERED INDEX IX_Users_CreatedAt
        ON dbo.Users (CreatedAt);

    PRINT '✅  002 — Users table created with clustered index.';
END
GO

/* ── Search by role + active status ── */
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Users_Role_Active')
BEGIN
    CREATE NONCLUSTERED INDEX IX_Users_Role_Active
        ON dbo.Users (Role, IsActive)
        INCLUDE (FullName, Email, Phone);
END
GO

/* ── Spatial index for proximity queries (requires clustered index to exist) ── */
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'SIX_Users_Location')
BEGIN
    CREATE SPATIAL INDEX SIX_Users_Location
        ON dbo.Users (Location)
        USING GEOGRAPHY_AUTO_GRID
        WITH (CELLS_PER_OBJECT = 16);

    PRINT '✅  002 — Users indexes (nonclustered + spatial) created.';
END
GO
