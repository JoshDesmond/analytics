import { fetchDailysForDate } from '../../integrations/habitica/reader/dailys.js';
import type { AllDailysResponse } from '../../shared/habitica-types.js';
import { todayIsoDate } from '../lib/today.js';
import { resolveDailyJsonSnapshot } from './dailyJsonSnapshot.js';

export async function resolveDailys(
  dateInput?: string,
  reference = new Date(),
): Promise<AllDailysResponse> {
  const date = dateInput ?? todayIsoDate(reference);
  return resolveDailyJsonSnapshot(
    'daily_habitica_dailys',
    date,
    () => fetchDailysForDate(date),
    reference,
  );
}
