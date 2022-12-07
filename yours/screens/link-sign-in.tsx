import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParamList } from "../types";
import { Text, useTheme } from "@rneui/themed";
import { Logo } from "../components/Logo";
import { AtSymbolIcon } from "react-native-heroicons/outline";
import { TextInput, TouchableOpacity, View } from "react-native";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { supabase } from "../lib/supabase";
import { makeRedirectUri } from "expo-auth-session";
import { useEffect, useState } from "react";
import * as Linking from "expo-linking";

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
  const { theme } = useTheme();
  const {
    setValue,
    handleSubmit,
    formState: { errors },
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

  const extractSessionFromLink = async (link: string) => {
    const parsedURL = Linking.parse(link.replace("#", "?")!);

    if (
      parsedURL.queryParams?.access_token &&
      parsedURL.queryParams.refresh_token
    ) {
      supabase.auth.setSession({
        access_token: parsedURL.queryParams.access_token as string,
        refresh_token: parsedURL.queryParams.refresh_token as string,
      });
    } else if (parsedURL.queryParams?.error_code) {
      // TODO: Handle error
      console.log(
        `Error extracting session from link: ${parsedURL.queryParams.error_code}`
      );
    }
  };

  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      if (url) {
        extractSessionFromLink(url!);
      }
    });

    function handler(res: { url: string }) {
      if (res.url) {
        extractSessionFromLink(res.url);
      }
    }

    const listener = Linking.addEventListener("url", handler);

    return () => {
      listener.remove();
    };
  }, []);

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

        <TextInput
          placeholder="Email"
          onChangeText={(text) => setValue("email", text)}
          placeholderTextColor={theme.colors.grey2}
          style={{
            marginLeft: theme.spacing.md,
            color: theme.colors.black,
            flex: 1,
            fontFamily: "InterRegular",
          }}
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

      <TouchableOpacity
        onPress={handleSubmit(sendMagicLink)}
        style={{
          backgroundColor: theme.colors.black,
          paddingVertical: 10,
          borderRadius: 5,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          marginTop: theme.spacing.xl,
        }}
      >
        <Text
          style={{
            color: theme.colors.white,
            fontFamily: "InterBlack",
          }}
        >
          Send magic link
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
