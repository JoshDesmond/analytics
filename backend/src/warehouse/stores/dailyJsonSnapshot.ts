import type {
  DailyJsonSnapshotPayloads,
  DailyJsonSnapshotTable,
  StoredDailyJsonSnapshot,
} from '../../shared/daily-snapshot-types.js';
import { getSupabase } from '../supabase/client.js';

export async function getDailyJsonSnapshot<TTable extends DailyJsonSnapshotTable>(
  table: TTable,
  date: string,
): Promise<StoredDailyJsonSnapshot<DailyJsonSnapshotPayloads[TTable]> | null> {
  const { data, error } = await getSupabase()
    .from(table)
    .select('payload, synced_at')
    .eq('date', date)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    ...(data.payload as DailyJsonSnapshotPayloads[TTable]),
    syncedAt: data.synced_at,
  };
}

export async function upsertDailyJsonSnapshot<TTable extends DailyJsonSnapshotTable>(
  table: TTable,
  date: string,
  payload: DailyJsonSnapshotPayloads[TTable],
): Promise<void> {
  const { error } = await getSupabase()
    .from(table)
    .upsert({
      date,
      payload,
      synced_at: new Date().toISOString(),
    });
  if (error) throw error;
}
