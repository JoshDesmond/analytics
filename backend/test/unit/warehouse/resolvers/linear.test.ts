import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { LinearCycleScores } from '../../../../src/shared/linear-types.js';

vi.mock('../../../../src/warehouse/stores/linear.js', () => ({
  upsertLinearCycleScores: vi.fn(),
}));

vi.mock('../../../../src/integrations/linear/reader/cycleScores.js', () => ({
  fetchCycleScores: vi.fn(),
}));

import { fetchCycleScores } from '../../../../src/integrations/linear/reader/cycleScores.js';
import { upsertLinearCycleScores } from '../../../../src/warehouse/stores/linear.js';
import { resolveCycleScores } from '../../../../src/warehouse/resolvers/linear.js';

const liveScores: LinearCycleScores = {
  this_week: {
    name: 'Cycle 12',
    number: 12,
    starts_at: '2026-05-26T00:00:00.000Z',
    ends_at: '2026-06-02T00:00:00.000Z',
    points_scoped: 10,
    points_completed: 4,
  },
  last_week: null,
};

describe('Linear resolvers', () => {
  const reference = new Date('2026-05-30T12:00:00.000Z');

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchCycleScores).mockResolvedValue(liveScores);
    vi.mocked(upsertLinearCycleScores).mockResolvedValue(undefined);
  });

  it('always fetches live cycle scores and upserts a snapshot', async () => {
    const scores = await resolveCycleScores(reference);

    expect(scores).toEqual(liveScores);
    expect(fetchCycleScores).toHaveBeenCalledTimes(1);
    expect(upsertLinearCycleScores).toHaveBeenCalledWith('2026-05-30', liveScores);
  });
});
