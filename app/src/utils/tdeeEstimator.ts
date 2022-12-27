import { Profile } from "~/hooks/useProfileQuery";
import { supabase } from "~/supabase";
import { getRecommendedWeeklyWeightChange } from "./getRecommendedWeeklyWeightChange";
import { smoothOutWeights } from "./smoothOutWeights";

interface EstimationSelect {
  id: number;
  date_of_first_estimated_item: string;
  date_of_last_estimated_item: string;
}

interface CaloriesAndWeightsSelect {
  calories: number;
  weight: number;
  created_at: string;
}

// This is the maximum calories we would add/subtract to the current estimation.
// If we made a bigger change than this it could be too big of a change so it's better
// to slowly adapt the calories even if it takes longer for some users.
const MAX_CALORIC_CHANGE = 200;

// In order for us to get a more reasonable estimation, we will only make the estimation
// when we have at least 7 days of data, this is because weight can fluctuate a lot
// and in 7 days we can get a more accurate fluctuation.
const MINIMUM_DAYS_OF_DATA = 7;

interface CreateTdeeEstimationParams {
  profile: Profile;
  dateStringFilter?: string;
}

interface GoalSelect {
  goal: "build-muscle" | "lose-fat" | "maintain";
  weekly_weight_change: number;
  approach: "bulk" | "cut" | "maintain";
}

// TODO: Update the user's goal based on the new estimation.
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
        .select<string, EstimationSelect>(
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
        .select<string, CaloriesAndWeightsSelect>(
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
      const totalWeight = caloriesAndWeights.reduce(
        (total, { weight }) => total + weight,
        0
      );

      const weight = totalWeight / caloriesAndWeights.length;

      const { error: errorUpdating } = await supabase
        .from("profiles_tdee_estimations")
        .update({
          estimation: estimateNewTdee(caloriesAndWeights),
          weight,
        })
        .eq("id", existingEstimation.id);

      if (errorUpdating) {
        throw errorUpdating;
      }

      const { data: goal, error: goalError } = await supabase
        .from("profiles_goals")
        .select<string, GoalSelect>("goal, weekly_weight_change, approach")
        .eq("id", profile!.goalId)
        .single();

      if (goalError) {
        throw goalError;
      }

      const weeklyWeightChange = getRecommendedWeeklyWeightChange(
        goal.approach,
        profile,
        weight
      );

      const { error: profileGoalError } = await supabase
        .from("profiles_goals")
        .update({
          weekly_weight_change: weeklyWeightChange,
        })
        .eq("id", profile.goalId);

      if (profileGoalError) {
        throw profileGoalError;
      }
    }
  } else {
    // Fetch the latest TDEE estimation.
    const { data: latestEstimations, error: latestEstimationsError } =
      await supabase
        .from("profiles_tdee_estimations")
        .select<string, Pick<EstimationSelect, "date_of_last_estimated_item">>(
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
          .select<string, CaloriesAndWeightsSelect>(
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

      if (caloriesAndWeights.length >= MINIMUM_DAYS_OF_DATA) {
        // Check if there's at least `MINIMUM_DAYS_OF_DATA` since the last estimated item.
        const totalWeight = caloriesAndWeights.reduce(
          (total, { weight }) => total + weight,
          0
        );

        const weight = totalWeight / caloriesAndWeights.length;

        const { error: insertError } = await supabase
          .from("profiles_tdee_estimations")
          .insert({
            profile_id: profile.id,
            estimation: estimateNewTdee(caloriesAndWeights),
            weight,
            date_of_first_estimated_item: caloriesAndWeights[0].created_at,
            date_of_last_estimated_item:
              caloriesAndWeights[caloriesAndWeights.length - 1].created_at,
          });

        if (insertError) {
          throw insertError;
        }

        const { data: goal, error: goalError } = await supabase
          .from("profiles_goals")
          .select<string, GoalSelect>("goal, weekly_weight_change, approach")
          .eq("id", profile!.goalId)
          .single();

        if (goalError) {
          throw goalError;
        }

        const weeklyWeightChange = getRecommendedWeeklyWeightChange(
          goal.approach,
          profile,
          weight
        );

        const { error: profileGoalError } = await supabase
          .from("profiles_goals")
          .update({
            weekly_weight_change: weeklyWeightChange,
          })
          .eq("id", profile.goalId);

        if (profileGoalError) {
          throw profileGoalError;
        }
      }
    } else {
      // Fetch all of the user's inputted calories and weights since they started using the app, we are fetching
      // everything because we haven't made an estimate before.
      const { data: caloriesAndWeights, error: caloriesAndWeightsError } =
        await supabase
          .from("profiles_calories_and_weights")
          .select<string, CaloriesAndWeightsSelect>(
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
        const totalWeight = caloriesAndWeights.reduce(
          (total, { weight }) => total + weight,
          0
        );

        const weight = totalWeight / caloriesAndWeights.length;

        const { error: insertError } = await supabase
          .from("profiles_tdee_estimations")
          .insert({
            profile_id: profile.id,
            estimation: estimateNewTdee(caloriesAndWeights),
            weight,
            date_of_first_estimated_item: caloriesAndWeights[0].created_at,
            date_of_last_estimated_item:
              caloriesAndWeights[caloriesAndWeights.length - 1].created_at,
          });

        if (insertError) {
          throw insertError;
        }

        const { data: goal, error: goalError } = await supabase
          .from("profiles_goals")
          .select<string, GoalSelect>("goal, weekly_weight_change, approach")
          .eq("id", profile!.goalId)
          .single();

        if (goalError) {
          throw goalError;
        }

        const weeklyWeightChange = getRecommendedWeeklyWeightChange(
          goal.approach,
          profile,
          weight
        );

        const { error: profileGoalError } = await supabase
          .from("profiles_goals")
          .update({
            weekly_weight_change: weeklyWeightChange,
          })
          .eq("id", profile.goalId);

        if (profileGoalError) {
          throw profileGoalError;
        }
      }
    }
  }
}

function estimateNewTdee(caloriesAndWeights: CaloriesAndWeightsSelect[]) {
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
