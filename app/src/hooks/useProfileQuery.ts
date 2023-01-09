import { AuthError, PostgrestError } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import * as Sentry from "sentry-expo";
import { supabase } from "~/supabase";
import { Activity, MeasurementSystem, Sex, TrainingActivity } from "~/typings";

export interface Profile {
  id: string;
  preferedMeasurementSystem: MeasurementSystem | null;
  initialTdeeEstimation: number | null;
  goalId: number | null;
  initialWeight: number | null;
  sex: Sex | null;
  activity: Activity | null;
  trainingActivity: TrainingActivity | null;
  age: number | null;
  height: number | null;
}

interface ProfileSelect {
  id: string;
  prefered_measurement_system: MeasurementSystem | null;
  initial_tdee_estimation: number | null;
  goal_id: number | null;
  initial_weight: number | null;
  sex: string | null;
  day_to_day_activity: Activity | null;
  training_activity: TrainingActivity | null;
  age: number | null;
  height: number | null;
}

interface Options {
  enabled?: boolean;
}

export function useProfileQuery(options?: Options) {
  const query = useQuery<unknown, Error | PostgrestError | AuthError, Profile>({
    queryKey: ["profile"],
    staleTime: Infinity,
    enabled: options?.enabled,
    queryFn: async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error("Sign in");
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select<string, ProfileSelect>(
          "id, prefered_measurement_system, initial_tdee_estimation, initial_weight, goal_id, sex, day_to_day_activity, training_activity, age, height"
        )
        .eq("id", user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      return {
        id: profile.id,
        goalId: profile.goal_id,
        initialTdeeEstimation: profile.initial_tdee_estimation,
        initialWeight: profile.initial_weight,
        preferedMeasurementSystem: profile.prefered_measurement_system,
        sex: profile.sex,
        activity: profile.day_to_day_activity,
        age: profile.age,
        height: profile.height,
        trainingActivity: profile.training_activity,
      } as Profile;
    },

    onError(error) {
      Sentry.Native.captureException(error);
    },
  });

  return query;
}
