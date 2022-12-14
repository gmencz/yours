import { PostgrestError } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { addWeeks, isSameWeek, startOfWeek } from "date-fns";
import { useProfileQuery } from "modules/auth/hooks/use-profile-query";
import { supabase } from "modules/supabase/client";
import { WeekDay } from "modules/common/types";

type UseWeeksDatesQuery = {
  onSuccess?: (data: Date[]) => void;
};

export function useWeeksDatesQuery({ onSuccess }: UseWeeksDatesQuery) {
  const { data: profile } = useProfileQuery();
  const todayDate = new Date();

  return useQuery<Date[], PostgrestError | Error>({
    queryKey: ["weeksDates"],
    onSuccess,
    enabled: !!profile,
    staleTime: Infinity,
    queryFn: async () => {
      const [firstQuery, lastQuery] = await Promise.all([
        supabase
          .from("profiles_calories_and_weights")
          .select<string, { created_at: string }>("created_at")
          .eq("profile_id", profile!.id)
          .limit(1)
          .order("created_at", { ascending: true }),

        supabase
          .from("profiles_calories_and_weights")
          .select<string, { created_at: string }>("created_at")
          .eq("profile_id", profile!.id)
          .limit(1)
          .order("created_at", { ascending: false }),
      ]);

      if (firstQuery.error || lastQuery.error) {
        throw firstQuery.error || lastQuery.error;
      }

      const firstData = firstQuery.data[0];
      const lastData = lastQuery.data[0];

      const firstDate = firstData?.created_at
        ? new Date(firstData.created_at)
        : null;

      const lastDate = lastData?.created_at
        ? new Date(lastData.created_at)
        : null;

      const weeksDates: Date[] = [];
      if (firstDate && lastDate) {
        const firstWeek = startOfWeek(firstDate, {
          weekStartsOn: WeekDay.Monday,
        });

        const lastWeek = startOfWeek(lastDate, {
          weekStartsOn: WeekDay.Monday,
        });

        weeksDates.push(firstWeek);
        if (!isSameWeek(firstWeek, lastWeek)) {
          // Fetch all the weeks after first date up until last date
          let reachedEnd = false;
          while (!reachedEnd) {
            const lastFetchedWeek = weeksDates[weeksDates.length - 1];

            const nextWeek = addWeeks(lastFetchedWeek, 1);
            if (isSameWeek(nextWeek, lastWeek)) {
              reachedEnd = true;
              weeksDates.push(lastWeek);
            } else {
              weeksDates.push(nextWeek);
            }
          }
        }
      } else {
        weeksDates.push(
          startOfWeek(todayDate, { weekStartsOn: WeekDay.Monday })
        );
      }

      return weeksDates;
    },
  });
}
