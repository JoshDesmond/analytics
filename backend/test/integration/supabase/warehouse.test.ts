import { afterAll, describe, expect, it } from 'vitest';
import { getDailyJsonSnapshot } from '../../../src/warehouse/stores/dailyJsonSnapshot.js';
import { getSupabase } from '../../../src/warehouse/supabase/client.js';
import { delay } from '../helpers/delay.js';
import { hasSupabaseEnv } from '../helpers/env.js';

const TEST_DATE = '2099-01-01';
const TEST_TABLE = 'daily_habitica_dailys' as const;
const TEST_PAYLOAD = {
  date: TEST_DATE,
  dueToday: [{ id: 'integration-test', name: 'Test daily', completed: false }],
  other: [],
};

describe.skipIf(!hasSupabaseEnv())('Supabase warehouse integration', () => {
  afterAll(async () => {
    await getSupabase()
      .from(TEST_TABLE)
      .delete()
      .eq('date', TEST_DATE);
  });

  it('connects to Supabase', async () => {
    const { error } = await getSupabase().from(TEST_TABLE).select('date').limit(1);
    expect(error).toBeNull();
    await delay();
  });

  it('upserts a record, reads it back, then deletes it', async () => {
    const supabase = getSupabase();
    const syncedAt = new Date().toISOString();

    const { error: upsertError } = await supabase.from(TEST_TABLE).upsert({
      date: TEST_DATE,
      payload: TEST_PAYLOAD,
      synced_at: syncedAt,
    });
    expect(upsertError).toBeNull();
    await delay();

    const stored = await getDailyJsonSnapshot(TEST_TABLE, TEST_DATE);
    expect(stored).not.toBeNull();
    expect(stored?.dueToday[0]?.id).toBe('integration-test');
    expect(stored?.syncedAt).toBeTruthy();
    await delay();

    const { error: deleteError } = await supabase
      .from(TEST_TABLE)
      .delete()
      .eq('date', TEST_DATE);
    expect(deleteError).toBeNull();
    await delay();

    const afterDelete = await getDailyJsonSnapshot(TEST_TABLE, TEST_DATE);
    expect(afterDelete).toBeNull();
  });
});
