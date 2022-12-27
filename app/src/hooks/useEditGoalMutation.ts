import { useMutation, useQueryClient } from "@tanstack/react-query";
import Sentry from "sentry-expo";
import Toast from "react-native-toast-message";
import { supabase } from "~/supabase";
import { Profile } from "./useProfileQuery";
import { Dispatch, SetStateAction } from "react";

interface Variables {
  approach: string;
  weeklyWeightChange: number;
  goal: string;
}

interface UseEditGoalMutation {
  profile: Profile;
  setEditGoal: Dispatch<SetStateAction<boolean>>;
}

export function useEditGoalMutation({
  profile,
  setEditGoal,
}: UseEditGoalMutation) {
  const queryClient = useQueryClient();

  return useMutation<unknown, unknown, Variables>({
    mutationFn: async (values) => {
      const { error: profileGoalError } = await supabase
        .from("profiles_goals")
        .update({
          approach: values.approach,
          weekly_weight_change: values.weeklyWeightChange,
          goal: values.goal,
        })
        .eq("id", profile.goalId);

      if (profileGoalError) {
        throw profileGoalError;
      }

      return true;
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["strategy"],
      });

      setEditGoal(false);
    },
    onError: (error, variables) => {
      Sentry.Native.captureException(error, { extra: { variables } });
      Toast.show({
        type: "error",
        text2: "Oops! Something went wrong updating your goal.",
      });
    },
  });
}
