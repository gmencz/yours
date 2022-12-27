import { useQuery } from "@tanstack/react-query";
import { subMonths, subWeeks, subYears } from "date-fns";
import Sentry from "sentry-expo";
import { Period } from "~/screens/Insights/Weight";
import { supabase } from "~/supabase";

export type WeightsQueryData = {
  weight: number;
  created_at: string;
}[];

interface UseWeightsQuery {
  period: Period;
  profileId: string;
}

export function useWeightsQuery({ period, profileId }: UseWeightsQuery) {
  return useQuery({
    keepPreviousData: true,
    queryKey: ["weights", period],
    queryFn: async () => {
      let fromCreatedAt;
      const today = new Date();
      switch (period) {
        case "1W":
          fromCreatedAt = subWeeks(today, 1);
          break;
        case "1M":
          fromCreatedAt = subMonths(today, 1);
          break;
        case "3M":
          fromCreatedAt = subMonths(today, 3);
          break;
        case "6M":
          fromCreatedAt = subMonths(today, 6);
          break;
        case "1Y":
          fromCreatedAt = subYears(today, 1);
          break;
      }

      const { data, error } = await supabase
        .from("profiles_calories_and_weights")
        .select<string, WeightsQueryData[0]>("weight, created_at")
        .eq("profile_id", profileId)
        .not("weight", "is", "null")
        .gte("created_at", fromCreatedAt.toISOString())
        .order("created_at", { ascending: true });

      if (error) {
        throw error;
      }

      return data;
    },

    onError(error) {
      Sentry.Native.captureException(error);
    },
  });
}
