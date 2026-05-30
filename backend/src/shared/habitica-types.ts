export interface DailySummary {
  id: string;
  name: string;
  completed: boolean;
}

export interface AllDailysResponse {
  date: string;
  dueToday: DailySummary[];
  other: DailySummary[];
}

export interface SetDailyCompletedBody {
  completed: boolean;
}
