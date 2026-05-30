export interface CycleProgress {
  name: string | null;
  number: number;
  starts_at: string;
  ends_at: string;
  points_scoped: number;
  points_completed: number;
}

export interface LinearCycleScores {
  this_week: CycleProgress | null;
  last_week: CycleProgress | null;
}
