import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockClient } = vi.hoisted(() => ({
  mockClient: {
    fetchDailyUserSummaryRaw: vi.fn(),
    fetchRankedActivities: vi.fn(),
    fetchSourceTotalSeconds: vi.fn(),
    fetchDailyProductivityData: vi.fn(),
  },
}));

vi.mock('../../../../src/integrations/rescuetime/client.js', () => ({
  RescueTimeClient: vi.fn(function RescueTimeClient() {
    return mockClient;
  }),
}));

vi.mock('../../../../src/warehouse/stores/rescuetime.js', () => ({
  upsertRescueTimeDay: vi.fn(),
}));

import { upsertRescueTimeDay } from '../../../../src/warehouse/stores/rescuetime.js';
import { syncRescueTimeDay } from '../../../../src/warehouse/sync/daily.js';

describe('syncRescueTimeDay', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockClient.fetchDailyUserSummaryRaw.mockResolvedValue({
      date: '2026-05-29',
      productivity_pulse: 50,
      total_hours: 2,
      software_development_hours: 1,
      very_productive_hours: 0.5,
      productive_hours: 0.5,
      neutral_hours: 0.5,
      distracting_hours: 0.25,
      very_distracting_hours: 0.25,
      uncategorized_hours: 0,
    });
    mockClient.fetchRankedActivities.mockResolvedValue([
      [1, 1800, 1, 'Coding', 'Software Development', 2],
    ]);
    mockClient.fetchSourceTotalSeconds.mockResolvedValue(3600);
    mockClient.fetchDailyProductivityData.mockResolvedValue({
      notes: '',
      row_headers: ['Date', 'Time Spent (seconds)', 'Number of People', 'Productivity'],
      rows: [['2026-05-29', 3600, 1, 2]],
    });
    vi.mocked(upsertRescueTimeDay).mockResolvedValue(undefined);
  });

  it('deduplicates concurrent syncs for the same date', async () => {
    let upsertCount = 0;
    vi.mocked(upsertRescueTimeDay).mockImplementation(async () => {
      upsertCount += 1;
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    await Promise.all([
      syncRescueTimeDay('2026-05-29'),
      syncRescueTimeDay('2026-05-29'),
      syncRescueTimeDay('2026-05-29'),
    ]);

    expect(upsertRescueTimeDay).toHaveBeenCalledTimes(1);
    expect(upsertCount).toBe(1);
  });

  it('pulls integration data and upserts a warehouse day snapshot', async () => {
    await syncRescueTimeDay('2026-05-29');

    expect(mockClient.fetchDailyUserSummaryRaw).toHaveBeenCalledWith('2026-05-29');
    expect(mockClient.fetchRankedActivities).toHaveBeenCalledWith('2026-05-29');
    expect(mockClient.fetchSourceTotalSeconds).toHaveBeenCalledTimes(2);
    expect(mockClient.fetchDailyProductivityData).toHaveBeenCalledWith('2026-05-29');
    expect(upsertRescueTimeDay).toHaveBeenCalledTimes(1);

    const [summary, topActivities, deviceSeconds] = vi.mocked(upsertRescueTimeDay)
      .mock.calls[0]!;
    expect(summary.date).toBe('2026-05-29');
    expect(summary.productivityPulse).toBeGreaterThan(0);
    expect(topActivities.activities).toHaveLength(1);
    expect(deviceSeconds.desktopSeconds).toBe(3600);
    expect(deviceSeconds.mobileSeconds).toBe(3600);
  });
});
