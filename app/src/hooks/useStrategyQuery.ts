import { PostgrestError } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import * as Sentry from "sentry-expo";
import { supabase } from "~/supabase";
import { calculateDailyCalorieChange } from "~/utils/calculateDailyCalorieChange";
import { Profile } from "./useProfileQuery";

interface EstimationSelect {
  estimation: number;
  weight: number;
}

interface GoalSelect {
  goal: "build-muscle" | "lose-fat" | "maintain";
  weekly_weight_change: number;
  approach: "bulk" | "cut" | "maintain";
}

export interface UseStrategyQueryData {
  recommendedDailyCalories: number;
  recommendedProteinIntake: number;
  goal: GoalSelect;
}

interface UseStrategyQuery {
  profile: Profile;
}

export function useStrategyQuery({ profile }: UseStrategyQuery) {
  return useQuery<UseStrategyQueryData, PostgrestError>({
    queryKey: ["strategy"],
    queryFn: async () => {
      // Get the most recent TDEE estimation
      const { data: latestTdeeEstimations, error: latestTdeeEstimationError } =
        await supabase
          .from("profiles_tdee_estimations")
          .select<string, EstimationSelect>("estimation, weight")
          .eq("profile_id", profile.id)
          .limit(1)
          .order("created_at", { ascending: false });

      if (latestTdeeEstimationError) {
        throw latestTdeeEstimationError;
      }

      let estimation: number;
      let weight: number;
      const latestTdeeEstimation = latestTdeeEstimations[0];
      if (latestTdeeEstimation) {
        estimation = latestTdeeEstimation.estimation;
        weight = latestTdeeEstimation.weight;
      } else {
        estimation = profile!.initialTdeeEstimation!;
        weight = profile!.initialWeight!;
      }

      // Get the user's goal
      const { data: goal, error: goalError } = await supabase
        .from("profiles_goals")
        .select<string, GoalSelect>("goal, weekly_weight_change, approach")
        .eq("id", profile!.goalId)
        .single();

      if (goalError) {
        throw goalError;
      }

      const caloriesToChange = calculateDailyCalorieChange(
        profile?.preferedMeasurementSystem === "imperial" ? "lbs" : "kgs",
        goal.weekly_weight_change
      );

      const recommendedDailyCalories = Math.round(
        estimation + caloriesToChange
      );

      const proteinMultiplier =
        profile?.preferedMeasurementSystem === "imperial" ? 1 : 2.2;
      const recommendedProteinIntake = Math.round(weight * proteinMultiplier);

      return { recommendedDailyCalories, recommendedProteinIntake, goal };
    },

    onError(error) {
      Sentry.Native.captureException(error);
    },
  });
}
