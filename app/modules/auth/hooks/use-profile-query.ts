import { AuthError, PostgrestError } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "modules/supabase/client";

export type Profile = {
  id: string;
  prefered_measurement_system: "metric" | "imperial";
  initial_tdee_estimation: number | null;
  goal_id: number | null;
  initial_weight: number | null;
  gender: string | null;
};

type UseProfileQuery = {
  enabled?: boolean;
};

export function useProfileQuery(options?: UseProfileQuery) {
  const query = useQuery<Profile, Error | PostgrestError | AuthError>({
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
        .select<string, Profile>(
          "id, prefered_measurement_system, initial_tdee_estimation, initial_weight, goal_id, gender"
        )
        .eq("id", user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      return profile;
    },
  });

  return query;
}
