import type { Request, Response } from 'express';
import {
  HabiticaClient,
  type HabiticaDailyRepeat,
  type HabiticaDailyTask,
} from '../client.js';

const client = new HabiticaClient();

const DAY_KEYS = ['su', 'm', 't', 'w', 'th', 'f', 's'] as const;

export interface DailySummary {
  id: string;
  name: string;
  completed: boolean;
}

export interface AllDailysResponse {
  date: string;
  dueToday: DailySummary[];
  other: DailySummary[];
}

function formatDueDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function repeatValue(repeat: HabiticaDailyRepeat, dayKey: string): boolean {
  const value = repeat[dayKey as keyof HabiticaDailyRepeat];
  return value !== false;
}

/** Whether a daily is scheduled for the given calendar day (Habitica repeat rules). */
export function isDailyDueOnDate(
  task: HabiticaDailyTask,
  date: Date,
): boolean {
  if (task.isDue === true) return true;
  if (task.isDue === false) return false;

  const frequency = task.frequency ?? 'weekly';

  if (frequency === 'weekly') {
    const dayKey = DAY_KEYS[date.getDay()];
    return repeatValue(task.repeat ?? {}, dayKey);
  }

  if (frequency === 'daily') {
    const everyX = task.everyX ?? 1;
    if (everyX <= 1) return true;

    if (!task.startDate) return true;
    const start = new Date(task.startDate);
    start.setHours(0, 0, 0, 0);
    const day = new Date(date);
    day.setHours(0, 0, 0, 0);
    const daysSinceStart = Math.floor(
      (day.getTime() - start.getTime()) / 86_400_000,
    );
    if (daysSinceStart < 0) return false;
    return daysSinceStart % everyX === 0;
  }

  return true;
}

export function toDailySummary(task: HabiticaDailyTask): DailySummary {
  return {
    id: task.id ?? task._id,
    name: task.text,
    completed: Boolean(task.completed),
  };
}

export function buildAllDailysResponse(
  tasks: HabiticaDailyTask[],
  now = new Date(),
): AllDailysResponse {
  const date = formatDueDate(now);
  const dueToday: DailySummary[] = [];
  const other: DailySummary[] = [];

  for (const task of tasks) {
    const summary = toDailySummary(task);
    if (isDailyDueOnDate(task, now)) {
      dueToday.push(summary);
    } else {
      other.push(summary);
    }
  }

  return { date, dueToday, other };
}

/**
 * Returns all dailies, split into those due today and the rest.
 */
export async function getTodaysDailys(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const now = new Date();
    const dueDate = formatDueDate(now);
    const tasks = await client.fetchDailys(dueDate);
    res.json(buildAllDailysResponse(tasks, now));
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
