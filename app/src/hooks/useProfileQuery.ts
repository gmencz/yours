import { AuthError, PostgrestError } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import Sentry from "sentry-expo";
import { supabase } from "~/supabase";
import { MeasurementSystem } from "~/typings";

export interface Profile {
  id: string;
  preferedMeasurementSystem: MeasurementSystem;
  initialTdeeEstimation: number | null;
  goalId: number | null;
  initialWeight: number | null;
  gender: string | null;
}

interface ProfileSelect {
  id: string;
  prefered_measurement_system: MeasurementSystem | null;
  initial_tdee_estimation: number | null;
  goal_id: number | null;
  initial_weight: number | null;
  gender: string | null;
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
          "id, prefered_measurement_system, initial_tdee_estimation, initial_weight, goal_id, gender"
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
        gender: profile.gender,
      };
    },

    onError(error) {
      Sentry.Native.captureException(error);
    },
  });

  return query;
}
