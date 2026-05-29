import { Router } from 'express';
import { getEntries } from './entries.js';
import { getTabs } from './tabs.js';
import { getTodayEntry } from './today.js';

export const googleSheetsReaderRouter = Router();

googleSheetsReaderRouter.get('/tabs', getTabs);
googleSheetsReaderRouter.get('/entries', getEntries);
googleSheetsReaderRouter.get('/today', getTodayEntry);
