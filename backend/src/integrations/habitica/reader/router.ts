import { Router } from 'express';
import { getTodaysDailys } from './dailys.js';

export const habiticaReaderRouter = Router();

habiticaReaderRouter.get('/dailys/today', getTodaysDailys);
