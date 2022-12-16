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

type EstimateTdee = {
  preferedMeasurementSystem: "metric" | "imperial";
  gender: "man" | "woman";
  activity: Activity;
  trainingActivity: TrainingActivity;
  weight: number;
  height: number;
  age: number;
};

export function estimateTdee({
  preferedMeasurementSystem,
  gender,
  activity,
  trainingActivity,
  weight,
  height,
  age,
}: EstimateTdee) {
  let estimatedTdee: number;
  const tdeeMultiplier = activity + trainingActivity;
  if (preferedMeasurementSystem === "metric") {
    if (gender === "man") {
      estimatedTdee =
        (66.5 + 13.75 * weight! + 5.003 * height! - 6.775 * age!) *
        tdeeMultiplier;
    } else {
      estimatedTdee =
        (655.1 + 9.563 * weight! + 1.85 * height! - 4.676 * age!) *
        tdeeMultiplier;
    }
  } else {
    if (gender === "man") {
      estimatedTdee =
        (66 + 6.2 * weight! + 12.7 * height! - 6.76 * age!) * tdeeMultiplier;
    } else {
      estimatedTdee =
        (65.51 + 4.35 * weight! + 4.7 * height! - 4.7 * age!) * tdeeMultiplier;
    }
  }

  return Math.round(estimatedTdee);
}
