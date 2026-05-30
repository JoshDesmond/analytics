import type { AllDailysResponse } from './habitica-types.js';
import type { SheetsEntryResponse } from './google-sheets-types.js';
import type { LinearCycleScores } from './linear-types.js';

/** Row shape shared by `daily_*` tables that store one JSON document per calendar day. */
export type DailyJsonSnapshotRow<TPayload> = {
  date: string;
  payload: TPayload;
  synced_at: string;
};

/** Domain record returned from warehouse stores (payload fields + cache metadata). */
export type StoredDailyJsonSnapshot<TPayload> = TPayload & {
  syncedAt: string;
};

export type HabiticaDailysPayload = AllDailysResponse;

/** `SheetsEntryResponse` without `date` (the table primary key). */
export type GoogleSheetsEntryPayload = Omit<SheetsEntryResponse, 'date'>;

export type LinearCycleScoresPayload = LinearCycleScores;

/** Maps `daily_*` jsonb tables to their payload TypeScript types. */
export interface DailyJsonSnapshotPayloads {
  daily_habitica_dailys: HabiticaDailysPayload;
  daily_google_sheets_entry: GoogleSheetsEntryPayload;
  daily_linear_cycle_scores: LinearCycleScoresPayload;
}

export type DailyJsonSnapshotTable = keyof DailyJsonSnapshotPayloads;
