/**
 * Shared payroll date utilities
 * 
 * Philippine semi-monthly payroll convention:
 *   - Period ending on or before the 15th → paid on the 25th of the same month
 *   - Period ending after the 15th (end of month) → paid on the 10th of the next month
 */

/**
 * Derives the expected payment date from the pay period end date
 * following Philippine semi-monthly payroll convention.
 */
export function getPaymentDate(periodEndDate: string | Date): Date {
  const end = new Date(periodEndDate);
  // Guard against invalid dates
  if (isNaN(end.getTime())) {
    return new Date(); // fallback to today if date is invalid
  }
  const day = end.getUTCDate();
  if (day <= 15) {
    // 1st–15th period → paid on the 25th of the same month
    return new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 25));
  } else {
    // 16th–EOM period → paid on the 10th of the next month
    return new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() + 1, 10));
  }
}

/**
 * Formats a payment date as an ISO date string (YYYY-MM-DD)
 */
export function getPaymentDateString(periodEndDate: string | Date): string {
  return getPaymentDate(periodEndDate).toISOString().split('T')[0];
}
