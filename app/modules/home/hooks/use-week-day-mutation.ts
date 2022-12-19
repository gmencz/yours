import { PostgrestError } from "@supabase/supabase-js";
import { useMutation } from "@tanstack/react-query";
import { Profile } from "modules/auth/hooks/use-profile-query";
import { WeekDay } from "modules/common/types";
import { supabase } from "modules/supabase/client";
import { WeekDayCaloriesAndWeightData } from "./use-week-calories-and-weights-query";

type Data = WeekDayCaloriesAndWeightData & {
  shouldRerunTdeeEstimator: boolean;
};

type UseWeekDayMutation = {
  onSuccess?: (data: Data) => void;
  savedCaloriesAndWeight?: WeekDayCaloriesAndWeightData;
  profile: Profile;
  day: WeekDay;
  createdAtDateString: string;
};

export function useWeekDayMutation({
  onSuccess,
  savedCaloriesAndWeight,
  profile,
  day,
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
      // If previously, either the calories or the weight were missing from this day and now the user has added them, we
      // should re run the tdee estimator just in case.
      if (
        (!savedCaloriesAndWeight?.calories || !savedCaloriesAndWeight.weight) &&
        data.calories &&
        data.weight
      ) {
        shouldRerunTdeeEstimator = true;
      }

      return { ...data, shouldRerunTdeeEstimator };
    },

    onSuccess,
  });
}
