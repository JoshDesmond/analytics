import type {
  GoogleSheetsEntryPayload,
  StoredDailyJsonSnapshot,
} from '../../shared/daily-snapshot-types.js';
import {
  getDailyJsonSnapshot,
  upsertDailyJsonSnapshot,
} from './dailyJsonSnapshot.js';

const TABLE = 'daily_google_sheets_entry' as const;

export async function getStoredGoogleSheetsEntry(
  date: string,
): Promise<StoredDailyJsonSnapshot<GoogleSheetsEntryPayload> | null> {
  return getDailyJsonSnapshot(TABLE, date);
}

export async function upsertGoogleSheetsEntry(
  date: string,
  payload: GoogleSheetsEntryPayload,
): Promise<void> {
  await upsertDailyJsonSnapshot(TABLE, date, payload);
}
