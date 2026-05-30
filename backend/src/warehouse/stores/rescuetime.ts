import type {
  RescueTimeDailyUserSummary,
  RescueTimeDeviceSeconds,
  RescueTimeProductivityScore,
  RescueTimeTopActivities,
} from '../../shared/rescuetime-types.js';
import { getSupabase } from '../supabase/client.js';

type StoredRow = {
  syncedAt: string;
};

export async function getStoredDailyUserSummary(
  date: string,
): Promise<(RescueTimeDailyUserSummary & StoredRow) | null> {
  const { data, error } = await getSupabase()
    .from('daily_rescuetime_user_summary')
    .select('*')
    .eq('date', date)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    date: data.date,
    productivityPulse: data.productivity_pulse,
    totalTrackedSeconds: data.total_tracked_seconds,
    programmingSeconds: data.programming_seconds,
    productivityByLevel: {
      veryProductiveSeconds: data.very_productive_seconds,
      productiveSeconds: data.productive_seconds,
      neutralSeconds: data.neutral_seconds,
      unproductiveSeconds: data.unproductive_seconds,
      veryUnproductiveSeconds: data.very_unproductive_seconds,
      uncategorizedSeconds: data.uncategorized_seconds,
    },
    syncedAt: data.synced_at,
  };
}

export async function getStoredProductivityPulse(
  date: string,
): Promise<{ value: number; syncedAt: string } | null> {
  const summary = await getStoredDailyUserSummary(date);
  if (!summary) return null;
  return { value: summary.productivityPulse, syncedAt: summary.syncedAt };
}

export async function getStoredTopActivities(
  date: string,
  limit: number,
): Promise<(RescueTimeTopActivities & StoredRow) | null> {
  const { data, error } = await getSupabase()
    .from('daily_rescuetime_top_activities')
    .select('*')
    .eq('date', date)
    .order('rank', { ascending: true })
    .limit(limit);

  if (error) throw error;
  if (!data || data.length === 0) return null;

  const syncedAt = data.reduce(
    (latest, row) =>
      row.synced_at > latest ? row.synced_at : latest,
    data[0].synced_at,
  );

  return {
    date,
    activities: data.map((row) => ({
      rank: row.rank,
      name: row.name,
      category: row.category,
      seconds: row.seconds,
      productivity: row.productivity as RescueTimeProductivityScore,
    })),
    syncedAt,
  };
}

export async function getStoredDeviceSeconds(
  date: string,
): Promise<(RescueTimeDeviceSeconds & StoredRow) | null> {
  const { data, error } = await getSupabase()
    .from('daily_rescuetime_device_seconds')
    .select('*')
    .eq('date', date)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    date: data.date,
    desktopSeconds: data.desktop_seconds,
    mobileSeconds: data.mobile_seconds,
    syncedAt: data.synced_at,
  };
}

export async function upsertRescueTimeDay(
  summary: RescueTimeDailyUserSummary,
  topActivities: RescueTimeTopActivities,
  deviceSeconds: RescueTimeDeviceSeconds,
): Promise<void> {
  const supabase = getSupabase();
  const syncedAt = new Date().toISOString();
  const date = summary.date;

  const { error: summaryError } = await supabase
    .from('daily_rescuetime_user_summary')
    .upsert({
      date,
      productivity_pulse: summary.productivityPulse,
      total_tracked_seconds: summary.totalTrackedSeconds,
      programming_seconds: summary.programmingSeconds,
      very_productive_seconds: summary.productivityByLevel.veryProductiveSeconds,
      productive_seconds: summary.productivityByLevel.productiveSeconds,
      neutral_seconds: summary.productivityByLevel.neutralSeconds,
      unproductive_seconds: summary.productivityByLevel.unproductiveSeconds,
      very_unproductive_seconds:
        summary.productivityByLevel.veryUnproductiveSeconds,
      uncategorized_seconds: summary.productivityByLevel.uncategorizedSeconds,
      synced_at: syncedAt,
    });
  if (summaryError) throw summaryError;

  if (topActivities.activities.length === 0) {
    const { error: clearError } = await supabase
      .from('daily_rescuetime_top_activities')
      .delete()
      .eq('date', date);
    if (clearError) throw clearError;
  } else {
    const { error: activitiesError } = await supabase
      .from('daily_rescuetime_top_activities')
      .upsert(
        topActivities.activities.map((activity) => ({
          date,
          rank: activity.rank,
          name: activity.name,
          category: activity.category,
          seconds: activity.seconds,
          productivity: activity.productivity,
          synced_at: syncedAt,
        })),
        { onConflict: 'date,rank' },
      );
    if (activitiesError) throw activitiesError;

    const { error: pruneError } = await supabase
      .from('daily_rescuetime_top_activities')
      .delete()
      .eq('date', date)
      .gt('rank', topActivities.activities.length);
    if (pruneError) throw pruneError;
  }

  const { error: deviceError } = await supabase
    .from('daily_rescuetime_device_seconds')
    .upsert({
      date,
      desktop_seconds: deviceSeconds.desktopSeconds,
      mobile_seconds: deviceSeconds.mobileSeconds,
      synced_at: syncedAt,
    });
  if (deviceError) throw deviceError;
}
