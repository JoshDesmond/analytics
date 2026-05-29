import type { Request, Response } from 'express';
import { getSpreadsheetId, sheets } from '../client.js';

export async function getTabs(_req: Request, res: Response): Promise<void> {
  try {
    const spreadsheetId = getSpreadsheetId();
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const tabs = (meta.data.sheets ?? []).map((s) => ({
      title: s.properties?.title ?? '',
      gid: s.properties?.sheetId ?? 0,
    }));
    res.json(tabs);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
