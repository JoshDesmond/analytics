import { describe, expect, it } from 'vitest';
import {
  isTodayIsoDate,
  shouldReadFromWarehouse,
} from '../../../../src/warehouse/lib/freshness.js';

describe('shouldReadFromWarehouse', () => {
  const reference = new Date('2026-05-30T12:00:00.000Z');

  it('reads past dates from warehouse', () => {
    expect(shouldReadFromWarehouse('2026-05-29', reference)).toBe(true);
    expect(shouldReadFromWarehouse('2020-01-01', reference)).toBe(true);
  });

  it('does not read today from warehouse before live refresh', () => {
    expect(shouldReadFromWarehouse('2026-05-30', reference)).toBe(false);
  });
});

describe('isTodayIsoDate', () => {
  const reference = new Date('2026-05-30T12:00:00.000Z');

  it('matches the UTC calendar day', () => {
    expect(isTodayIsoDate('2026-05-30', reference)).toBe(true);
    expect(isTodayIsoDate('2026-05-29', reference)).toBe(false);
  });
});
