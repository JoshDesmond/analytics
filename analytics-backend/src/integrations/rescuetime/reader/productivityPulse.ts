import type { Request, Response } from 'express';
import {
  RescueTimeClient,
  type RescueTimeIntervalProductivityData,
} from '../client.js';

const client = new RescueTimeClient();

/**
 * Computes a 0–100 productivity pulse from RescueTime interval rows.
 * @param data - Daily interval payload from the RescueTime API.
 */
export function calculateProductivityPulse(
  data: RescueTimeIntervalProductivityData,
): number {
  let weightedTotal = 0;
  let total = 0;

  for (const row of data.rows) {
    const [, time, , prod] = row;
    if (prod >= 2 || prod <= -2) {
      console.error(`Prod value ${prod} out of bounds`);
    }
    if (typeof time !== 'number') {
      throw new TypeError(`Unexpected type ${typeof time}, expected number`);
    }
    total += time;
    weightedTotal += time * (prod + 2);
  }

  return (weightedTotal / (total * 4)) * 100;
}

/**
 * Returns the RescueTime productivity pulse (0–100) for the current day.
 */
export async function getProductivityPulse(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const data = await client.fetchDailyProductivityData();
    const pulse = calculateProductivityPulse(data);
    console.log(`Productivity pulse: ${pulse}`);
    res.json(pulse);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: `failed to load data: ${err instanceof Error ? err.message : String(err)}`,
    });
  }
}
