// Date utility functions

/**
 * Get the current year for copyright notices
 */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

/**
 * Format a date range for display
 */
export function formatDateRange(start: Date, end: Date): string {
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();
  
  if (startYear === endYear) {
    return startYear.toString();
  }
  
  return `${startYear}-${endYear}`;
}

/**
 * Get copyright year(s) string
 * @param startYear - The year the company/project started
 */
export function getCopyrightYears(startYear: number = 2024): string {
  const currentYear = getCurrentYear();
  
  if (startYear === currentYear) {
    return currentYear.toString();
  }
  
  return `${startYear}-${currentYear}`;
}