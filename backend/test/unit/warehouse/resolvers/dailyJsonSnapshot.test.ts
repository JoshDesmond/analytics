import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AllDailysResponse } from '../../../../src/shared/habitica-types.js';

vi.mock('../../../../src/warehouse/stores/dailyJsonSnapshot.js', () => ({
  getDailyJsonSnapshot: vi.fn(),
  upsertDailyJsonSnapshot: vi.fn(),
}));

import {
  getDailyJsonSnapshot,
  upsertDailyJsonSnapshot,
} from '../../../../src/warehouse/stores/dailyJsonSnapshot.js';
import { resolveDailyJsonSnapshot } from '../../../../src/warehouse/resolvers/dailyJsonSnapshot.js';

const reference = new Date('2026-05-30T12:00:00.000Z');
const pastDate = '2020-01-01';
const payload: AllDailysResponse = {
  date: pastDate,
  dueToday: [{ id: 'abc', name: 'Stretch', completed: false }],
  other: [],
};

describe('resolveDailyJsonSnapshot', () => {
  const fetchLive = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    fetchLive.mockResolvedValue(payload);
    vi.mocked(upsertDailyJsonSnapshot).mockResolvedValue(undefined);
  });

  it('returns warehouse data for past dates without calling integrations', async () => {
    vi.mocked(getDailyJsonSnapshot).mockResolvedValue({
      ...payload,
      syncedAt: new Date().toISOString(),
    });

    const result = await resolveDailyJsonSnapshot(
      'daily_habitica_dailys',
      pastDate,
      fetchLive,
      reference,
    );

    expect(result).toEqual(payload);
    expect(fetchLive).not.toHaveBeenCalled();
    expect(upsertDailyJsonSnapshot).not.toHaveBeenCalled();
  });

  it('backfills past dates once, then serves warehouse for repeat reads', async () => {
    let readCount = 0;
    vi.mocked(getDailyJsonSnapshot).mockImplementation(async () => {
      readCount += 1;
      if (readCount === 1) return null;
      return { ...payload, syncedAt: new Date().toISOString() };
    });

    await resolveDailyJsonSnapshot(
      'daily_habitica_dailys',
      pastDate,
      fetchLive,
      reference,
    );
    await resolveDailyJsonSnapshot(
      'daily_habitica_dailys',
      pastDate,
      fetchLive,
      reference,
    );
    await resolveDailyJsonSnapshot(
      'daily_habitica_dailys',
      pastDate,
      fetchLive,
      reference,
    );

    expect(fetchLive).toHaveBeenCalledTimes(1);
    expect(upsertDailyJsonSnapshot).toHaveBeenCalledTimes(1);
  });

  it('always fetches live data for today', async () => {
    const todayPayload = { ...payload, date: '2026-05-30' };
    fetchLive.mockResolvedValue(todayPayload);

    await resolveDailyJsonSnapshot(
      'daily_habitica_dailys',
      '2026-05-30',
      fetchLive,
      reference,
    );

    expect(getDailyJsonSnapshot).not.toHaveBeenCalled();
    expect(fetchLive).toHaveBeenCalledTimes(1);
    expect(upsertDailyJsonSnapshot).toHaveBeenCalledTimes(1);
  });
});
