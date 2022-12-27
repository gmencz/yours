import { useQuery } from "@tanstack/react-query";
import Sentry from "sentry-expo";
import Toast from "react-native-toast-message";

import { supabase } from "~/supabase";

interface UseTdeeEstimationsQuery {
  profileId: string;
}

export type EstimationQueryData = {
  id: number;
  estimation: number;
  weight: number;
  date_of_first_estimated_item: string;
  date_of_last_estimated_item: string;
};

export function useLatestTdeeEstimationQuery({
  profileId,
}: UseTdeeEstimationsQuery) {
  return useQuery({
    queryKey: ["latestTdeeEstimation"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles_tdee_estimations")
        .select<string, EstimationQueryData>(
          "id, estimation, weight, date_of_first_estimated_item, date_of_last_estimated_item"
        )
        .eq("profile_id", profileId)
        .order("date_of_last_estimated_item", { ascending: false })
        .limit(1);

      if (error) {
        throw error;
      }

      if (!data.length) {
        return null;
      }

      return data[0];
    },

    onError(error) {
      Sentry.Native.captureException(error);
      Toast.show({
        type: "error",
        text2: "Oops! There was an error getting your current weight.",
      });
    },
  });
}
