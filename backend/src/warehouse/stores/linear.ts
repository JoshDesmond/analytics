import type {
  LinearCycleScoresPayload,
  StoredDailyJsonSnapshot,
} from '../../shared/daily-snapshot-types.js';
import {
  getDailyJsonSnapshot,
  upsertDailyJsonSnapshot,
} from './dailyJsonSnapshot.js';

const TABLE = 'daily_linear_cycle_scores' as const;

export async function getStoredLinearCycleScores(
  date: string,
): Promise<StoredDailyJsonSnapshot<LinearCycleScoresPayload> | null> {
  return getDailyJsonSnapshot(TABLE, date);
}

export async function upsertLinearCycleScores(
  date: string,
  scores: LinearCycleScoresPayload,
): Promise<void> {
  await upsertDailyJsonSnapshot(TABLE, date, scores);
}
