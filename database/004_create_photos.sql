/*
 * ============================================================
 *  004 — Listing Photos
 * ============================================================
 *  Each listing must have:
 *    • Up to 2 room photos   (PhotoType = 'Room')
 *    • Exactly 1 exterior    (PhotoType = 'Exterior')
 *
 *  Photos are stored as URLs pointing to Azure Blob / S3 / etc.
 *  Enforcement of max counts is handled via a trigger.
 *
 *  Run order: 001 → 002 → 003 → 004 → 005
 * ============================================================
 */

USE [alternative-sql-db-4222389];
GO

IF OBJECT_ID('dbo.ListingPhotos', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ListingPhotos (
        PhotoId         UNIQUEIDENTIFIER  NOT NULL  DEFAULT NEWSEQUENTIALID(),
        ListingId       UNIQUEIDENTIFIER  NOT NULL,
        PhotoType       VARCHAR(10)       NOT NULL,    -- 'Room' | 'Exterior'
        PhotoUrl        VARCHAR(500)      NOT NULL,
        DisplayOrder    TINYINT           NOT NULL  DEFAULT 1,
        UploadedAt      DATETIME2(3)      NOT NULL  DEFAULT SYSUTCDATETIME(),

        CONSTRAINT PK_ListingPhotos PRIMARY KEY CLUSTERED (PhotoId),

        CONSTRAINT FK_ListingPhotos_Listing
            FOREIGN KEY (ListingId) REFERENCES dbo.Listings (ListingId)
            ON DELETE CASCADE,

        CONSTRAINT CK_ListingPhotos_Type CHECK (PhotoType IN ('Room', 'Exterior'))
    );

    /* Fast lookup: get all photos for a listing */
    CREATE NONCLUSTERED INDEX IX_ListingPhotos_ListingId
        ON dbo.ListingPhotos (ListingId, PhotoType, DisplayOrder)
        INCLUDE (PhotoUrl);

    PRINT '✅  004 — ListingPhotos table created.';
END
GO

-- ──────────────────────────────────────────────
--  Trigger: enforce max 2 Room + 1 Exterior
-- ──────────────────────────────────────────────
IF OBJECT_ID('dbo.TR_ListingPhotos_MaxCount', 'TR') IS NOT NULL
    DROP TRIGGER dbo.TR_ListingPhotos_MaxCount;
GO

CREATE TRIGGER dbo.TR_ListingPhotos_MaxCount
ON dbo.ListingPhotos
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Check room photo limit (max 2)
    IF EXISTS (
        SELECT 1
        FROM dbo.ListingPhotos lp
        INNER JOIN inserted i ON lp.ListingId = i.ListingId
        WHERE lp.PhotoType = 'Room'
        GROUP BY lp.ListingId
        HAVING COUNT(*) > 2
    )
    BEGIN
        RAISERROR('A listing cannot have more than 2 room photos.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END

    -- Check exterior photo limit (max 1)
    IF EXISTS (
        SELECT 1
        FROM dbo.ListingPhotos lp
        INNER JOIN inserted i ON lp.ListingId = i.ListingId
        WHERE lp.PhotoType = 'Exterior'
        GROUP BY lp.ListingId
        HAVING COUNT(*) > 1
    )
    BEGIN
        RAISERROR('A listing cannot have more than 1 exterior photo.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
END
GO

PRINT '✅  004 — Photo count trigger created.';
GO
