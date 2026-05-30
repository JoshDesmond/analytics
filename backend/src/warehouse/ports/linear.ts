import type { Request, Response } from 'express';
import { Router } from 'express';
import { resolveCycleScores } from '../resolvers/linear.js';
import { sendResolverError } from './helpers.js';

export const linearPortRouter = Router();

async function getCycleScores(_req: Request, res: Response): Promise<void> {
  try {
    res.json(await resolveCycleScores());
  } catch (err) {
    sendResolverError(res, err, 'failed to load cycle scores');
  }
}

linearPortRouter.get('/cycle-scores', getCycleScores);
