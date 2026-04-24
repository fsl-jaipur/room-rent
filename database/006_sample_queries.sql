/*
 * ============================================================
 *  006 — Sample Search Queries
 * ============================================================
 *  Copy-paste ready parameterized queries for each of the
 *  search features. Use these as the basis for your
 *  TypeScript repository / service layer.
 *
 *  All queries target only Active listings (StatusId = 1).
 * ============================================================
 */

USE [RoomRent];
GO

-- ╔═══════════════════════════════════════════════════════════╗
-- ║  1. SEARCH BY COLONY                                     ║
-- ╚═══════════════════════════════════════════════════════════╝
-- Uses IX_Listings_Colony filtered index.

DECLARE @Colony NVARCHAR(150) = N'Malviya Nagar';

SELECT l.ListingId, l.Title, l.Colony, l.MonthlyRent,
       l.MaxOccupants, l.AvailableFrom,
       fl.FloorName, ft.FurnishingName
FROM   dbo.Listings l
JOIN   dbo.FloorLevels    fl ON fl.FloorLevelId    = l.FloorLevelId
JOIN   dbo.FurnishingTypes ft ON ft.FurnishingTypeId = l.FurnishingTypeId
WHERE  l.Colony   = @Colony
  AND  l.StatusId = 1
ORDER BY l.CreatedAt DESC
OFFSET 0 ROWS FETCH NEXT 20 ROWS ONLY;
GO


-- ╔═══════════════════════════════════════════════════════════╗
-- ║  2. SEARCH WITHIN 5 KM RADIUS                            ║
-- ╚═══════════════════════════════════════════════════════════╝
-- Uses SIX_Listings_Location spatial index.
-- @UserLat / @UserLng come from the tenant's device GPS.

DECLARE @UserLat   DECIMAL(9,6) = 26.9124;   -- example: Jaipur
DECLARE @UserLng   DECIMAL(9,6) = 75.7873;
DECLARE @RadiusM   FLOAT        = 5000;      -- 5 km in metres

DECLARE @UserPoint GEOGRAPHY = GEOGRAPHY::Point(@UserLat, @UserLng, 4326);

SELECT l.ListingId, l.Title, l.Colony, l.MonthlyRent,
       l.MaxOccupants, l.AvailableFrom,
       ROUND(l.Location.STDistance(@UserPoint), 0) AS DistanceMetres
FROM   dbo.Listings l
WHERE  l.StatusId = 1
  AND  l.Location.STDistance(@UserPoint) <= @RadiusM
ORDER BY l.Location.STDistance(@UserPoint)
OFFSET 0 ROWS FETCH NEXT 20 ROWS ONLY;
GO


-- ╔═══════════════════════════════════════════════════════════╗
-- ║  3. SEARCH BY RENT RANGE                                  ║
-- ╚═══════════════════════════════════════════════════════════╝
-- Uses IX_Listings_Rent filtered index.

DECLARE @MinRent DECIMAL(10,2) = 3000.00;
DECLARE @MaxRent DECIMAL(10,2) = 8000.00;

SELECT l.ListingId, l.Title, l.Colony, l.MonthlyRent,
       l.MaxOccupants, l.AvailableFrom
FROM   dbo.Listings l
WHERE  l.StatusId    = 1
  AND  l.MonthlyRent BETWEEN @MinRent AND @MaxRent
ORDER BY l.MonthlyRent ASC
OFFSET 0 ROWS FETCH NEXT 20 ROWS ONLY;
GO


-- ╔═══════════════════════════════════════════════════════════╗
-- ║  4. SEARCH BY NUMBER OF ROOMMATES                         ║
-- ╚═══════════════════════════════════════════════════════════╝
-- Uses IX_Listings_MaxOccupants filtered index.

DECLARE @DesiredOccupants TINYINT = 2;

SELECT l.ListingId, l.Title, l.Colony, l.MonthlyRent,
       l.MaxOccupants, l.AvailableFrom
FROM   dbo.Listings l
WHERE  l.StatusId     = 1
  AND  l.MaxOccupants = @DesiredOccupants
ORDER BY l.CreatedAt DESC
OFFSET 0 ROWS FETCH NEXT 20 ROWS ONLY;
GO


-- ╔═══════════════════════════════════════════════════════════╗
-- ║  5. COMBINED MULTI-FILTER SEARCH                          ║
-- ╚═══════════════════════════════════════════════════════════╝
-- All filters are optional — pass NULL to skip.

DECLARE @FilterColony       NVARCHAR(150)  = NULL;
DECLARE @FilterMinRent      DECIMAL(10,2)  = 3000;
DECLARE @FilterMaxRent      DECIMAL(10,2)  = 10000;
DECLARE @FilterOccupants    TINYINT        = NULL;
DECLARE @FilterFloorLevel   TINYINT        = NULL;
DECLARE @FilterFurnishing   TINYINT        = NULL;
DECLARE @FilterSmoking      BIT            = NULL;
DECLARE @FilterFoodPref     TINYINT        = NULL;
DECLARE @FilterAvailBefore  DATE           = NULL;
DECLARE @FilterLat          DECIMAL(9,6)   = 26.9124;
DECLARE @FilterLng          DECIMAL(9,6)   = 75.7873;
DECLARE @FilterRadiusM      FLOAT          = 5000;

DECLARE @Center GEOGRAPHY = CASE
    WHEN @FilterLat IS NOT NULL AND @FilterLng IS NOT NULL
    THEN GEOGRAPHY::Point(@FilterLat, @FilterLng, 4326)
    ELSE NULL END;

SELECT l.ListingId, l.Title, l.Colony, l.MonthlyRent,
       l.MaxOccupants, l.AvailableFrom,
       fl.FloorName, ft.FurnishingName, fp.PreferenceName,
       CASE WHEN @Center IS NOT NULL
            THEN ROUND(l.Location.STDistance(@Center), 0)
            ELSE NULL END AS DistanceMetres
FROM   dbo.Listings l
JOIN   dbo.FloorLevels      fl ON fl.FloorLevelId     = l.FloorLevelId
JOIN   dbo.FurnishingTypes   ft ON ft.FurnishingTypeId  = l.FurnishingTypeId
JOIN   dbo.FoodPreferences   fp ON fp.FoodPreferenceId  = l.FoodPreferenceId
WHERE  l.StatusId = 1
  AND  (@FilterColony      IS NULL OR l.Colony          = @FilterColony)
  AND  (@FilterMinRent     IS NULL OR l.MonthlyRent    >= @FilterMinRent)
  AND  (@FilterMaxRent     IS NULL OR l.MonthlyRent    <= @FilterMaxRent)
  AND  (@FilterOccupants   IS NULL OR l.MaxOccupants    = @FilterOccupants)
  AND  (@FilterFloorLevel  IS NULL OR l.FloorLevelId    = @FilterFloorLevel)
  AND  (@FilterFurnishing  IS NULL OR l.FurnishingTypeId= @FilterFurnishing)
  AND  (@FilterSmoking     IS NULL OR l.AllowSmoking    = @FilterSmoking)
  AND  (@FilterFoodPref    IS NULL OR l.FoodPreferenceId= @FilterFoodPref)
  AND  (@FilterAvailBefore IS NULL OR l.AvailableFrom  <= @FilterAvailBefore)
  AND  (@Center            IS NULL OR l.Location.STDistance(@Center) <= @FilterRadiusM)
ORDER BY l.CreatedAt DESC
OFFSET 0 ROWS FETCH NEXT 20 ROWS ONLY;
GO
