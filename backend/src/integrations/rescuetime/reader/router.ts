import { Router } from 'express';
import { getProductivityPulse } from './productivityPulse.js';

export const rescueTimeReaderRouter = Router();

rescueTimeReaderRouter.get('/productivity-pulse', getProductivityPulse);
