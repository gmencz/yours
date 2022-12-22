export type UnauthorizedStackParamList = {
  Welcome: undefined;
  CreateAccount: undefined;
  LinkSignIn: undefined;
  EmailSignIn: undefined;
};

export type CompletedProfileStackParamList = {
  Home: undefined;
  Insights: {
    screen: keyof InsightsStackParamList;
  };
  Strategy: undefined;
  Food: {
    screen: keyof FoodTabStackParamList;
  };
};

export type UncompletedProfileStackParamList = {
  BasalEnergyExpenditure: undefined;
  Goal: undefined;
};

export type QuickAddStackParamList = {
  RequiredDetails: undefined;
  NutritionFacts: undefined;
  Barcode: undefined;
};

export type FoodTabStackParamList = {
  Barcode: undefined;
  Search: undefined;
  QuickAdd: undefined;
};

export type InsightsStackParamList = {
  EnergyExpenditure: undefined;
  Weight: undefined;
};

export enum WeekDay {
  Sunday,
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
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
