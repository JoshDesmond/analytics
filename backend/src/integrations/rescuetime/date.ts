/**
 * Calendar day used for RescueTime "today" queries.
 *
 * RescueTime day boundaries follow the user's timezone; we approximate "today"
 * by shifting UTC back four hours so evening US sessions stay on the right day.
 */
export function getRescueTimeReportDate(reference = new Date()): string {
  const adjusted = new Date(reference);
  adjusted.setHours(adjusted.getHours() - 4);
  return adjusted.toISOString().slice(0, 10);
}
