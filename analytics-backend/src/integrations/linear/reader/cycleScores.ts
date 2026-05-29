import type { Request, Response } from 'express';
import { LinearClient, type LinearCycle } from '../client.js';

const client = new LinearClient();

export interface CycleProgress {
  name: string | null;
  number: number;
  starts_at: string;
  ends_at: string;
  points_scoped: number;
  points_completed: number;
}

export interface LinearCycleScoresResponse {
  this_week: CycleProgress | null;
  last_week: CycleProgress | null;
}

/** Latest value in a scope history array (current or final snapshot). */
export function latestHistoryValue(history: number[]): number {
  return history[history.length - 1] ?? 0;
}

export function toCycleProgress(cycle: LinearCycle): CycleProgress {
  return {
    name: cycle.name,
    number: cycle.number,
    starts_at: cycle.startsAt,
    ends_at: cycle.endsAt,
    points_scoped: latestHistoryValue(cycle.scopeHistory),
    points_completed: latestHistoryValue(cycle.completedScopeHistory),
  };
}

/** Active cycle: Linear flag first, else the cycle whose window contains `now`. */
export function findActiveCycle(
  cycles: LinearCycle[],
  now = new Date(),
): LinearCycle | undefined {
  const flagged = cycles.filter((c) => c.isActive);
  if (flagged.length === 1) return flagged[0];
  if (flagged.length > 1) {
    return flagged.sort(
      (a, b) =>
        new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime(),
    )[0];
  }

  const t = now.getTime();
  const inWindow = cycles.filter((c) => {
    const start = new Date(c.startsAt).getTime();
    const end = new Date(c.endsAt).getTime();
    return start <= t && t < end;
  });
  if (inWindow.length === 0) return undefined;
  return inWindow.sort(
    (a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime(),
  )[0];
}

/** Previous cycle: Linear flag first, else the most recently ended cycle before `now`. */
export function findPreviousCycle(
  cycles: LinearCycle[],
  active: LinearCycle | undefined,
  now = new Date(),
): LinearCycle | undefined {
  const flagged = cycles.filter((c) => c.isPrevious);
  if (flagged.length === 1) return flagged[0];
  if (flagged.length > 1) {
    return flagged.sort(
      (a, b) => new Date(b.endsAt).getTime() - new Date(a.endsAt).getTime(),
    )[0];
  }

  const t = now.getTime();
  const ended = cycles
    .filter((c) => {
      if (active && c.id === active.id) return false;
      return new Date(c.endsAt).getTime() <= t;
    })
    .sort(
      (a, b) => new Date(b.endsAt).getTime() - new Date(a.endsAt).getTime(),
    );
  return ended[0];
}

export function buildCycleScoresResponse(
  cycles: LinearCycle[],
  now = new Date(),
): LinearCycleScoresResponse {
  const active = findActiveCycle(cycles, now);
  const previous = findPreviousCycle(cycles, active, now);

  return {
    this_week: active ? toCycleProgress(active) : null,
    last_week: previous ? toCycleProgress(previous) : null,
  };
}

/**
 * Returns scoped/completed points for the active cycle and the previous cycle.
 */
export async function getCycleScores(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const cycles = await client.fetchCycles();
    res.json(buildCycleScoresResponse(cycles));
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
