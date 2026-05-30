import { describe, expect, it } from 'vitest';
import { fetchCycleScores } from '../../../src/integrations/linear/reader/cycleScores.js';
import { delay } from '../helpers/delay.js';
import { hasEnv } from '../helpers/env.js';

describe.skipIf(!hasEnv('LINEAR_API_KEY'))('Linear reader integration', () => {
  it('reads cycle scores', async () => {
    const scores = await fetchCycleScores();
    expect(scores).toHaveProperty('this_week');
    expect(scores).toHaveProperty('last_week');
    await delay();
  });
});
