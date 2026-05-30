export type SheetsEntry = {
  date: string;
  successfulPomodoros: number;
  workQuality: number;
  overallProductivity: number;
  meditation: boolean;
  exercise: boolean;
  noSnooze: boolean;
  compositeScore: number;
  workScore: number;
  enjoymentNovelty: number;
  notes: string;
  sickness: string;
};

export type SheetsEntryResponse = {
  date: string;
  tab: string | null;
  entry: SheetsEntry | null;
};

export type SheetsTab = {
  title: string;
  gid: number;
};
