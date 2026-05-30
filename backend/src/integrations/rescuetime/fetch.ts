/**
 * Authenticated JSON fetch for RescueTime HTTP APIs (`anapi/*` and `/api/resource/*`).
 */
export async function fetchRescueTimeJson<T>(url: string): Promise<T> {
  const key = process.env.RT_API_KEY;
  if (!key) {
    throw new Error('RT_API_KEY is not set');
  }

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!response.ok) {
    throw new Error(`RescueTime API fetch failed: ${response.status} ${url}`);
  }
  return (await response.json()) as T;
}
