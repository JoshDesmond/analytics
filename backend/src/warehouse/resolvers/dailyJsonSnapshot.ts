import type {
  DailyJsonSnapshotPayloads,
  DailyJsonSnapshotTable,
} from '../../shared/daily-snapshot-types.js';
import { isTodayIsoDate, shouldReadFromWarehouse } from '../lib/freshness.js';
import { stripSyncedAt } from '../lib/storedRow.js';
import {
  getDailyJsonSnapshot,
  upsertDailyJsonSnapshot,
} from '../stores/dailyJsonSnapshot.js';

/**
 * Today: live integration, then upsert.
 * Past: warehouse when present, otherwise live fetch and upsert (backfill).
 */
export async function resolveDailyJsonSnapshot<
  TTable extends DailyJsonSnapshotTable,
>(
  table: TTable,
  date: string,
  fetchLive: () => Promise<DailyJsonSnapshotPayloads[TTable]>,
  reference = new Date(),
): Promise<DailyJsonSnapshotPayloads[TTable]> {
  if (isTodayIsoDate(date, reference)) {
    const live = await fetchLive();
    await upsertDailyJsonSnapshot(table, date, live);
    return live;
  }

  if (shouldReadFromWarehouse(date, reference)) {
    const cached = await getDailyJsonSnapshot(table, date);
    if (cached) return stripSyncedAt(cached);
  }

  const live = await fetchLive();
  await upsertDailyJsonSnapshot(table, date, live);
  return live;
}
