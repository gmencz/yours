import { yupResolver } from "@hookform/resolvers/yup";
import { useTheme } from "@rneui/themed";
import { useMutation } from "@tanstack/react-query";
import { makeRedirectUri } from "expo-auth-session";
import { Button } from "modules/common/components/button";
import { ControlledInput } from "modules/common/components/controlled-input";
import { Heading2 } from "modules/common/components/headings";
import { Logo } from "modules/common/components/logo";
import { supabase } from "modules/supabase/client";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { AtSymbolIcon } from "react-native-heroicons/outline";
import { SafeAreaView } from "react-native-safe-area-context";
import * as yup from "yup";
import * as Sentry from "sentry-expo";
import Toast from "react-native-toast-message";
import { useSessionListener } from "../hooks/use-session-listener";
import { AuthApiError, AuthError } from "@supabase/supabase-js";

const schema = yup
  .object({
    email: yup
      .string()
      .email("Please enter a valid email")
      .required("Please enter a valid email"),
  })
  .required();

type FormValues = yup.TypeOf<typeof schema>;

export function ClosedBetaLinkSignIn() {
  useSessionListener();

  const { theme } = useTheme();
  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });

  const mutation = useMutation<unknown, AuthApiError | AuthError, FormValues>({
    mutationFn: async ({ email }) => {
      const { error } = await supabase.auth.signInWithOtp({
        email: email!,
        options: {
          emailRedirectTo: makeRedirectUri({
            path: "/auth/callback",
          }),
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
          text2: "That email is not registered for our closed beta.",
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

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        padding: theme.spacing.xl,
      }}
    >
      <Logo />
      <Heading2 style={{ marginTop: theme.spacing.lg }}>
        If you have been given access to our closed beta, enter your email and
        you'll get a link that will sign you in.
      </Heading2>

      <View style={{ marginTop: theme.spacing.lg }}>
        <ControlledInput
          control={control}
          name="email"
          placeholder="you@example.com"
          icon={<AtSymbolIcon size={24} color={theme.colors.black} />}
          errorMessage={errors.email?.message}
        />
      </View>

      <Button
        variant="1"
        title="Send link"
        onPress={handleSubmit((formValues) => {
          mutation.mutate(formValues);
        })}
        style={{ marginTop: theme.spacing.lg }}
      />
    </SafeAreaView>
  );
}
