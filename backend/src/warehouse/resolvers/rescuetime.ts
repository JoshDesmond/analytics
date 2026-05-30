import type {
  RescueTimeDailyUserSummary,
  RescueTimeDeviceSeconds,
  RescueTimeTopActivities,
} from '../../shared/rescuetime-types.js';
import { fetchDailyUserSummary } from '../../integrations/rescuetime/reader/dailyUserSummary.js';
import { fetchDeviceSeconds } from '../../integrations/rescuetime/reader/deviceSeconds.js';
import { fetchProductivityPulse } from '../../integrations/rescuetime/reader/productivityPulse.js';
import {
  fetchTopActivities,
  parseTopActivitiesLimit,
} from '../../integrations/rescuetime/reader/topActivities.js';
import { getRescueTimeReportDate } from '../../integrations/rescuetime/date.js';
import { shouldReadFromWarehouse } from '../lib/freshness.js';
import { stripSyncedAt } from '../lib/storedRow.js';
import {
  getStoredDailyUserSummary,
  getStoredDeviceSeconds,
  getStoredProductivityPulse,
  getStoredTopActivities,
} from '../stores/rescuetime.js';
import { syncRescueTimeDay } from '../sync/daily.js';

async function refreshRescueTimeDay(date: string): Promise<void> {
  await syncRescueTimeDay(date);
}

export async function resolveProductivityPulse(
  date: string,
  reference = new Date(),
): Promise<number> {
  if (shouldReadFromWarehouse(date, reference)) {
    const cached = await getStoredProductivityPulse(date);
    if (cached) return cached.value;
  }

  await refreshRescueTimeDay(date);
  const refreshed = await getStoredProductivityPulse(date);
  if (refreshed) return refreshed.value;

  return fetchProductivityPulse(date);
}

export async function resolveDailyUserSummary(
  date: string,
  reference = new Date(),
): Promise<RescueTimeDailyUserSummary> {
  if (shouldReadFromWarehouse(date, reference)) {
    const cached = await getStoredDailyUserSummary(date);
    if (cached) return stripSyncedAt(cached);
  }

  await refreshRescueTimeDay(date);
  const refreshed = await getStoredDailyUserSummary(date);
  if (refreshed) return stripSyncedAt(refreshed);

  return fetchDailyUserSummary(date);
}

export async function resolveTopActivities(
  date: string,
  limitInput: unknown,
  reference = new Date(),
): Promise<RescueTimeTopActivities> {
  const limit = parseTopActivitiesLimit(limitInput);

  if (shouldReadFromWarehouse(date, reference)) {
    const cached = await getStoredTopActivities(date, limit);
    if (cached) {
      const activities = stripSyncedAt(cached);
      return {
        date: activities.date,
        activities: activities.activities.slice(0, limit),
      };
    }
  }

  await refreshRescueTimeDay(date);
  const refreshed = await getStoredTopActivities(date, limit);
  if (refreshed) {
    const activities = stripSyncedAt(refreshed);
    return {
      date: activities.date,
      activities: activities.activities.slice(0, limit),
    };
  }

  return fetchTopActivities(date, limit);
}

export async function resolveDeviceSeconds(
  date: string,
  reference = new Date(),
): Promise<RescueTimeDeviceSeconds> {
  if (shouldReadFromWarehouse(date, reference)) {
    const cached = await getStoredDeviceSeconds(date);
    if (cached) return stripSyncedAt(cached);
  }

  await refreshRescueTimeDay(date);
  const refreshed = await getStoredDeviceSeconds(date);
  if (refreshed) return stripSyncedAt(refreshed);

  return fetchDeviceSeconds(date);
}

export function defaultRescueTimeDate(dateInput: unknown): string {
  return parseOptionalDateOrDefault(dateInput, getRescueTimeReportDate());
}

function parseOptionalDateOrDefault(
  value: unknown,
  fallback: string,
): string {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error('date must be YYYY-MM-DD');
  }
  return value;
}
