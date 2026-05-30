import { beforeEach, describe, expect, it, vi } from 'vitest';

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
import { resolveProductivityPulse } from '../../../../src/warehouse/resolvers/rescuetime.js';

const reference = new Date('2026-05-30T12:00:00.000Z');
const pastDate = '2020-01-01';
const todayDate = '2026-05-30';

describe('RescueTime resolvers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns warehouse data for past dates without syncing', async () => {
    vi.mocked(getStoredProductivityPulse).mockResolvedValue({
      value: 72,
      syncedAt: new Date().toISOString(),
    });

    const pulse = await resolveProductivityPulse(pastDate, reference);

    expect(pulse).toBe(72);
    expect(syncRescueTimeDay).not.toHaveBeenCalled();
    expect(fetchProductivityPulse).not.toHaveBeenCalled();
  });

  it('syncs once on past-date miss, then serves warehouse without integration fallback', async () => {
    let readCount = 0;
    vi.mocked(getStoredProductivityPulse).mockImplementation(async () => {
      readCount += 1;
      if (readCount === 1) return null;
      return { value: 72, syncedAt: new Date().toISOString() };
    });
    vi.mocked(syncRescueTimeDay).mockResolvedValue(undefined);

    await resolveProductivityPulse(pastDate, reference);
    await resolveProductivityPulse(pastDate, reference);
    await resolveProductivityPulse(pastDate, reference);

    expect(syncRescueTimeDay).toHaveBeenCalledTimes(1);
    expect(fetchProductivityPulse).not.toHaveBeenCalled();
  });

  it('always refreshes today through sync before reading warehouse', async () => {
    vi.mocked(getStoredProductivityPulse).mockResolvedValue({
      value: 80,
      syncedAt: new Date().toISOString(),
    });
    vi.mocked(syncRescueTimeDay).mockResolvedValue(undefined);

    await resolveProductivityPulse(todayDate, reference);

    expect(syncRescueTimeDay).toHaveBeenCalledWith(todayDate);
    expect(fetchProductivityPulse).not.toHaveBeenCalled();
  });

  it('falls back to integration reader when sync does not populate warehouse', async () => {
    vi.mocked(getStoredProductivityPulse).mockResolvedValue(null);
    vi.mocked(syncRescueTimeDay).mockResolvedValue(undefined);
    vi.mocked(fetchProductivityPulse).mockResolvedValue(41);

    const pulse = await resolveProductivityPulse(pastDate, reference);

    expect(pulse).toBe(41);
    expect(syncRescueTimeDay).toHaveBeenCalledTimes(1);
    expect(fetchProductivityPulse).toHaveBeenCalledTimes(1);
  });
});
