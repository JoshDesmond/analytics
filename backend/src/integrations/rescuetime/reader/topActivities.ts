import type {
  RescueTimeTopActivities,
  RescueTimeTopActivity,
} from '../../../shared/rescuetime-types.js';
import {
  RescueTimeClient,
  type RescueTimeProductivityScore,
  type RescueTimeRankActivityRow,
} from '../client.js';

const client = new RescueTimeClient();

export function parseTopActivitiesLimit(
  value: unknown,
  defaultLimit = 3,
): number {
  if (value === undefined || value === null || value === '') {
    return defaultLimit;
  }
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 10) {
    throw new Error('limit must be an integer between 1 and 10');
  }
  return n;
}

export function mapTopActivities(
  date: string,
  rows: RescueTimeRankActivityRow[],
  limit: number,
): RescueTimeTopActivities {
  const activities: RescueTimeTopActivity[] = rows
    .slice(0, limit)
    .map((row, index) => {
      const [, seconds, , name, category, productivity] = row;
      return {
        rank: index + 1,
        name,
        category,
        seconds,
        productivity: productivity as RescueTimeProductivityScore,
      };
    });
  return { date, activities };
}

export async function fetchTopActivities(
  date: string,
  limit: number,
): Promise<RescueTimeTopActivities> {
  const rows = await client.fetchRankedActivities(date);
  return mapTopActivities(date, rows, limit);
}
