import type {
  HabiticaDailysPayload,
  StoredDailyJsonSnapshot,
} from '../../shared/daily-snapshot-types.js';
import {
  getDailyJsonSnapshot,
  upsertDailyJsonSnapshot,
} from './dailyJsonSnapshot.js';

const TABLE = 'daily_habitica_dailys' as const;

export async function getStoredHabiticaDailys(
  date: string,
): Promise<StoredDailyJsonSnapshot<HabiticaDailysPayload> | null> {
  return getDailyJsonSnapshot(TABLE, date);
}

export async function upsertHabiticaDailys(
  date: string,
  payload: HabiticaDailysPayload,
): Promise<void> {
  await upsertDailyJsonSnapshot(TABLE, date, payload);
}
