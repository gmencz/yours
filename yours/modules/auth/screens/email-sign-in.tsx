import { SafeAreaView } from "react-native-safe-area-context";
import { Text, useTheme, useThemeMode } from "@rneui/themed";
import { View } from "react-native";
import { AtSymbolIcon, KeyIcon } from "react-native-heroicons/outline";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState } from "react";
import { makeRedirectUri } from "expo-auth-session";
import { useSessionListener } from "../hooks/use-session-listener";
import { supabase } from "../../supabase/client";
import { Button } from "../../common/components/button";
import { ControlledInput } from "../../common/components/controlled-input";
import { Logo } from "../../common/components/logo";

type FormValues = {
  email: string;
  password: string;
};

type State = {
  errorMessage: string | null;
  successMessage: string | null;
  status: "idle" | "loading" | "error" | "success";
};

const schema = yup
  .object({
    email: yup
      .string()
      .email("Please enter an email")
      .required("Please enter a valid email"),
    password: yup
      .string()
      .min(6, "The password must be at least 6 characters long")
      .required("Please enter a password"),
  })
  .required();

export function EmailSignInScreen() {
  useSessionListener();

  const { theme } = useTheme();
  const { mode } = useThemeMode();
  const [authError, setAuthError] = useState<string>();

  const [state, setState] = useState<State>({
    status: "idle",
    errorMessage: null,
    successMessage: null,
  });

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });

  const signIn = async ({ email, password }: FormValues) => {
    setState({
      status: "loading",
      errorMessage: null,
      successMessage: null,
    });

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      let errorMessage;
      switch (error.message) {
        case "Invalid login credentials":
          errorMessage = "Invalid email or password";
          break;
        case "Email not confirmed":
          errorMessage = "Please check your email to confirm your account";
          break;
        default:
          errorMessage = error.message;
      }

      setState({
        status: "error",
        errorMessage,
        successMessage: null,
      });
    }
  };

  const createAccount = async ({ email, password }: FormValues) => {
    setState({
      status: "loading",
      errorMessage: null,
      successMessage: null,
    });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: makeRedirectUri({
          path: "/auth/callback",
        }),
      },
    });

    if (error) {
      setState({
        status: "error",
        errorMessage: error.message,
        successMessage: null,
      });

      return;
    }

    if (data.user && !data.session) {
      // Identities has an element when the email hasn't yet been confirmed, this is probably not the best way
      // to check this but it works for now.
      if (data.user.identities?.length) {
        setState({
          status: "success",
          errorMessage: null,
          successMessage: `We've sent you an email at ${email} with a confirmation link`,
        });
      } else {
        // If we get here, an user with the provided email and password already exists.
        setState({
          status: "error",
          errorMessage: `You tried to create an account but one already exists with this email, sign in instead or use a different email`,
          successMessage: null,
        });
      }
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
        }}
      >
        Sign in to your account or create a new one.
      </Text>

      <View style={{ marginTop: theme.spacing.xl }}>
        <ControlledInput
          control={control}
          label="Email"
          name="email"
          placeholder="you@example.com"
          icon={<AtSymbolIcon size={24} color={theme.colors.black} />}
          errorMessage={errors.email?.message}
        />
      </View>

      <View style={{ marginTop: theme.spacing.xl }}>
        <ControlledInput
          control={control}
          secureTextEntry
          label="Password"
          name="password"
          placeholder="at least 6 characters"
          icon={<KeyIcon size={24} color={theme.colors.black} />}
          errorMessage={errors.password?.message}
        />
      </View>

      {state.errorMessage ? (
        <Text
          style={{ marginTop: theme.spacing.md, color: theme.colors.error }}
        >
          {state.errorMessage}
        </Text>
      ) : null}

      {state.successMessage ? (
        <Text
          style={{ marginTop: theme.spacing.md, color: theme.colors.success }}
        >
          {state.successMessage}
        </Text>
      ) : null}

      <Button
        variant="1"
        title="Sign in"
        onPress={handleSubmit(signIn)}
        style={{ marginTop: theme.spacing.xl }}
      />

      <View
        style={{
          marginTop: theme.spacing.lg,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View
          style={{
            flex: 1,
            height: 2,
            backgroundColor: theme.colors.grey3,
            marginRight: 20,
            borderRadius: 10,
          }}
        />

        <Text style={{ color: theme.colors.grey1, fontFamily: "InterBold" }}>
          OR
        </Text>

        <View
          style={{
            flex: 1,
            height: 2,
            backgroundColor: theme.colors.grey3,
            marginLeft: 20,
            borderRadius: 10,
          }}
        />
      </View>

      <Button
        variant="2"
        title="Create account"
        onPress={handleSubmit(createAccount)}
        style={{ marginTop: theme.spacing.lg }}
      />
    </SafeAreaView>
  );
}
