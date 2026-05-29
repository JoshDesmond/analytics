/**
 * RescueTime productivity level on the analytic data API numeric scale.
 *
 * Labels in the RescueTime app were renamed (e.g. "Very Productive" → "Focus Work")
 * but API rows still use these integers. See
 * https://www.rescuetime.com/rtx/developers#work-productivity-equivalents
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

/**
 * One row from an **interval + productivity** analytic query, e.g.
 * `by=interval&rk=productivity&interval=day`.
 *
 * Column order matches `row_headers` from the API:
 * `["Date", "Time Spent (seconds)", "Number of People", "Productivity"]`.
 *
 * @see https://www.rescuetime.com/rtx/developers — Analytic Data API (JSON `row_headers` + `rows`)
 */
export type RescueTimeIntervalProductivityRow = [
  /** Interval start, ISO 8601 local datetime (e.g. `"2026-05-29T00:00:00"`). */
  date: string,
  /** Seconds logged in this interval at this productivity level. */
  timeSpentSeconds: number,
  /** Usually `1` for a personal API key; higher for team/member perspectives. */
  numberOfPeople: number,
  /** Productivity bucket for this slice of time. */
  productivity: RescueTimeProductivityScore,
];

/**
 * JSON envelope returned by `GET https://www.rescuetime.com/anapi/data` when
 * `format=json`.
 *
 * `fetchDailyProductivityData` uses perspective **interval**, taxonomy
 * **productivity**, and resolution **day**, so each row is a
 * {@link RescueTimeIntervalProductivityRow}.
 */
export interface RescueTimeIntervalProductivityData {
  /** Short description of the payload (from RescueTime). */
  notes: string;
  /** Column labels; index *i* describes `rows[*][i]`. */
  row_headers: [
    'Date',
    'Time Spent (seconds)',
    'Number of People',
    'Productivity',
  ];
  rows: RescueTimeIntervalProductivityRow[];
}

export class RescueTimeClient {
  private lastFetchTime = 0;
  private cachedData: RescueTimeIntervalProductivityData | undefined;

  /**
   * Queries the RescueTime API and returns interval-bucketed productivity data for the current day.
   * Responses are cached for twenty minutes.
   */
  async fetchDailyProductivityData(): Promise<RescueTimeIntervalProductivityData> {
    const cacheTtlMs = 20 * 60 * 1000;
    const now = Date.now();
    if (this.cachedData && now - this.lastFetchTime < cacheTtlMs) {
      console.log('Using cached RescueTime data');
      return this.cachedData;
    }

    const key = process.env.RT_API_KEY;
    if (!key) {
      throw new Error('RT_API_KEY is not set');
    }

    const day = new Date();
    day.setHours(day.getHours() - 4);
    const dayString = day.toISOString().slice(0, 10);
    const apiUrl =
      `https://www.rescuetime.com/anapi/data?key=${key}` +
      `&by=interval&rk=productivity&interval=day` +
      `&restrict_begin=${dayString}&format=json`;

    console.log(`Fetching RescueTime data for ${dayString}`);
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`RescueTime API fetch failed: ${response.status}`);
    }

    this.lastFetchTime = now;
    this.cachedData =
      (await response.json()) as RescueTimeIntervalProductivityData;
    return this.cachedData;
  }
}
