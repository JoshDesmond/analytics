import type { Request, Response } from 'express';
import { Router } from 'express';
import { parseSetDailyCompletedBody } from '../../integrations/habitica/writer/schemas.js';
import { setDailyCompleted } from '../../integrations/habitica/writer/service.js';
import { parseOptionalDateQuery } from '../../shared/parseDateQuery.js';
import { resolveDailys } from '../resolvers/habitica.js';
import { getQueryParam, sendResolverError } from './helpers.js';

export const habiticaPortRouter = Router();

async function getTodaysDailys(req: Request, res: Response): Promise<void> {
  try {
    const date = parseOptionalDateQuery(getQueryParam(req, 'date'));
    res.json(await resolveDailys(date));
  } catch (err) {
    sendResolverError(res, err, 'failed to load habitica dailys');
  }
}

async function postDailyCompleted(
  req: Request,
  res: Response,
): Promise<void> {
  const rawTaskId = req.params.taskId;
  const taskId = Array.isArray(rawTaskId) ? rawTaskId[0] : rawTaskId;
  if (!taskId) {
    res.status(400).json({ error: 'taskId is required' });
    return;
  }

  const body = parseSetDailyCompletedBody(req.body);
  if (!body) {
    res.status(400).json({
      error: 'Request body must be a JSON object with boolean "completed"',
    });
    return;
  }

  try {
    await setDailyCompleted(taskId, body);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

habiticaPortRouter.get('/dailys/today', getTodaysDailys);
habiticaPortRouter.post('/dailys/:taskId/completed', postDailyCompleted);
