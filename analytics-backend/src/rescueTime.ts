export type RescueTimeRow = [unknown, number, unknown, number, ...unknown[]];

export interface RescueTimeData {
  rows: RescueTimeRow[];
}

export class RescueTime {
  private lastTime = 0;
  private cachedScores: RescueTimeData | undefined;

  async getScores(): Promise<RescueTimeData> {
    const twentyMins = 20 * 60 * 1000;
    const now = Date.now();
    if (this.cachedScores && now - this.lastTime < twentyMins) {
      console.log('Using cached RescueTime data');
      return this.cachedScores;
    }

    const key = process.env.RT_API_KEY;
    if (!key) {
      throw new Error('RT_API_KEY is not set');
    }

    const day = new Date();
    day.setHours(day.getHours() - 4);
    const dayString = day.toISOString().slice(0, 10);
    const apiString =
      `https://www.rescuetime.com/anapi/data?key=${key}` +
      `&by=interval&rk=productivity&interval=day` +
      `&restrict_begin=${dayString}&format=json`;

    console.log(`Fetching RescueTime data for ${dayString}`);
    const response = await fetch(apiString);
    if (!response.ok) {
      throw new Error(`RescueTime API fetch failed: ${response.status}`);
    }

    this.lastTime = now;
    this.cachedScores = (await response.json()) as RescueTimeData;
    return this.cachedScores;
  }

  calculateProductivityPulse(data: RescueTimeData): number {
    let weightedTotal = 0;
    let total = 0;

    for (const row of data.rows) {
      const time = row[1];
      const prod = row[3];
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
}
