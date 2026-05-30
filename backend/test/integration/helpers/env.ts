export function hasEnv(...keys: string[]): boolean {
  return keys.every((key) => Boolean(process.env[key]?.trim()));
}

export function hasSupabaseEnv(): boolean {
  const url = process.env.SUPABASE_URL?.trim();
  const id = process.env.SUPABASE_ID?.trim();
  const key =
    process.env.SUPABASE_SECRET_KEY?.trim() ??
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return Boolean((url || id) && key);
}
