import { describe, expect, it } from 'vitest';
import { fetchTodaysDailys } from '../../../src/integrations/habitica/reader/dailys.js';
import { setDailyCompleted } from '../../../src/integrations/habitica/writer/service.js';
import { delay } from '../helpers/delay.js';
import { hasEnv } from '../helpers/env.js';

describe.skipIf(
  !hasEnv('HABITICA_USER_ID', 'HABITICA_API_KEY'),
)('Habitica writer integration', () => {
  it('writes, reads back, then undoes the write', async () => {
    const before = await fetchTodaysDailys();
    await delay();

    const target =
      before.dueToday[0] ??
      before.other.find((daily) => daily.id) ??
      null;
    expect(target, 'need at least one daily task to exercise writer').not.toBeNull();
    if (!target) return;

    const originalCompleted = target.completed;
    const toggledCompleted = !originalCompleted;

    await setDailyCompleted(target.id, { completed: toggledCompleted });
    await delay();

    const afterWrite = await fetchTodaysDailys();
    await delay();
    const written = [...afterWrite.dueToday, ...afterWrite.other].find(
      (daily) => daily.id === target.id,
    );
    expect(written?.completed).toBe(toggledCompleted);

    await setDailyCompleted(target.id, { completed: originalCompleted });
    await delay();

    const afterUndo = await fetchTodaysDailys();
    const restored = [...afterUndo.dueToday, ...afterUndo.other].find(
      (daily) => daily.id === target.id,
    );
    expect(restored?.completed).toBe(originalCompleted);
  });
});
