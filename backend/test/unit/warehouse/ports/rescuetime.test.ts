import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

vi.mock('../../../../src/warehouse/resolvers/rescuetime.js', () => ({
  defaultRescueTimeDate: vi.fn((value: unknown) =>
    value === undefined || value === null || value === '' ? '2026-05-29' : String(value),
  ),
  resolveDailyUserSummary: vi.fn(),
  resolveDeviceSeconds: vi.fn(),
  resolveProductivityPulse: vi.fn(),
  resolveTopActivities: vi.fn(),
}));

import {
  resolveDailyUserSummary,
  resolveProductivityPulse,
  resolveTopActivities,
} from '../../../../src/warehouse/resolvers/rescuetime.js';
import { createApp } from '../../../../src/app.js';

describe('RescueTime warehouse ports', () => {
  const app = createApp();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /api/rescuetime/productivity-pulse returns resolver output', async () => {
    vi.mocked(resolveProductivityPulse).mockResolvedValue(88);

    const response = await request(app)
      .get('/api/rescuetime/productivity-pulse?date=2026-05-29')
      .expect(200);

    expect(response.body).toBe(88);
    expect(resolveProductivityPulse).toHaveBeenCalledWith('2026-05-29');
  });

  it('GET /api/rescuetime/daily-user-summary returns resolver output', async () => {
    const summary = {
      date: '2026-05-29',
      productivityPulse: 70,
      totalTrackedSeconds: 100,
      programmingSeconds: 50,
      productivityByLevel: {
        veryProductiveSeconds: 10,
        productiveSeconds: 10,
        neutralSeconds: 10,
        unproductiveSeconds: 10,
        veryUnproductiveSeconds: 10,
        uncategorizedSeconds: 10,
      },
    };
    vi.mocked(resolveDailyUserSummary).mockResolvedValue(summary);

    const response = await request(app)
      .get('/api/rescuetime/daily-user-summary')
      .expect(200);

    expect(response.body).toEqual(summary);
  });

  it('three rapid warehouse queries reuse mocked resolver without extra integration work', async () => {
    vi.mocked(resolveTopActivities).mockResolvedValue({
      date: '2026-05-29',
      activities: [{ rank: 1, name: 'Coding', category: 'Dev', seconds: 100, productivity: 2 }],
    });

    await request(app).get('/api/rescuetime/top-activities?date=2026-05-29').expect(200);
    await request(app).get('/api/rescuetime/top-activities?date=2026-05-29').expect(200);
    await request(app).get('/api/rescuetime/top-activities?date=2026-05-29').expect(200);

    expect(resolveTopActivities).toHaveBeenCalledTimes(3);
  });
});
