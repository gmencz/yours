import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { PostgrestError } from "@supabase/supabase-js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Sentry from "sentry-expo";
import { supabase } from "../supabase";
import {
  Activity,
  MeasurementSystem,
  Sex,
  TrainingActivity,
  UncompletedProfileStackParamList,
} from "~/typings";
import { Profile } from "./useProfileQuery";

interface Variables {
  preferedMeasurementSystem: MeasurementSystem;
  weight: number;
  sex: Sex;
  activity: Activity;
  trainingActivity: TrainingActivity;
  age: number;
  height: number;
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
    mutationFn: async ({
      preferedMeasurementSystem,
      weight,
      sex,
      activity,
      age,
      height,
      trainingActivity,
    }) => {
      const { error } = await supabase
        .from("profiles")
        .update({
          prefered_measurement_system: preferedMeasurementSystem,
          initial_weight: weight,
          sex,
          day_to_day_activity: activity,
          age,
          height,
          training_activity: trainingActivity,
        })
        .eq("id", profile.id);

      if (error) {
        throw error;
      }

      return true;
    },

    onSuccess: (
      _data,
      {
        activity,
        age,
        height,
        trainingActivity,
        preferedMeasurementSystem,
        weight,
        sex,
      }
    ) => {
      const queryData = queryClient.getQueryData<Profile>(["profile"]);
      if (queryData) {
        queryClient.setQueryData<Profile>(["profile"], {
          ...queryData,
          age,
          height,
          initialWeight: weight,
          sex,
          activity,
          trainingActivity,
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
