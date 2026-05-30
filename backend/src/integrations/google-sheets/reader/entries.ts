import type { SheetsEntry } from '../../../shared/google-sheets-types.js';
import { rowToEntry } from './schema.js';
import { fetchTabRows } from './tabRows.js';

export async function fetchEntries(tab: string): Promise<SheetsEntry[]> {
  const rows = await fetchTabRows(tab);
  return rows.map((row) => rowToEntry(row));
}
