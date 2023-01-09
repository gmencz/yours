import { PostgrestError } from "@supabase/supabase-js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Sentry from "sentry-expo";
import { supabase } from "../supabase";
import { Profile } from "./useProfileQuery";

interface Variables {
  tdee: number;
}

interface UseProfileStepOneMutation {
  profile: Profile;
}

export function useProfileStepThreeMutation({
  profile,
}: UseProfileStepOneMutation) {
  const queryClient = useQueryClient();

  return useMutation<unknown, PostgrestError, Variables>({
    mutationFn: async ({ tdee }) => {
      const { error } = await supabase
        .from("profiles")
        .update({
          initial_tdee_estimation: tdee,
        })
        .eq("id", profile.id);

      if (error) {
        throw error;
      }

      return true;
    },

    onSuccess: (_data, { tdee }) => {
      const queryData = queryClient.getQueryData<Profile>(["profile"]);
      if (queryData) {
        queryClient.setQueryData<Profile>(["profile"], {
          ...queryData,
          initialTdeeEstimation: tdee,
        });
      }
    },

    onError(error, variables) {
      Sentry.Native.captureException(error, { extra: { variables } });
    },
  });
}
