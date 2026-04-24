/*
 * ============================================================
 * 010 - Add Gender to Users
 * ============================================================
 * Adds nullable Gender column on dbo.Users with allowed values:
 *   - Male
 *   - Female
 * ============================================================
 */

USE [alternative-sql-db-4222389];
GO

IF COL_LENGTH('dbo.Users', 'Gender') IS NULL
BEGIN
    ALTER TABLE dbo.Users
    ADD Gender VARCHAR(10) NULL;

    PRINT 'Added dbo.Users.Gender';
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.check_constraints
    WHERE name = 'CK_Users_Gender'
      AND parent_object_id = OBJECT_ID('dbo.Users')
)
BEGIN
    ALTER TABLE dbo.Users
    ADD CONSTRAINT CK_Users_Gender CHECK (Gender IN ('Male', 'Female') OR Gender IS NULL);

    PRINT 'Added CK_Users_Gender';
END
GO
