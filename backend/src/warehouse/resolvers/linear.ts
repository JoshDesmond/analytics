import { fetchCycleScores } from '../../integrations/linear/reader/cycleScores.js';
import type { LinearCycleScores } from '../../shared/linear-types.js';
import { todayIsoDate } from '../lib/today.js';
import { upsertLinearCycleScores } from '../stores/linear.js';

/** Cycle scores are always live; a daily snapshot is stored for the sync day. */
export async function resolveCycleScores(
  reference = new Date(),
): Promise<LinearCycleScores> {
  const live = await fetchCycleScores(reference);
  await upsertLinearCycleScores(todayIsoDate(reference), live);
  return live;
}
