import { todayIsoDate } from './today.js';

export const CACHE_TTL_MS = 10 * 60 * 1000;

/** Whether `date` is the current UTC calendar day. */
export function isTodayIsoDate(
  date: string,
  reference = new Date(),
): boolean {
  return date === todayIsoDate(reference);
}

/**
 * Warehouse rows are read for past dates only.
 * Today always goes to the live integration (writes may still upsert snapshots).
 */
export function shouldReadFromWarehouse(
  date: string,
  reference = new Date(),
): boolean {
  return date < todayIsoDate(reference);
}
