import { AuthApiError, AuthError } from "@supabase/supabase-js";
import { useMutation } from "@tanstack/react-query";
import { makeRedirectUri } from "expo-auth-session";
import Toast from "react-native-toast-message";
import * as Sentry from "sentry-expo";
import { supabase } from "~/supabase";

interface Variables {
  email: string;
}

export function useStarterMutation() {
  return useMutation<boolean, AuthApiError | AuthError, Variables>({
    mutationFn: async ({ email }) => {
      const { error } = await supabase.auth.signInWithOtp({
        email: email!,
        options: {
          emailRedirectTo: makeRedirectUri({ path: "auth/callback" }),
          shouldCreateUser: false,
        },
      });

      if (error) {
        throw error;
      }

      return true;
    },
    onSuccess: (_data, { email }) => {
      Toast.show({
        type: "success",
        text2: `We've sent you a link to sign in at ${email}.`,
      });
    },
    onError: (error, variables) => {
      if (error.message === "Signups not allowed for otp") {
        Toast.show({
          type: "error",
          text2: "That email is not registered for our early access.",
        });
      } else {
        Sentry.Native.captureException(error, { extra: { variables } });
        Toast.show({
          type: "error",
          text2: "Oops! Something went wrong sending you the sign in email.",
        });
      }
    },
  });
}
