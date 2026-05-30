import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import ws from 'ws';

let client: SupabaseClient | undefined;

function resolveSupabaseConfig(): { url: string; key: string } {
  const url =
    process.env.SUPABASE_URL ??
    (process.env.SUPABASE_ID
      ? `https://${process.env.SUPABASE_ID}.supabase.co`
      : undefined);

  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) {
    throw new Error(
      'Supabase env required: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY, or SUPABASE_ID + SUPABASE_SECRET_KEY',
    );
  }

  return { url, key };
}

/** Server-side Supabase client (uses secret / service role key). */
export function getSupabase(): SupabaseClient {
  if (client) return client;

  const { url, key } = resolveSupabaseConfig();
  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    ...(typeof WebSocket === 'undefined'
      ? { realtime: { transport: ws as typeof WebSocket } }
      : {}),
  });
  return client;
}
