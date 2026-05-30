import type { Request, Response } from 'express';
import { Router } from 'express';
import { fetchEntries } from '../../integrations/google-sheets/reader/entries.js';
import { fetchTabs } from '../../integrations/google-sheets/reader/tabs.js';
import { parseOptionalDateQuery } from '../../shared/parseDateQuery.js';
import { formatSheetDate } from '../../integrations/google-sheets/reader/tabRows.js';
import { resolveEntry } from '../resolvers/google-sheets.js';
import { getQueryParam, sendResolverError } from './helpers.js';

export const googleSheetsPortRouter = Router();

async function getTabs(_req: Request, res: Response): Promise<void> {
  try {
    res.json(await fetchTabs());
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

async function getEntries(req: Request, res: Response): Promise<void> {
  const tab = typeof req.query.tab === 'string' ? req.query.tab : '';
  if (!tab) {
    res.status(400).json({
      error: 'query param "tab" is required (e.g. 2025)',
    });
    return;
  }

  try {
    res.json(await fetchEntries(tab));
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

async function getEntry(req: Request, res: Response): Promise<void> {
  try {
    const date =
      parseOptionalDateQuery(getQueryParam(req, 'date')) ??
      formatSheetDate(new Date());
    res.json(await resolveEntry(date));
  } catch (err) {
    sendResolverError(res, err, 'failed to load sheet entry');
  }
}

googleSheetsPortRouter.get('/tabs', getTabs);
googleSheetsPortRouter.get('/entries', getEntries);
googleSheetsPortRouter.get('/entry', getEntry);
