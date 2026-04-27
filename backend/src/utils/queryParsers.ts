/**
 * Simple query parameter parsing utilities
 * Makes controller logic cleaner and more maintainable
 */

/**
 * Parse comma-separated numbers from query string
 * Example: "1,2,3" → [1, 2, 3]
 */
export function parseNumberArray(value: string | null): number[] {
  if (!value?.trim()) return [];
  
  return value
    .split(',')
    .map(item => Number(item.trim()))
    .filter(num => Number.isInteger(num) && num > 0);
}

/**
 * Parse comma-separated strings from query string
 * Example: "Male,Female" → ["Male", "Female"]
 */
export function parseStringArray(value: string | null): string[] {
  if (!value?.trim()) return [];
  
  return value
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0);
}

/**
 * Parse comma-separated boolean strings
 * Example: "true,false" → [true, false]
 */
export function parseBooleanArray(value: string | null): boolean[] {
  if (!value?.trim()) return [];
  
  return value
    .split(',')
    .map(item => item.trim().toLowerCase())
    .filter(item => item === 'true' || item === 'false')
    .map(item => item === 'true');
}

/**
 * Parse gender array with validation
 * Only allows: Male, Female, Other
 */
export function parseGenderArray(value: string | null): ("Male" | "Female" | "Other")[] {
  const validGenders = ["Male", "Female", "Other"];
  
  return parseStringArray(value).filter((gender): gender is "Male" | "Female" | "Other" => 
    validGenders.includes(gender)
  );
}

/**
 * Parse integer with default value
 */
export function parseInteger(value: string | null, defaultValue: number = 0): number {
  if (!value) return defaultValue;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : defaultValue;
}

/**
 * Parse sort parameter with validation
 */
export function parseSortBy(value: string | null): "newest" | "rent_asc" | "rent_desc" {
  const validSorts = ["newest", "rent_asc", "rent_desc"];
  return validSorts.includes(value || "") ? (value as any) : "newest";
}