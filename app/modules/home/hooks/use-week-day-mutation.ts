import { PostgrestError } from "@supabase/supabase-js";
import { useMutation } from "@tanstack/react-query";
import { addDays, setDay, subDays } from "date-fns";
import { Profile } from "modules/auth/hooks/use-profile-query";
import { WeekDay } from "modules/common/types";
import { supabase } from "modules/supabase/client";
import { WeekDayCaloriesAndWeightData } from "./use-week-calories-and-weights-query";

type UseWeekDayMutation = {
  onSuccess?: (data: WeekDayCaloriesAndWeightData) => void;
  savedCaloriesAndWeight?: WeekDayCaloriesAndWeightData;
  profile: Profile;
  day: WeekDay;
  startOfWeekDate: Date;
  endOfWeekDate: Date;
};

export function useWeekDayMutation({
  onSuccess,
  savedCaloriesAndWeight,
  profile,
  day,
  startOfWeekDate,
  endOfWeekDate,
}: UseWeekDayMutation) {
  return useMutation<
    WeekDayCaloriesAndWeightData,
    PostgrestError,
    { column: "calories" | "weight"; value: number | null }
  >({
    mutationFn: async ({ column, value }) => {
      // Estimate maintenance calories
      let createdAt;
      if (savedCaloriesAndWeight?.created_at) {
        createdAt = savedCaloriesAndWeight.created_at;
      } else {
        if (day === WeekDay.Sunday) {
          createdAt = endOfWeekDate.toISOString();
        } else {
          createdAt = setDay(startOfWeekDate, day).toISOString();
        }
      }

      const { data, error } = await supabase
        .from("profiles_calories_and_weights")
        .upsert({
          id: savedCaloriesAndWeight?.id,
          [column]: value,
          profile_id: profile.id,
          created_at: createdAt,
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
