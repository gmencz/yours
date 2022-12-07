import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image, Text, useTheme, useThemeMode } from "@rneui/themed";
import { makeRedirectUri, startAsync } from "expo-auth-session";
import { StyleProp, TouchableOpacity, ViewStyle } from "react-native";
import { AtSymbolIcon, LinkIcon } from "react-native-heroicons/outline";
import { supabase, supabaseUrl } from "../lib/supabase";
import { RootStackParamList } from "../types";

const externalProvidersIcons = {
  Discord: require("../assets/images/discord.png"),
  Google: require("../assets/images/google.png"),
};

interface AuthButtonExternalProviderProps {
  provider: "Discord" | "Google";
  style?: StyleProp<ViewStyle>;
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    "Welcome",
    undefined
  >;
}

function AuthButtonExternalProvider({
  provider,
  style,
  navigation,
}: AuthButtonExternalProviderProps) {
  const { theme } = useTheme();

  const onPress = async () => {
    const redirectUrl = makeRedirectUri({
      path: "/auth/callback",
    });

    const authResponse = await startAsync({
      authUrl: `${supabaseUrl}/auth/v1/authorize?provider=${provider.toLowerCase()}&redirect_to=${redirectUrl}`,
      returnUrl: redirectUrl,
    });

    if (authResponse.type === "success") {
      supabase.auth.setSession({
        access_token: authResponse.params.access_token,
        refresh_token: authResponse.params.refresh_token,
      });
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {
          backgroundColor: theme.colors.black,
          paddingVertical: 10,
          borderRadius: 5,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          paddingLeft: 25,
        },
        style,
      ]}
    >
      <Image
        source={
          externalProvidersIcons[
            provider as keyof typeof externalProvidersIcons
          ]
        }
        style={{
          height: 25,
          width: 25,
          marginRight: 30,
        }}
      />

      <Text
        style={{
          color: theme.colors.white,
          fontFamily: "InterBlack",
        }}
      >
        Continue with {provider}
      </Text>
    </TouchableOpacity>
  );
}

interface AuthButtonLocalProviderProps {
  provider: "Link" | "Email";
  style?: StyleProp<ViewStyle>;
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    "Welcome",
    undefined
  >;
}

function AuthButtonLocalProvider({
  provider,
  style,
  navigation,
}: AuthButtonLocalProviderProps) {
  const { mode } = useThemeMode();
  const { theme } = useTheme();

  const onPress = () => {
    switch (provider) {
      case "Email":
        navigation.navigate("EmailSignIn");
        return;
      case "Link":
        navigation.navigate("LinkSignIn");
        return;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {
          backgroundColor:
            mode === "dark" ? "rgba(25, 25, 25, 1)" : "rgba(230, 230, 230, 1)",
          paddingVertical: 10,
          borderRadius: 5,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          paddingLeft: 25,
        },
        style,
      ]}
    >
      {provider === "Link" ? (
        <LinkIcon
          size={25}
          color={theme.colors.black}
          style={{ marginRight: 30 }}
        />
      ) : provider === "Email" ? (
        <AtSymbolIcon
          size={25}
          color={theme.colors.black}
          style={{ marginRight: 30 }}
        />
      ) : null}

      <Text
        style={{
          color: theme.colors.black,
          fontFamily: "InterBlack",
        }}
      >
        Continue with {provider}
      </Text>
    </TouchableOpacity>
  );
}

interface AuthButtonProps {
  provider: "Discord" | "Google" | "Link" | "Email";
  style?: StyleProp<ViewStyle>;
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    "Welcome",
    undefined
  >;
}

export function AuthButton({ provider, style, navigation }: AuthButtonProps) {
  switch (provider) {
    case "Discord":
    case "Google":
      return (
        <AuthButtonExternalProvider
          navigation={navigation}
          provider={provider}
          style={style}
        />
      );
    default:
      return (
        <AuthButtonLocalProvider
          navigation={navigation}
          provider={provider}
          style={style}
        />
      );
  }
}
