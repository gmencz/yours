import "react-native-url-polyfill/auto";
import { Buffer } from "buffer";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, useTheme, useThemeMode } from "@rneui/themed";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { useFonts } from "expo-font";
import { StatusBar, useColorScheme } from "react-native";
import * as SplashScreen from "expo-splash-screen";

import { theme as appTheme } from "./theme";
import { supabase } from "./modules/supabase/client";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthorizedStackParamList, UnauthorizedStackParamList } from "./types";
import { HomeScreen } from "./modules/home/screens/root";
import { FoodScreen } from "./modules/food/screens/root";
import { WelcomeScreen } from "./modules/auth/screens/welcome";
import { LinkSignInScreen } from "./modules/auth/screens/link-sign-in";
import { EmailSignInScreen } from "./modules/auth/screens/email-sign-in";
import { TabBar } from "./modules/common/components/bottom-tab-bar";

global.Buffer = global.Buffer || Buffer;

const UnauthorizedStack =
  createNativeStackNavigator<UnauthorizedStackParamList>();

const AuthorizedStack = createBottomTabNavigator<AuthorizedStackParamList>();

const queryClient = new QueryClient();

function App() {
  const { theme } = useTheme();

  return (
    <SafeAreaProvider style={{ backgroundColor: theme.colors.background }}>
      <Screens />
    </SafeAreaProvider>
  );
}

export default function AppWithTheme() {
  return (
    <ThemeProvider theme={appTheme}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

function Screens() {
  const [session, setSession] = useState<Session | null>(null);
  const [fontsLoaded] = useFonts({
    InterBlack: require("./assets/fonts/Inter/Inter-Black.ttf"),
    InterBold: require("./assets/fonts/Inter/Inter-Bold.ttf"),
    InterExtraBold: require("./assets/fonts/Inter/Inter-ExtraBold.ttf"),
    InterExtraLight: require("./assets/fonts/Inter/Inter-ExtraLight.ttf"),
    InterLight: require("./assets/fonts/Inter/Inter-Light.ttf"),
    InterMedium: require("./assets/fonts/Inter/Inter-Medium.ttf"),
    InterRegular: require("./assets/fonts/Inter/Inter-Regular.ttf"),
    InterSemiBold: require("./assets/fonts/Inter/Inter-SemiBold.ttf"),
    InterThin: require("./assets/fonts/Inter/Inter-Thin.ttf"),
  });

  const colorMode = useColorScheme();
  const { setMode, mode } = useThemeMode();
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    setMode(colorMode as "light" | "dark");
  }, [colorMode]);

  const isLoading = !fontsLoaded || loadingAuth;

  const onLayoutRootView = useCallback(async () => {
    if (!isLoading) {
      // This tells the splash screen to hide immediately! If we call this after
      // `!isLoading`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout.
      await SplashScreen.hideAsync();
    }
  }, [isLoading]);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
      })
      .finally(() => {
        setLoadingAuth(false);
      });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, [setLoadingAuth]);

  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer onReady={onLayoutRootView}>
      <StatusBar
        backgroundColor="transparent"
        barStyle={mode === "light" ? "dark-content" : "light-content"}
        translucent={true}
      />

      {session?.user ? (
        <AuthorizedStack.Navigator
          initialRouteName="Home"
          tabBar={(props) => <TabBar {...props} />}
        >
          <AuthorizedStack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              headerShown: false,
            }}
          />
          <AuthorizedStack.Screen
            name="Food"
            component={FoodScreen}
            initialParams={{
              screen: "Barcode",
            }}
            options={{
              headerShown: false,
            }}
          />
        </AuthorizedStack.Navigator>
      ) : (
        <UnauthorizedStack.Navigator initialRouteName="Welcome">
          <UnauthorizedStack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{
              headerShown: false,
            }}
          />
          <UnauthorizedStack.Screen
            name="LinkSignIn"
            component={LinkSignInScreen}
            options={{
              headerShown: false,
            }}
          />
          <UnauthorizedStack.Screen
            name="EmailSignIn"
            component={EmailSignInScreen}
            options={{
              headerShown: false,
            }}
          />
        </UnauthorizedStack.Navigator>
      )}
    </NavigationContainer>
  );
}
