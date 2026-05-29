export interface SetDailyCompletedBody {
  completed: boolean;
}

export function parseSetDailyCompletedBody(
  body: unknown,
): SetDailyCompletedBody | null {
  if (body === null || typeof body !== 'object') return null;
  const completed = (body as { completed?: unknown }).completed;
  if (typeof completed !== 'boolean') return null;
  return { completed };
}
