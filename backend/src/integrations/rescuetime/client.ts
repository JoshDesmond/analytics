import { fetchRescueTimeJson } from './fetch.js';
import { getRescueTimeReportDate } from './date.js';

/**
 * RescueTime productivity level on the analytic data API numeric scale.
 *
 * @see https://www.rescuetime.com/rtx/developers#work-productivity-equivalents
 */
export type RescueTimeProductivityScore = -2 | -1 | 0 | 1 | 2;

/** Human-readable labels for {@link RescueTimeProductivityScore}. */
export const RESCUETIME_PRODUCTIVITY_LABELS: Record<
  RescueTimeProductivityScore,
  string
> = {
  [-2]: 'Very distracting',
  [-1]: 'Distracting',
  0: 'Neutral',
  1: 'Productive',
  2: 'Very productive',
};

/** Shared prefix for `by=rank` analytic rows: rank, seconds, team size (always 1 for personal keys). */
type RescueTimeRankRowHead = [
  rank: number,
  timeSpentSeconds: number,
  _teamSize: number,
];

/** `by=rank&rk=activity` row. */
export type RescueTimeRankActivityRow = [
  ...RescueTimeRankRowHead,
  activity: string,
  category: string,
  productivity: RescueTimeProductivityScore,
];

/** `by=rank&rk=overview` row. */
export type RescueTimeRankOverviewRow = [
  ...RescueTimeRankRowHead,
  category: string,
];

export type RescueTimeIntervalProductivityRow = [
  date: string,
  timeSpentSeconds: number,
  _teamSize: number,
  productivity: RescueTimeProductivityScore,
];

export interface RescueTimeIntervalProductivityData {
  notes: string;
  row_headers: [
    'Date',
    'Time Spent (seconds)',
    'Number of People',
    'Productivity',
  ];
  rows: RescueTimeIntervalProductivityRow[];
}

interface RescueTimeAnalyticDataEnvelope {
  notes: string;
  row_headers: string[];
  rows: unknown[][];
}

type SourceType = 'computers' | 'mobile';

export class RescueTimeClient {
  /**
   * Interval productivity rows for one calendar day (`anapi/data`, productivity taxonomy).
   */
  async fetchDailyProductivityData(
    date = getRescueTimeReportDate(),
  ): Promise<RescueTimeIntervalProductivityData> {
    const params = new URLSearchParams({
      by: 'interval',
      rk: 'productivity',
      interval: 'day',
      restrict_begin: date,
      format: 'json',
    });
    return fetchRescueTimeJson<RescueTimeIntervalProductivityData>(
      `https://www.rescuetime.com/anapi/data?${params}`,
    );
  }

  /**
   * Verbose daily rollup from the Resource API. Includes `software_development_hours`
   * (programming) and per-productivity-level hour fields when `verbose=true`.
   */
  async fetchDailyUserSummaryRaw(date: string) {
    const params = new URLSearchParams({
      start_date: date,
      end_date: date,
      verbose: 'true',
    });
    const summaries = await fetchRescueTimeJson<
      RescueTimeDailyUserSummaryVerbose[]
    >(
      `https://www.rescuetime.com/api/resource/daily_user_summaries?${params}`,
    );
    const summary = summaries[0];
    if (!summary) {
      throw new Error(`No daily summary for ${date}`);
    }
    return summary;
  }

  /** Ranked activities for a day (`by=rank&rk=activity`). */
  async fetchRankedActivities(date: string): Promise<RescueTimeRankActivityRow[]> {
    const params = new URLSearchParams({
      by: 'rank',
      rk: 'activity',
      restrict_begin: date,
      restrict_end: date,
      format: 'json',
    });
    const data = await fetchRescueTimeJson<RescueTimeAnalyticDataEnvelope>(
      `https://www.rescuetime.com/anapi/data?${params}`,
    );
    return data.rows as RescueTimeRankActivityRow[];
  }

  /** Total tracked seconds for one device class (sum of `by=rank&rk=overview` rows). */
  async fetchSourceTotalSeconds(
    date: string,
    sourceType: SourceType,
  ): Promise<number> {
    const params = new URLSearchParams({
      by: 'rank',
      rk: 'overview',
      restrict_begin: date,
      restrict_end: date,
      restrict_source_type: sourceType,
      format: 'json',
    });
    const data = await fetchRescueTimeJson<RescueTimeAnalyticDataEnvelope>(
      `https://www.rescuetime.com/anapi/data?${params}`,
    );
    let total = 0;
    for (const row of data.rows as RescueTimeRankOverviewRow[]) {
      const seconds = row[1];
      if (typeof seconds === 'number' && seconds > 0) {
        total += seconds;
      }
    }
    return total;
  }
}

/** Verbose row from `GET /api/resource/daily_user_summaries?verbose=true`. */
export interface RescueTimeDailyUserSummaryVerbose {
  id: number;
  date: string;
  productivity_pulse: number;
  total_hours: number;
  very_productive_hours: number;
  productive_hours: number;
  neutral_hours: number;
  distracting_hours: number;
  very_distracting_hours: number;
  uncategorized_hours: number;
  software_development_hours: number;
}
