import type { Request, Response } from 'express';
import { rowToEntry, type Entry } from './schema.js';
import {
  fetchTabRows,
  formatSheetDate,
  listTabTitles,
  resolveTabForDate,
} from './tabRows.js';

export type TodayEntryResponse = {
  date: string;
  tab: string | null;
  entry: Entry | null;
};

export async function findEntryForDate(
  isoDate: string,
): Promise<{ tab: string | null; entry: Entry | null }> {
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

export async function getTodayEntry(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const date = formatSheetDate(new Date());
    const { tab, entry } = await findEntryForDate(date);
    res.json({ date, tab, entry } satisfies TodayEntryResponse);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
