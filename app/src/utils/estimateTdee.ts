import { Activity, Sex, MeasurementSystem, TrainingActivity } from "~/typings";

interface EstimateTdeeParams {
  preferedMeasurementSystem: MeasurementSystem;
  sex: Sex;
  activity: Activity;
  trainingActivity: TrainingActivity;
  weight: number;
  height: number;
  age: number;
}

export function estimateTdee({
  preferedMeasurementSystem,
  sex,
  activity,
  trainingActivity,
  weight,
  height,
  age,
}: EstimateTdeeParams) {
  let estimatedTdee: number;
  const tdeeMultiplier = activity + trainingActivity;
  if (preferedMeasurementSystem === "metric") {
    if (sex === "male") {
      estimatedTdee =
        (66.5 + 13.75 * weight! + 5.003 * height! - 6.775 * age!) *
        tdeeMultiplier;
    } else {
      estimatedTdee =
        (655.1 + 9.563 * weight! + 1.85 * height! - 4.676 * age!) *
        tdeeMultiplier;
    }
  } else {
    if (sex === "male") {
      estimatedTdee =
        (66 + 6.2 * weight! + 12.7 * height! - 6.76 * age!) * tdeeMultiplier;
    } else {
      estimatedTdee =
        (65.51 + 4.35 * weight! + 4.7 * height! - 4.7 * age!) * tdeeMultiplier;
    }
  }

  return Math.round(estimatedTdee);
}
