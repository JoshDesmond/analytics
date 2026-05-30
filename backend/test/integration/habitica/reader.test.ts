import { describe, expect, it } from 'vitest';
import { fetchTodaysDailys } from '../../../src/integrations/habitica/reader/dailys.js';
import { delay } from '../helpers/delay.js';
import { hasEnv } from '../helpers/env.js';

describe.skipIf(
  !hasEnv('HABITICA_USER_ID', 'HABITICA_API_KEY'),
)('Habitica reader integration', () => {
  it('reads today\'s dailys', async () => {
    const dailys = await fetchTodaysDailys();
    expect(dailys.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(Array.isArray(dailys.dueToday)).toBe(true);
    expect(Array.isArray(dailys.other)).toBe(true);
    await delay();
  });
});
