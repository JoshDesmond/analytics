import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

vi.mock('../../../../src/warehouse/stores/rescuetime.js', () => ({
  getStoredDailyUserSummary: vi.fn(),
  getStoredDeviceSeconds: vi.fn(),
  getStoredProductivityPulse: vi.fn(),
  getStoredTopActivities: vi.fn(),
}));

vi.mock('../../../../src/warehouse/sync/daily.js', () => ({
  syncRescueTimeDay: vi.fn(),
}));

vi.mock('../../../../src/integrations/rescuetime/reader/productivityPulse.js', () => ({
  fetchProductivityPulse: vi.fn(),
}));

import { fetchProductivityPulse } from '../../../../src/integrations/rescuetime/reader/productivityPulse.js';
import { syncRescueTimeDay } from '../../../../src/warehouse/sync/daily.js';
import { getStoredProductivityPulse } from '../../../../src/warehouse/stores/rescuetime.js';
import { createApp } from '../../../../src/app.js';

describe('warehouse cache behavior via HTTP', () => {
  const app = createApp();
  const pastDate = '2020-01-01';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(syncRescueTimeDay).mockResolvedValue(undefined);
    vi.mocked(fetchProductivityPulse).mockResolvedValue(99);
  });

  it('checks warehouse cache for past dates before syncing integration data', async () => {
    vi.mocked(getStoredProductivityPulse).mockResolvedValue({
      value: 65,
      syncedAt: new Date().toISOString(),
    });

    const response = await request(app)
      .get(`/api/rescuetime/productivity-pulse?date=${pastDate}`)
      .expect(200);

    expect(response.body).toBe(65);
    expect(getStoredProductivityPulse).toHaveBeenCalledWith(pastDate);
    expect(syncRescueTimeDay).not.toHaveBeenCalled();
    expect(fetchProductivityPulse).not.toHaveBeenCalled();
  });

  it('avoids triple integration sync when warehouse is populated after first miss', async () => {
    let warehouseReads = 0;
    vi.mocked(getStoredProductivityPulse).mockImplementation(async () => {
      warehouseReads += 1;
      if (warehouseReads <= 1) return null;
      return { value: 55, syncedAt: new Date().toISOString() };
    });

    await request(app)
      .get(`/api/rescuetime/productivity-pulse?date=${pastDate}`)
      .expect(200);
    await request(app)
      .get(`/api/rescuetime/productivity-pulse?date=${pastDate}`)
      .expect(200);
    await request(app)
      .get(`/api/rescuetime/productivity-pulse?date=${pastDate}`)
      .expect(200);

    expect(syncRescueTimeDay).toHaveBeenCalledTimes(1);
    expect(fetchProductivityPulse).not.toHaveBeenCalled();
  });
});
