USE [alternative-sql-db-4222389];
GO

PRINT 'Starting alteration of dbo.Users table...';
GO

-- 1. Drop dynamically named default constraints on Role, IsVerified, IsActive if they exist
DECLARE @ConstraintName NVARCHAR(200);

-- Role Default Constraint
SELECT @ConstraintName = d.name
FROM sys.default_constraints d
INNER JOIN sys.columns c ON d.parent_object_id = c.object_id AND d.parent_column_id = c.column_id
WHERE d.parent_object_id = OBJECT_ID('dbo.Users') AND c.name = 'Role';

IF @ConstraintName IS NOT NULL AND @ConstraintName NOT LIKE 'DF_Users_Role'
BEGIN
    EXEC('ALTER TABLE dbo.Users DROP CONSTRAINT [' + @ConstraintName + ']');
    PRINT 'Dropped default constraint on Role: ' + @ConstraintName;
END

-- IsVerified Default Constraint
SELECT @ConstraintName = d.name
FROM sys.default_constraints d
INNER JOIN sys.columns c ON d.parent_object_id = c.object_id AND d.parent_column_id = c.column_id
WHERE d.parent_object_id = OBJECT_ID('dbo.Users') AND c.name = 'IsVerified';

IF @ConstraintName IS NOT NULL AND @ConstraintName NOT LIKE 'DF_Users_IsVerified'
BEGIN
    EXEC('ALTER TABLE dbo.Users DROP CONSTRAINT [' + @ConstraintName + ']');
    PRINT 'Dropped default constraint on IsVerified: ' + @ConstraintName;
END

-- IsActive Default Constraint
SELECT @ConstraintName = d.name
FROM sys.default_constraints d
INNER JOIN sys.columns c ON d.parent_object_id = c.object_id AND d.parent_column_id = c.column_id
WHERE d.parent_object_id = OBJECT_ID('dbo.Users') AND c.name = 'IsActive';

IF @ConstraintName IS NOT NULL AND @ConstraintName NOT LIKE 'DF_Users_IsActive'
BEGIN
    EXEC('ALTER TABLE dbo.Users DROP CONSTRAINT [' + @ConstraintName + ']');
    PRINT 'Dropped default constraint on IsActive: ' + @ConstraintName;
END
GO

-- 1.5. Drop specific constraints that depend on the altered columns
IF OBJECT_ID('dbo.UQ_Users_Email', 'UQ') IS NOT NULL
BEGIN
    ALTER TABLE dbo.Users DROP CONSTRAINT UQ_Users_Email;
    PRINT 'Dropped UQ_Users_Email';
END

IF OBJECT_ID('dbo.CK_Users_Role', 'C') IS NOT NULL
BEGIN
    ALTER TABLE dbo.Users DROP CONSTRAINT CK_Users_Role;
    PRINT 'Dropped CK_Users_Role';
END
GO

-- 2. Alter columns to be NULLable
PRINT 'Altering columns to allow NULLs: Email, PasswordHash, Role...';
ALTER TABLE dbo.Users ALTER COLUMN Email VARCHAR(254) NULL;
ALTER TABLE dbo.Users ALTER COLUMN PasswordHash VARCHAR(255) NULL;
ALTER TABLE dbo.Users ALTER COLUMN Role VARCHAR(10) NULL;
GO

-- 3. Add explicit named default constraints
PRINT 'Adding explicitly named default constraints...';

-- For Role
IF NOT EXISTS (SELECT 1 FROM sys.default_constraints WHERE name = 'DF_Users_Role')
BEGIN
    ALTER TABLE dbo.Users ADD CONSTRAINT DF_Users_Role DEFAULT 'Tenant' FOR Role;
END

-- For IsVerified
IF NOT EXISTS (SELECT 1 FROM sys.default_constraints WHERE name = 'DF_Users_IsVerified')
BEGIN
    ALTER TABLE dbo.Users ADD CONSTRAINT DF_Users_IsVerified DEFAULT 0 FOR IsVerified;
END

-- For IsActive
IF NOT EXISTS (SELECT 1 FROM sys.default_constraints WHERE name = 'DF_Users_IsActive')
BEGIN
    ALTER TABLE dbo.Users ADD CONSTRAINT DF_Users_IsActive DEFAULT 1 FOR IsActive;
END

-- Recreate dropped constraints
PRINT 'Recreating unique and check constraints...';
ALTER TABLE dbo.Users ADD CONSTRAINT UQ_Users_Email UNIQUE (Email);
ALTER TABLE dbo.Users ADD CONSTRAINT CK_Users_Role CHECK (Role IN ('Landlord', 'Tenant'));

PRINT '✅ dbo.Users table alteration complete.';
GO
