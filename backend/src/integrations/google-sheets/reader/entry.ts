import type { SheetsEntry, SheetsEntryResponse } from '../../../shared/google-sheets-types.js';
import { rowToEntry } from './schema.js';
import {
  fetchTabRows,
  formatSheetDate,
  listTabTitles,
  resolveTabForDate,
} from './tabRows.js';

export async function findEntryForDate(
  isoDate: string,
): Promise<{ tab: string | null; entry: SheetsEntry | null }> {
  const tabTitles = await listTabTitles();
  const tab = resolveTabForDate(isoDate, tabTitles);
  if (!tab) {
    return { tab: null, entry: null };
  }
  const rows = await fetchTabRows(tab);
  for (const row of rows) {
    const entry = rowToEntry(row);
    if (entry.date === isoDate) {
      return { tab, entry };
    }
  }
  return { tab, entry: null };
}

export async function fetchEntry(
  date?: string,
): Promise<SheetsEntryResponse> {
  const isoDate = date ?? formatSheetDate(new Date());
  const { tab, entry } = await findEntryForDate(isoDate);
  return { date: isoDate, tab, entry };
}
