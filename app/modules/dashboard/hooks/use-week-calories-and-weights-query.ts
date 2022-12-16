import { QueryKey, useQuery } from "@tanstack/react-query";
import { supabase } from "modules/supabase/client";

export type WeekDayCaloriesAndWeightData = {
  id: string;
  created_at: string;
  calories: number | null;
  weight: number | null;
};

type UseWeekCaloriesAndWeights = {
  startOfWeekDateString: string;
  endOfWeekDateString: string;
  enabled: boolean;
  queryKey: QueryKey;
  profileId: string;
};

export function useWeekCaloriesAndWeightsQuery({
  enabled,
  queryKey,
  startOfWeekDateString,
  endOfWeekDateString,
  profileId,
}: UseWeekCaloriesAndWeights) {
  return useQuery<unknown, unknown, WeekDayCaloriesAndWeightData[]>({
    enabled,
    staleTime: Infinity,
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles_calories_and_weights")
        .select<
          string,
          {
            id: string;
            created_at: string;
            calories: number;
            weight: number;
          }
        >("id, created_at, calories, weight")
        .gt("created_at", startOfWeekDateString)
        .lte("created_at", endOfWeekDateString)
        .eq("profile_id", profileId)
        .limit(7)
        .order("created_at", { ascending: true });

      if (error) {
        throw error;
      }

      return data;
    },
  });
}
