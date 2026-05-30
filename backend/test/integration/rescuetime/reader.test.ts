import { describe, expect, it } from 'vitest';
import { fetchDailyUserSummary } from '../../../src/integrations/rescuetime/reader/dailyUserSummary.js';
import { fetchDeviceSeconds } from '../../../src/integrations/rescuetime/reader/deviceSeconds.js';
import { fetchProductivityPulse } from '../../../src/integrations/rescuetime/reader/productivityPulse.js';
import { fetchTopActivities } from '../../../src/integrations/rescuetime/reader/topActivities.js';
import { getRescueTimeReportDate } from '../../../src/integrations/rescuetime/date.js';
import { delay } from '../helpers/delay.js';
import { hasEnv } from '../helpers/env.js';

describe.skipIf(!hasEnv('RT_API_KEY'))('RescueTime reader integration', () => {
  const date = getRescueTimeReportDate(
    new Date(Date.now() - 86_400_000),
  );

  it('reads productivity pulse', async () => {
    const pulse = await fetchProductivityPulse(date);
    expect(typeof pulse).toBe('number');
    expect(pulse).toBeGreaterThanOrEqual(0);
    expect(pulse).toBeLessThanOrEqual(100);
    await delay();
  });

  it('reads daily user summary', async () => {
    const summary = await fetchDailyUserSummary(date);
    expect(summary.date).toBe(date);
    expect(summary.totalTrackedSeconds).toBeGreaterThanOrEqual(0);
    await delay();
  });

  it('reads top activities', async () => {
    const top = await fetchTopActivities(date, 3);
    expect(top.date).toBe(date);
    expect(top.activities.length).toBeGreaterThan(0);
    expect(top.activities.length).toBeLessThanOrEqual(3);
    await delay();
  });

  it('reads device seconds', async () => {
    const devices = await fetchDeviceSeconds(date);
    expect(devices.date).toBe(date);
    expect(devices.desktopSeconds).toBeGreaterThanOrEqual(0);
    expect(devices.mobileSeconds).toBeGreaterThanOrEqual(0);
  });
});
