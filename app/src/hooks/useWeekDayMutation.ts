import { PostgrestError } from "@supabase/supabase-js";
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Sentry from "sentry-expo";
import Toast from "react-native-toast-message";
import { supabase } from "~/supabase";
import { runTdeeEstimator } from "~/utils/tdeeEstimator";
import { Profile } from "./useProfileQuery";
import { WeekDayCaloriesAndWeightData } from "./useWeekCaloriesAndWeightsQuery";

interface MutationData extends WeekDayCaloriesAndWeightData {
  shouldRerunTdeeEstimator: boolean;
}

interface UseWeekDayMutation {
  savedCaloriesAndWeight?: WeekDayCaloriesAndWeightData;
  profile: Profile;
  createdAtDateString: string;
  queryKey: QueryKey;
}

interface Variables {
  column: "calories" | "weight";
  value: number | null;
}

export function useWeekDayMutation({
  savedCaloriesAndWeight,
  profile,
  createdAtDateString,
  queryKey,
}: UseWeekDayMutation) {
  const queryClient = useQueryClient();

  return useMutation<MutationData, PostgrestError, Variables>({
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

    onSuccess: async (data) => {
      const queryData =
        queryClient.getQueryData<WeekDayCaloriesAndWeightData[]>(queryKey);

      if (queryData) {
        const isExisting = queryData.some((value) => data.id === value.id);
        const { id, calories, created_at, weight } = data;
        if (isExisting) {
          queryClient.setQueryData(
            queryKey,
            queryData.map((value) => {
              if (id === value.id) {
                return { id, calories, weight, created_at };
              }

              return value;
            })
          );
        } else {
          queryClient.setQueryData(queryKey, [
            ...queryData,
            { id, calories, weight, created_at },
          ]);
        }
      }

      if (data.shouldRerunTdeeEstimator) {
        await runTdeeEstimator({
          profile,
          dateStringFilter: createdAtDateString,
        });

        queryClient.invalidateQueries(["tdeeEstimations"]);
      }
    },
    onError: (error, variables) => {
      Sentry.Native.captureException(error, { extra: { variables } });
      Toast.show({
        type: "error",
        text2: "Oops! Something went wrong saving the changes you just made.",
      });
    },
  });
}
