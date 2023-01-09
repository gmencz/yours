import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { PostgrestError } from "@supabase/supabase-js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Sentry from "sentry-expo";
import { supabase } from "~/supabase";
import { UncompletedProfileStackParamList } from "~/typings";
import { Profile } from "./useProfileQuery";

interface ProfileGoalSelect {
  id: number;
}

interface UseProfileStepTwoMutation {
  profile: Profile;
  navigation: NativeStackNavigationProp<
    UncompletedProfileStackParamList,
    "StepTwo",
    undefined
  >;
}

interface Variables {
  approach: string;
  weeklyWeightChange: number;
  goal: string;
}

export function useProfileStepTwoMutation({
  profile,
  navigation,
}: UseProfileStepTwoMutation) {
  const queryClient = useQueryClient();

  return useMutation<ProfileGoalSelect, PostgrestError, Variables>({
    mutationFn: async (variables) => {
      const { data: profileGoal, error: profileGoalError } = await supabase
        .from("profiles_goals")
        .insert({
          profile_id: profile.id,
          approach: variables.approach,
          weekly_weight_change: variables.weeklyWeightChange,
          goal: variables.goal,
        })
        .select<string, ProfileGoalSelect>("id");

      if (profileGoalError) {
        throw profileGoalError;
      }

      const { error: profilesError } = await supabase
        .from("profiles")
        .update({ goal_id: profileGoal[0].id })
        .eq("id", profile!.id);

      if (profilesError) {
        throw profilesError;
      }

      return profileGoal[0];
    },

    onSuccess: (data) => {
      const queryData = queryClient.getQueryData<Profile>(["profile"]);
      if (queryData) {
        queryClient.setQueryData<Profile>(["profile"], {
          ...queryData,
          goalId: data.id,
        });
      }

      navigation.navigate("StepThree");
    },

    onError(error, variables) {
      Sentry.Native.captureException(error, { extra: { variables } });
    },
  });
}
