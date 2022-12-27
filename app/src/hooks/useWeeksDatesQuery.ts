import { PostgrestError } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { eachWeekOfInterval, startOfDay, startOfWeek } from "date-fns";
import Sentry from "sentry-expo";
import { supabase } from "~/supabase";
import { WeekDay } from "~/typings";
import { useProfileQuery } from "./useProfileQuery";

export function useWeeksDatesQuery() {
  const { data: profile } = useProfileQuery();
  const todayDate = new Date();

  return useQuery<Date[], PostgrestError | Error>({
    queryKey: ["weeksDates"],
    enabled: !!profile,
    staleTime: Infinity,
    queryFn: async () => {
      const { data: firstData, error } = await supabase
        .from("profiles_calories_and_weights")
        .select<string, { created_at: string }>("created_at")
        .eq("profile_id", profile!.id)
        .limit(1)
        .order("created_at", { ascending: true });

      if (error) {
        throw error;
      }

      const firstDate = firstData[0]?.created_at
        ? new Date(firstData[0].created_at)
        : null;

      if (firstDate) {
        const dates = eachWeekOfInterval(
          { start: firstDate, end: todayDate },
          { weekStartsOn: WeekDay.Monday }
        );

        return dates.map((date) => startOfDay(date));
      }

      return [
        startOfDay(startOfWeek(todayDate, { weekStartsOn: WeekDay.Monday })),
      ];
    },

    onError: (error) => {
      Sentry.Native.captureException(error);
    },
  });
}
