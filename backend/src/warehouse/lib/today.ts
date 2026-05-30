/** Calendar day in UTC (`YYYY-MM-DD`). */
export function todayIsoDate(reference = new Date()): string {
  return reference.toISOString().slice(0, 10);
}
