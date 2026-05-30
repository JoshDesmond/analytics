import type { SheetsEntry } from '../../../shared/google-sheets-types.js';

export type Entry = SheetsEntry;

const COLS = {
  date: 1,
  successfulPomodoros: 2,
  workQuality: 4,
  overallProductivity: 5,
  meditation: 6,
  exercise: 7,
  noSnooze: 8,
  compositeScore: 9,
  workScore: 10,
  enjoymentNovelty: 11,
  notes: 12,
  sickness: 13,
} as const;

export function rowToEntry(row: string[]): Entry {
  const cell = (i: number) => row[i] ?? '';
  const num = (i: number) => Number(cell(i)) || 0;
  const bool = (i: number) => cell(i) === 'TRUE';

  return {
    date: cell(COLS.date),
    successfulPomodoros: num(COLS.successfulPomodoros),
    workQuality: num(COLS.workQuality),
    overallProductivity: num(COLS.overallProductivity),
    meditation: bool(COLS.meditation),
    exercise: bool(COLS.exercise),
    noSnooze: bool(COLS.noSnooze),
    compositeScore: num(COLS.compositeScore),
    workScore: num(COLS.workScore),
    enjoymentNovelty: num(COLS.enjoymentNovelty),
    notes: cell(COLS.notes),
    sickness: cell(COLS.sickness),
  };
}
