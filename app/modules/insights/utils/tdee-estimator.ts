import { Profile } from "modules/auth/hooks/use-profile-query";
import { supabase } from "modules/supabase/client";
import { calculateWeightChange } from "./calculate-weight-change";

type StoredEstimation = {
  date_of_last_estimated_item: string;
};

type StoredCaloriesAndWeights = {
  calories: number;
  weight: number;
  created_at: string;
};

// This is the maximum calories we would add/subtract to the current estimation.
// If we made a bigger change than this it could be too big of a change so it's better
// to slowly adapt the calories even if it takes longer for some users.
const MAX_CALORIC_CHANGE = 200;

// In order for us to get a more reasonable estimation, we will only make the estimation
// when we have at least 10 days of data, this is because weight can fluctuate a lot
// and in 10 days we can get a more accurate fluctuation.
const MINIMUM_DAYS_OF_DATA = 10;

type CreateTdeeEstimationParams = {
  profile: Profile;
};

export async function runTdeeEstimator({
  profile,
}: CreateTdeeEstimationParams) {
  // Fetch the latest TDEE estimation.
  const { data: latestEstimations, error: latestEstimationsError } =
    await supabase
      .from("profiles_tdee_estimations")
      .select<string, StoredEstimation>("date_of_last_estimated_item")
      .eq("profile_id", profile.id)
      .limit(1)
      .order("created_at", { ascending: false });

  if (latestEstimationsError) {
    throw latestEstimationsError;
  }

  if (latestEstimations[0]) {
    const { date_of_last_estimated_item } = latestEstimations[0];
    // Fetch all of the user's inputted calories and weights since the last estimated item.
    const { data: caloriesAndWeights, error: caloriesAndWeightsError } =
      await supabase
        .from("profiles_calories_and_weights")
        .select<string, StoredCaloriesAndWeights>(
          "calories, weight, created_at"
        )
        .eq("profile_id", profile.id)
        .not("weight", "is", "null")
        .not("calories", "is", "null")
        .gt("created_at", date_of_last_estimated_item)
        .order("created_at", { ascending: true });

    if (caloriesAndWeightsError) {
      throw caloriesAndWeightsError;
    }

    // Check if there's at least `MINIMUM_DAYS_OF_DATA` since the last estimated item.
    if (caloriesAndWeights.length >= MINIMUM_DAYS_OF_DATA) {
      await supabase.from("profiles_tdee_estimations").insert({
        profile_id: profile.id,
        estimation: estimateNewTdee(caloriesAndWeights),
        date_of_last_estimated_item:
          caloriesAndWeights[caloriesAndWeights.length - 1].created_at,
      });
    }
  } else {
    // Fetch all of the user's inputted calories and weights since they started using the app, we are fetching
    // everything because we haven't made an estimate before.
    const { data: caloriesAndWeights, error: caloriesAndWeightsError } =
      await supabase
        .from("profiles_calories_and_weights")
        .select<string, StoredCaloriesAndWeights>(
          "calories, weight, created_at"
        )
        .eq("profile_id", profile.id)
        .not("weight", "is", "null")
        .not("calories", "is", "null")
        .order("created_at", { ascending: true });

    if (caloriesAndWeightsError) {
      throw caloriesAndWeightsError;
    }

    // Check if there's at least `MINIMUM_DAYS_OF_DATA` since the user started using the app.
    if (caloriesAndWeights.length >= MINIMUM_DAYS_OF_DATA) {
      await supabase.from("profiles_tdee_estimations").insert({
        profile_id: profile.id,
        estimation: estimateNewTdee(caloriesAndWeights),
        date_of_last_estimated_item:
          caloriesAndWeights[caloriesAndWeights.length - 1].created_at,
      });
    }
  }
}

function estimateNewTdee(caloriesAndWeights: StoredCaloriesAndWeights[]) {
  const weights = caloriesAndWeights.map(({ weight }) => weight);
  const weightChange = calculateWeightChange(weights);

  const totalCalories = caloriesAndWeights.reduce(
    (total, { calories }) => total + calories,
    0
  );

  const averageDailyCalories = totalCalories / caloriesAndWeights.length;

  let newTdeeEstimation: number;
  // If the average weight change is negative and the average calorie intake is less than the initial TDEE estimation,
  // it is likely that the initial TDEE estimation was too high.
  if (weightChange < 0) {
    // Need to increase calories, however we don't want to increase it by more than `MAX_CALORIC_CHANGE` even if the user
    // lost a lot of weight.
    const increaseCaloriesBy =
      MAX_CALORIC_CHANGE * (weightChange <= 1 ? weightChange : 1);

    newTdeeEstimation = averageDailyCalories + increaseCaloriesBy;
  }
  // Else if the the average weight change is positive and the average calorie intake is greater than the initial TDEE estimation,
  // it is likely that the initial TDEE estimation was too low.
  else if (weightChange > 0) {
    // Need to decrease calories, however we don't want to decrease it by more than `MAX_CALORIC_CHANGE` even if the user
    // gained a lot of weight.
    const decreaseCaloriesBy =
      MAX_CALORIC_CHANGE * (weightChange <= 1 ? weightChange : 1);

    newTdeeEstimation = averageDailyCalories - decreaseCaloriesBy;
  } else {
    // Weight didn't change, keep current calories.
    newTdeeEstimation = averageDailyCalories;
  }

  return newTdeeEstimation;
}
