import { HabiticaClient } from '../client.js';
import type { SetDailyCompletedBody } from '../../../shared/habitica-types.js';

const client = new HabiticaClient();

/**
 * Checks or unchecks a daily via Habitica's score/up and score/down endpoints.
 */
export async function setDailyCompleted(
  taskId: string,
  { completed }: SetDailyCompletedBody,
): Promise<void> {
  await client.scoreDaily(taskId, completed ? 'up' : 'down');
}
