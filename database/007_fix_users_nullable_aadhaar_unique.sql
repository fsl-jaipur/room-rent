/*
 * ============================================================
 * 007 - Fix AadhaarHash uniqueness for nullable values
 * ============================================================
 * Problem:
 *   UQ_Users_AadhaarHash on nullable column AadhaarHash can block
 *   inserts when AadhaarHash is NULL.
 *
 * Fix:
 *   Replace table-level unique constraint with a filtered unique index
 *   that only applies when AadhaarHash IS NOT NULL.
 * ============================================================
 */

IF OBJECT_ID('dbo.UQ_Users_AadhaarHash', 'UQ') IS NOT NULL
BEGIN
    ALTER TABLE dbo.Users DROP CONSTRAINT UQ_Users_AadhaarHash;
    PRINT 'Dropped UQ_Users_AadhaarHash constraint.';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_Users_AadhaarHash_NotNull' AND object_id = OBJECT_ID('dbo.Users'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX UX_Users_AadhaarHash_NotNull
        ON dbo.Users (AadhaarHash)
        WHERE AadhaarHash IS NOT NULL;

    PRINT 'Created filtered unique index UX_Users_AadhaarHash_NotNull.';
END
GO

