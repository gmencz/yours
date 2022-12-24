import { PostgrestError } from "@supabase/supabase-js";
import { QueryKey, useMutation } from "@tanstack/react-query";
import { Profile } from "modules/auth/hooks/use-profile-query";
import { supabase } from "modules/supabase/client";
import { WeekDayCaloriesAndWeightData } from "./use-week-calories-and-weights-query";

type Data = WeekDayCaloriesAndWeightData & {
  shouldRerunTdeeEstimator: boolean;
};

type UseWeekDayMutation = {
  onSuccess?: (data: Data) => void;
  onError?: VoidFunction;
  savedCaloriesAndWeight?: WeekDayCaloriesAndWeightData;
  profile: Profile;
  createdAtDateString: string;
};

export function useWeekDayMutation({
  onError,
  onSuccess,
  savedCaloriesAndWeight,
  profile,
  createdAtDateString,
}: UseWeekDayMutation) {
  return useMutation<
    Data,
    PostgrestError,
    { column: "calories" | "weight"; value: number | null }
  >({
    mutationFn: async ({ column, value }) => {
      const { data, error } = await supabase
        .from("profiles_calories_and_weights")
        .upsert({
          id: savedCaloriesAndWeight?.id,
          [column]: value,
          profile_id: profile.id,
          created_at: createdAtDateString,
        })
        .select<string, WeekDayCaloriesAndWeightData>(
          "id, created_at, calories, weight"
        )
        .single();

      if (error) {
        throw error;
      }

      let shouldRerunTdeeEstimator = false;
      // If both the calories and weight are present and one of them changed, re-run the
      // TDEE estimator for this period of time.
      if (
        data.calories &&
        data.weight &&
        (savedCaloriesAndWeight?.weight !== data.weight ||
          savedCaloriesAndWeight.calories !== data.calories)
      ) {
        shouldRerunTdeeEstimator = true;
      }

      return { ...data, shouldRerunTdeeEstimator };
    },

    onSuccess,
    onError,
  });
}
