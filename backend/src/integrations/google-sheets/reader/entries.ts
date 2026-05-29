import type { Request, Response } from 'express';
import { rowToEntry } from './schema.js';
import { fetchTabRows } from './tabRows.js';

export async function getEntries(req: Request, res: Response): Promise<void> {
  const tab = typeof req.query.tab === 'string' ? req.query.tab : '';
  if (!tab) {
    res.status(400).json({ error: 'query param "tab" is required (e.g. 2025)' });
    return;
  }

  try {
    const rows = await fetchTabRows(tab);
    const entries = rows.map((row) => rowToEntry(row));
    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
