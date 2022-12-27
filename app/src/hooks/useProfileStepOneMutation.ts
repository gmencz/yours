import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { PostgrestError } from "@supabase/supabase-js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Sentry from "sentry-expo";
import { supabase } from "../supabase";
import { MeasurementSystem, UncompletedProfileStackParamList } from "~/typings";
import { Profile } from "./useProfileQuery";

interface Variables {
  tdee: number;
  preferedMeasurementSystem: string;
  weight: number;
  gender: string;
}

interface UseProfileStepOneMutation {
  profile: Profile;
  navigation: NativeStackNavigationProp<
    UncompletedProfileStackParamList,
    "StepOne",
    undefined
  >;
}

export function useProfileStepOneMutation({
  profile,
  navigation,
}: UseProfileStepOneMutation) {
  const queryClient = useQueryClient();

  return useMutation<unknown, PostgrestError, Variables>({
    mutationFn: async ({ tdee, preferedMeasurementSystem, weight, gender }) => {
      const { error } = await supabase
        .from("profiles")
        .update({
          initial_tdee_estimation: tdee,
          prefered_measurement_system: preferedMeasurementSystem,
          initial_weight: weight,
          gender,
        })
        .eq("id", profile.id);

      if (error) {
        throw error;
      }

      return true;
    },

    onSuccess: (_data, { tdee, preferedMeasurementSystem, weight, gender }) => {
      const queryData = queryClient.getQueryData<Profile>(["profile"]);
      if (queryData) {
        queryClient.setQueryData<Profile>(["profile"], {
          ...queryData,
          initialTdeeEstimation: tdee,
          initialWeight: weight,
          gender,
          preferedMeasurementSystem:
            preferedMeasurementSystem as MeasurementSystem,
        });
      }

      navigation.navigate("StepTwo");
    },

    onError(error, variables) {
      Sentry.Native.captureException(error, { extra: { variables } });
    },
  });
}
