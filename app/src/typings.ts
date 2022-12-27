import "@rneui/themed";

declare module "@rneui/themed" {
  export interface Colors {
    secondary2: string;
    secondary3: string;
    secondary4: string;
    secondary5: string;
    yellow: string;
  }
}

export type UnauthorizedStackParamList = {
  ClosedBetaAuth: undefined;
};

export type CompletedProfileStackParamList = {
  Home: undefined;
  Insights: {
    screen: keyof InsightsStackParamList;
  };
  Strategy: undefined;
  Profile: undefined;
};

export type UncompletedProfileStackParamList = {
  StepOne: undefined;
  StepTwo: undefined;
};

export type InsightsStackParamList = {
  EnergyExpenditure: undefined;
  Weight: undefined;
};

export enum WeekDay {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
}

export const weekDaysWithNames = {
  [WeekDay.Sunday]: "SUNDAY",
  [WeekDay.Monday]: "MONDAY",
  [WeekDay.Tuesday]: "TUESDAY",
  [WeekDay.Wednesday]: "WEDNESDAY",
  [WeekDay.Thursday]: "THURSDAY",
  [WeekDay.Friday]: "FRIDAY",
  [WeekDay.Saturday]: "SATURDAY",
};

export enum Activity {
  Low = 1.2,
  Moderate = 1.4,
  High = 1.6,
}

export enum TrainingActivity {
  ZeroWeeklySessions = 0,
  OneToThreeWeeklySessions = 0.1,
  FourToSixWeeklySessions = 0.2,
  SevenPlusWeeklySessions = 0.3,
}

export type MeasurementSystem = "metric" | "imperial";
export type Gender = "male" | "female";
