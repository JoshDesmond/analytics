import type { SheetsTab } from '../../../shared/google-sheets-types.js';
import { getSpreadsheetId, sheets } from '../client.js';

export async function fetchTabs(): Promise<SheetsTab[]> {
  const spreadsheetId = getSpreadsheetId();
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  return (meta.data.sheets ?? []).map((s) => ({
    title: s.properties?.title ?? '',
    gid: s.properties?.sheetId ?? 0,
  }));
}
