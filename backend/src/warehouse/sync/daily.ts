import { fetchDailysForDate } from '../../integrations/habitica/reader/dailys.js';
import { fetchEntry } from '../../integrations/google-sheets/reader/entry.js';
import { fetchCycleScores } from '../../integrations/linear/reader/cycleScores.js';
import { RescueTimeClient } from '../../integrations/rescuetime/client.js';
import { calculateProductivityPulse } from '../../integrations/rescuetime/reader/productivityPulse.js';
import { mapDailyUserSummary } from '../../integrations/rescuetime/reader/dailyUserSummary.js';
import { mapTopActivities } from '../../integrations/rescuetime/reader/topActivities.js';
import { todayIsoDate } from '../lib/today.js';
import { upsertHabiticaDailys } from '../stores/habitica.js';
import { upsertGoogleSheetsEntry } from '../stores/google-sheets.js';
import { upsertLinearCycleScores } from '../stores/linear.js';
import { upsertRescueTimeDay } from '../stores/rescuetime.js';

const rescueTime = new RescueTimeClient();
const rescueTimeSyncInFlight = new Map<string, Promise<void>>();

async function pullAndUpsertRescueTimeDay(date: string): Promise<void> {
  const [summaryRaw, activityRows, desktopSeconds, mobileSeconds, productivityData] =
    await Promise.all([
      rescueTime.fetchDailyUserSummaryRaw(date),
      rescueTime.fetchRankedActivities(date),
      rescueTime.fetchSourceTotalSeconds(date, 'computers'),
      rescueTime.fetchSourceTotalSeconds(date, 'mobile'),
      rescueTime.fetchDailyProductivityData(date),
    ]);

  const summary = mapDailyUserSummary(summaryRaw);
  summary.productivityPulse = calculateProductivityPulse(productivityData);

  const topActivities = mapTopActivities(date, activityRows, 10);

  await upsertRescueTimeDay(summary, topActivities, {
    date,
    desktopSeconds,
    mobileSeconds,
  });
}

/**
 * Pulls RescueTime integration endpoints for one day and upserts into Supabase.
 * Concurrent calls for the same date share one in-flight sync.
 */
export async function syncRescueTimeDay(date: string): Promise<void> {
  const existing = rescueTimeSyncInFlight.get(date);
  if (existing) {
    await existing;
    return;
  }

  const sync = pullAndUpsertRescueTimeDay(date);
  rescueTimeSyncInFlight.set(date, sync);

  try {
    await sync;
  } finally {
    if (rescueTimeSyncInFlight.get(date) === sync) {
      rescueTimeSyncInFlight.delete(date);
    }
  }
}

/** Sync Habitica dailys snapshot for one calendar day. */
export async function syncHabiticaDay(date: string): Promise<void> {
  const payload = await fetchDailysForDate(date);
  await upsertHabiticaDailys(date, payload);
}

/** Sync Google Sheets entry snapshot for one calendar day. */
export async function syncGoogleSheetsDay(date: string): Promise<void> {
  const { tab, entry } = await fetchEntry(date);
  await upsertGoogleSheetsEntry(date, { tab, entry });
}

/** Sync Linear cycle scores snapshot (meaningful for the current sync day only). */
export async function syncLinearDay(date: string): Promise<void> {
  const scores = await fetchCycleScores();
  await upsertLinearCycleScores(date, scores);
}

/** Sync all integration daily tables for one calendar day. */
export async function syncDay(date: string): Promise<void> {
  const jobs: Promise<void>[] = [
    syncRescueTimeDay(date),
    syncHabiticaDay(date),
    syncGoogleSheetsDay(date),
  ];

  if (date === todayIsoDate()) {
    jobs.push(syncLinearDay(date));
  }

  await Promise.all(jobs);
}
