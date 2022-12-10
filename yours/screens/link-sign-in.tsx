import { SafeAreaView } from "react-native-safe-area-context";
import { Text, useTheme } from "@rneui/themed";
import { AtSymbolIcon } from "react-native-heroicons/outline";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { makeRedirectUri } from "expo-auth-session";
import { useState } from "react";

import { Logo } from "../components/Logo";
import { supabase } from "../lib/supabase";
import { Button } from "../components/Button";
import { useSessionListener } from "../lib/auth";
import { ControlledInput } from "../components/ControlledInput";

type FormValues = {
  email: string;
};

type State = {
  email: string | null;
  status: "idle" | "loading" | "error" | "success";
};

const schema = yup
  .object({
    email: yup
      .string()
      .email("Please enter a valid email")
      .required("Please enter a valid email"),
  })
  .required();

export function LinkSignInScreen() {
  useSessionListener();

  const { theme } = useTheme();
  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });

  const [state, setState] = useState<State>({
    email: null,
    status: "idle",
  });

  const sendMagicLink = async ({ email }: FormValues) => {
    setState({
      status: "loading",
      email: null,
    });

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: makeRedirectUri({
          path: "/auth/callback",
        }),
      },
    });

    if (error) {
      setState({
        status: "error",
        email,
      });
    } else {
      setState({
        status: "success",
        email,
      });
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingHorizontal: theme.spacing.xl,
        paddingTop: 70,
        paddingBottom: 50,
      }}
    >
      <Logo />

      <Text
        style={{
          marginTop: theme.spacing.xl,
          color: theme.colors.grey0,
          fontSize: 16,
          marginBottom: theme.spacing.xl,
        }}
      >
        Tired of passwords? Get a magic link sent to your email that'll sign you
        in instantly!
      </Text>

      <ControlledInput
        control={control}
        name="email"
        placeholder="you@example.com"
        icon={<AtSymbolIcon size={24} color={theme.colors.black} />}
        errorMessage={errors.email?.message}
      />

      {state.status === "error" ? (
        <Text
          style={{ marginTop: theme.spacing.md, color: theme.colors.error }}
        >
          Something went wrong sending you the magic link, try again later.
        </Text>
      ) : null}

      {state.status === "success" ? (
        <Text
          style={{ marginTop: theme.spacing.md, color: theme.colors.success }}
        >
          We've sent you an email at {state.email}.
        </Text>
      ) : null}

      <Button
        variant="1"
        title="Send magic link"
        onPress={handleSubmit(sendMagicLink)}
        style={{ marginTop: theme.spacing.xl }}
      />
    </SafeAreaView>
  );
}
