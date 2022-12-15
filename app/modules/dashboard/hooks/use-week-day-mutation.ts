import { PostgrestError } from "@supabase/supabase-js";
import { useMutation } from "@tanstack/react-query";
import { setDay } from "date-fns";
import { WeekDay } from "modules/common/types";
import { supabase } from "modules/supabase/client";
import { WeekDayCaloriesAndWeightData } from "./use-week-calories-and-weights-query";

type UseWeekDayMutation = {
  onSuccess?: (data: WeekDayCaloriesAndWeightData) => void;
  savedCaloriesAndWeight?: WeekDayCaloriesAndWeightData;
  profileId: string;
  day: WeekDay;
  startOfWeekDate: Date;
};

export function useWeekDayMutation({
  onSuccess,
  savedCaloriesAndWeight,
  profileId,
  day,
  startOfWeekDate,
}: UseWeekDayMutation) {
  return useMutation<
    WeekDayCaloriesAndWeightData,
    PostgrestError,
    { column: "calories" | "weight"; value: number | null }
  >({
    mutationFn: async ({ column, value }) => {
      const { data, error } = await supabase
        .from("profiles_calories_and_weights")
        .upsert({
          id: savedCaloriesAndWeight?.id,
          [column]: value,
          profile_id: profileId,
          created_at: savedCaloriesAndWeight
            ? savedCaloriesAndWeight.created_at
            : setDay(startOfWeekDate, day),
        })
        .select<string, WeekDayCaloriesAndWeightData>(
          "id, created_at, calories, weight"
        )
        .single();

      if (error) {
        throw error;
      }

      return data;
    },

    onSuccess,
  });
}
