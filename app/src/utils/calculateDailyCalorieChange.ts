export function calculateDailyCalorieChange(
  weightUnit: "lbs" | "kgs",
  desiredWeightGain: number
) {
  // Calculate the number of calories needed to gain 1 pound or 1 kilogram
  const caloriesPerPound = 3500;
  const caloriesPerKilogram = 7700;

  // Calculate the total number of calories needed to gain the desired weight
  let caloriesToGain: number;
  if (weightUnit === "lbs") {
    caloriesToGain = desiredWeightGain * caloriesPerPound;
  } else {
    caloriesToGain = desiredWeightGain * caloriesPerKilogram;
  }

  // Calculate the total number of daily calories needed to achieve the desired weight gain in a week
  const dailyCalorieIncrease = caloriesToGain / 7;
  return dailyCalorieIncrease;
}
