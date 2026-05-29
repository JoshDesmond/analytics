import { Router } from 'express';
import { getCycleScores } from './cycleScores.js';

export const linearReaderRouter = Router();

linearReaderRouter.get('/cycle-scores', getCycleScores);
