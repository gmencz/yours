import { PostgrestError } from "@supabase/supabase-js";
import { useMutation } from "@tanstack/react-query";
import * as Sentry from "sentry-expo";
import { runTdeeEstimator } from "~/utils/tdeeEstimator";
import { Profile } from "./useProfileQuery";

interface MutationData {
  profile: Profile;
}

export function useTdeeEstimationMutation() {
  return useMutation<boolean, PostgrestError, MutationData>({
    mutationFn: async ({ profile }) => {
      await runTdeeEstimator({ profile });
      return true;
    },
    onError(error, variables) {
      Sentry.Native.captureException(error, { extra: { variables } });
    },
  });
}
