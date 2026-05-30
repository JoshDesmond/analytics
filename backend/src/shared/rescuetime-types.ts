export type RescueTimeProductivityScore = -2 | -1 | 0 | 1 | 2;

export interface RescueTimeDailyUserSummary {
  date: string;
  productivityPulse: number;
  totalTrackedSeconds: number;
  programmingSeconds: number;
  productivityByLevel: {
    veryProductiveSeconds: number;
    productiveSeconds: number;
    neutralSeconds: number;
    unproductiveSeconds: number;
    veryUnproductiveSeconds: number;
    uncategorizedSeconds: number;
  };
}

export interface RescueTimeTopActivity {
  rank: number;
  name: string;
  category: string;
  seconds: number;
  productivity: RescueTimeProductivityScore;
}

export interface RescueTimeTopActivities {
  date: string;
  activities: RescueTimeTopActivity[];
}

export interface RescueTimeDeviceSeconds {
  date: string;
  desktopSeconds: number;
  mobileSeconds: number;
}
