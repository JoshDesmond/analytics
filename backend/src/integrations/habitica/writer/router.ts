import type { Request, Response } from 'express';
import { Router } from 'express';
import { parseSetDailyCompletedBody } from './schemas.js';
import { setDailyCompleted } from './service.js';

export const habiticaWriterRouter = Router();

/**
 * Sets whether a daily is checked off today (`completed: true` → score up).
 */
export async function postDailyCompleted(
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

habiticaWriterRouter.post('/dailys/:taskId/completed', postDailyCompleted);
