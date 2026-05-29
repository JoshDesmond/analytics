import { getSpreadsheetId, sheets } from '../client.js';

const PERIOD_START = /^(\d{4}-\d{2}-\d{2})/;

export async function listTabTitles(): Promise<string[]> {
  const spreadsheetId = getSpreadsheetId();
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  return (meta.data.sheets ?? [])
    .map((s) => s.properties?.title ?? '')
    .filter((title) => title.length > 0);
}

/** Tab whose leading YYYY-MM-DD is the latest period start on or before `isoDate`. */
export function resolveTabForDate(
  isoDate: string,
  tabTitles: string[],
): string | null {
  let best: { title: string; start: string } | null = null;

  for (const title of tabTitles) {
    const match = title.match(PERIOD_START);
    if (!match) continue;
    const start = match[1];
    if (start > isoDate) continue;
    if (!best || start > best.start) {
      best = { title, start };
    }
  }

  return best?.title ?? null;
}

export async function fetchTabRows(tab: string): Promise<string[][]> {
  const spreadsheetId = getSpreadsheetId();
  const range = `'${tab.replace(/'/g, "''")}'!A2:N`;
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });
  return (result.data.values ?? []) as string[][];
}

export function formatSheetDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
