/**
 * Calculate the gymnastics season from a given date
 * Gymnastics season runs August through July
 * Aug-Dec: "YYYY-(YYYY+1)"
 * Jan-July: "(YYYY-1)-YYYY"
 *
 * @param date - The date to calculate the season from
 * @returns Season string in format "YYYY-YYYY"
 */
export function calculateSeason(date: Date): string {
  const month = date.getMonth(); // 0-11 (0 = January, 7 = August)
  const year = date.getFullYear();

  // August (month 7) through December (month 11)
  if (month >= 7) {
    return `${year}-${year + 1}`;
  }
  // January (month 0) through July (month 6)
  else {
    return `${year - 1}-${year}`;
  }
}

/**
 * Get the current gymnastics season
 * @returns Current season string in format "YYYY-YYYY"
 */
export function getCurrentSeason(): string {
  return calculateSeason(new Date());
}

/**
 * Parse a season string and return the start and end years
 * @param season - Season string in format "YYYY-YYYY"
 * @returns Object with startYear and endYear
 */
export function parseSeason(season: string): { startYear: number; endYear: number } {
  const [startYear, endYear] = season.split('-').map(Number);
  return { startYear, endYear };
}

/**
 * Get the previous season
 * @param season - Current season string
 * @returns Previous season string
 */
export function getPreviousSeason(season: string): string {
  const { startYear } = parseSeason(season);
  return `${startYear - 1}-${startYear}`;
}

/**
 * Get the next season
 * @param season - Current season string
 * @returns Next season string
 */
export function getNextSeason(season: string): string {
  const { endYear } = parseSeason(season);
  return `${endYear}-${endYear + 1}`;
}

/**
 * Format a date to a readable string
 * @param date - Date to format
 * @returns Formatted date string (e.g., "Jan 15, 2026")
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Format a score to 3 decimal places
 * @param score - Score number
 * @returns Formatted score string (e.g., "9.450")
 */
export function formatScore(score: number): string {
  return score.toFixed(3);
}
