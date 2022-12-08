import { SafeAreaView } from "react-native-safe-area-context";
import { Text, useTheme } from "@rneui/themed";
import { AtSymbolIcon } from "react-native-heroicons/outline";
import { TextInput, View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { makeRedirectUri } from "expo-auth-session";
import { useState } from "react";

import { Logo } from "../components/Logo";
import { supabase } from "../lib/supabase";
import { Button } from "../components/Button";
import { useSessionListener } from "../lib/auth";

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
        }}
      >
        Tired of passwords? Get a magic link sent to your email that'll sign you
        in instantly!
      </Text>

      <View
        style={{
          marginTop: theme.spacing.xl,
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderColor: theme.colors.grey5,
          padding: 10,
          borderRadius: 5,
        }}
      >
        <AtSymbolIcon size={24} color={theme.colors.black} />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder="Email"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholderTextColor={theme.colors.grey2}
              style={{
                marginLeft: theme.spacing.md,
                color: theme.colors.black,
                flex: 1,
                fontFamily: "InterRegular",
              }}
            />
          )}
        />
      </View>

      {errors.email ? (
        <Text
          style={{ marginTop: theme.spacing.md, color: theme.colors.error }}
        >
          {errors.email.message}
        </Text>
      ) : null}

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
