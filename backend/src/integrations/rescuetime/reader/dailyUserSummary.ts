import type { RescueTimeDailyUserSummary } from '../../../shared/rescuetime-types.js';
import {
  RescueTimeClient,
  type RescueTimeDailyUserSummaryVerbose,
} from '../client.js';

const client = new RescueTimeClient();

function hoursToSeconds(hours: number): number {
  return Math.round(hours * 3600);
}

export function mapDailyUserSummary(
  summary: RescueTimeDailyUserSummaryVerbose,
): RescueTimeDailyUserSummary {
  return {
    date: summary.date,
    productivityPulse: summary.productivity_pulse,
    totalTrackedSeconds: hoursToSeconds(summary.total_hours),
    programmingSeconds: hoursToSeconds(summary.software_development_hours),
    productivityByLevel: {
      veryProductiveSeconds: hoursToSeconds(summary.very_productive_hours),
      productiveSeconds: hoursToSeconds(summary.productive_hours),
      neutralSeconds: hoursToSeconds(summary.neutral_hours),
      unproductiveSeconds: hoursToSeconds(summary.distracting_hours),
      veryUnproductiveSeconds: hoursToSeconds(summary.very_distracting_hours),
      uncategorizedSeconds: hoursToSeconds(summary.uncategorized_hours),
    },
  };
}

export async function fetchDailyUserSummary(
  date: string,
): Promise<RescueTimeDailyUserSummary> {
  const raw = await client.fetchDailyUserSummaryRaw(date);
  return mapDailyUserSummary(raw);
}
