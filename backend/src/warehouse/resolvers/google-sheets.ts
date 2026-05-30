import { fetchEntry } from '../../integrations/google-sheets/reader/entry.js';
import type { SheetsEntryResponse } from '../../shared/google-sheets-types.js';
import { resolveDailyJsonSnapshot } from './dailyJsonSnapshot.js';

export async function resolveEntry(
  date: string,
  reference = new Date(),
): Promise<SheetsEntryResponse> {
  const payload = await resolveDailyJsonSnapshot(
    'daily_google_sheets_entry',
    date,
    async () => {
      const live = await fetchEntry(date);
      return { tab: live.tab, entry: live.entry };
    },
    reference,
  );
  return { date, ...payload };
}
