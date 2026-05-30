/**
 * Parses an optional Express `date` query param (`YYYY-MM-DD`).
 *
 * @returns `undefined` when the param is absent or empty.
 * @throws When present but not a valid ISO calendar date string.
 */
export function parseOptionalDateQuery(value: unknown): string | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error('date must be YYYY-MM-DD');
  }
  return value;
}
