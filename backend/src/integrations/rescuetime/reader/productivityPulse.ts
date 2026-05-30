import {
  RescueTimeClient,
  type RescueTimeIntervalProductivityData,
} from '../client.js';

const client = new RescueTimeClient();

/**
 * Computes a 0–100 productivity pulse from RescueTime interval rows.
 */
export function calculateProductivityPulse(
  data: RescueTimeIntervalProductivityData,
): number {
  let weightedTotal = 0;
  let total = 0;

  for (const row of data.rows) {
    const [, time, , prod] = row;
    if (prod > 2 || prod < -2) {
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

export async function fetchProductivityPulse(date: string): Promise<number> {
  const data = await client.fetchDailyProductivityData(date);
  return calculateProductivityPulse(data);
}
