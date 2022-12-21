import { Profile } from "modules/auth/hooks/use-profile-query";
import { supabase } from "modules/supabase/client";
import { smoothOutWeights } from "./smooth-out-weights";

type StoredEstimation = {
  date_of_first_estimated_item: string;
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
// when we have at least 7 days of data, this is because weight can fluctuate a lot
// and in 7 days we can get a more accurate fluctuation.
const MINIMUM_DAYS_OF_DATA = 7;

type CreateTdeeEstimationParams = {
  profile: Profile;
  dateStringFilter?: string;
};

export async function runTdeeEstimator({
  profile,
  dateStringFilter,
}: CreateTdeeEstimationParams) {
  // dateStringFilter is only specified when we want to run the estimator for a specific range in time.
  // This is useful when a user updates some day's data and we need to update the estimation for the range in time
  // of that day so basically if dateStringFilter exists, fetch the estimation for that filter and update it.
  let existingEstimation;
  if (dateStringFilter) {
    const { data: existingEstimations, error: existingEstimationsError } =
      await supabase
        .from("profiles_tdee_estimations")
        .select<string, StoredEstimation & { id: number }>(
          "id, date_of_first_estimated_item, date_of_last_estimated_item"
        )
        .eq("profile_id", profile.id)
        .lte("date_of_first_estimated_item", dateStringFilter)
        .gte("date_of_last_estimated_item", dateStringFilter)
        .limit(1);

    if (existingEstimationsError) {
      throw existingEstimationsError;
    }

    if (existingEstimations[0]) {
      existingEstimation = existingEstimations[0];
    }
  }

  if (existingEstimation) {
    // Update it
    const { data: caloriesAndWeights, error: caloriesAndWeightsError } =
      await supabase
        .from("profiles_calories_and_weights")
        .select<string, StoredCaloriesAndWeights>(
          "calories, weight, created_at"
        )
        .eq("profile_id", profile.id)
        .not("weight", "is", "null")
        .not("calories", "is", "null")
        .gte("created_at", existingEstimation.date_of_first_estimated_item)
        .lte("created_at", existingEstimation.date_of_last_estimated_item)
        .order("created_at", { ascending: true });

    if (caloriesAndWeightsError) {
      throw caloriesAndWeightsError;
    }

    // Check if there's at least `MINIMUM_DAYS_OF_DATA` since the last estimated item.
    if (caloriesAndWeights.length >= MINIMUM_DAYS_OF_DATA) {
      const { error: errorUpdating } = await supabase
        .from("profiles_tdee_estimations")
        .update({
          estimation: estimateNewTdee(caloriesAndWeights),
        })
        .eq("id", existingEstimation.id);

      if (errorUpdating) {
        throw errorUpdating;
      }
    }
  } else {
    // Fetch the latest TDEE estimation.
    const { data: latestEstimations, error: latestEstimationsError } =
      await supabase
        .from("profiles_tdee_estimations")
        .select<string, Pick<StoredEstimation, "date_of_last_estimated_item">>(
          "date_of_last_estimated_item"
        )
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
          date_of_first_estimated_item: caloriesAndWeights[0].created_at,
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
          date_of_first_estimated_item: caloriesAndWeights[0].created_at,
          date_of_last_estimated_item:
            caloriesAndWeights[caloriesAndWeights.length - 1].created_at,
        });
      }
    }
  }
}

function estimateNewTdee(caloriesAndWeights: StoredCaloriesAndWeights[]) {
  const weights = caloriesAndWeights.map(({ weight }) => weight);
  const smoothedWeights = smoothOutWeights(weights);
  const weightChange =
    smoothedWeights[smoothedWeights.length - 1] - smoothedWeights[0];

  // Removing the last element with slice (this doesn't mutate the original) because we don't
  // want to take into account the last day of calories since that will impact the next days after this
  // estimation and not the current one.
  const slicedCaloriesAndWeights = caloriesAndWeights.slice(0, -1);

  const totalCalories = slicedCaloriesAndWeights.reduce(
    (total, { calories }) => total + calories,
    0
  );

  const averageDailyCalories = totalCalories / slicedCaloriesAndWeights.length;

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
