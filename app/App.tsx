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
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Sentry from "sentry-expo";
import Toast from "react-native-toast-message";
import {
  CompletedProfileStackParamList,
  UnauthorizedStackParamList,
  UncompletedProfileStackParamList,
} from "~/typings";
import { SENTRY_DSN } from "~/constants";
import { theme } from "~/theme";
import { useProfileQuery } from "~/hooks/useProfileQuery";
import { supabase } from "~/supabase";
import { useTdeeEstimationMutation } from "~/hooks/useTdeeEstimationMutation";
import { HomeScreen } from "~/screens/Home";
import { BottomTabBar } from "~/components/BottomTabBar";
import { InsightsScreen } from "~/screens/Insights";
import { StrategyScreen } from "~/screens/Strategy";
import { ProfileScreen } from "~/screens/Profile";
import { ProfileStepOneScreen } from "~/screens/ProfileStepOne";
import { ProfileStepTwoScreen } from "~/screens/ProfileStepTwo";
import { ClosedBetaAuthScreen } from "~/screens/ClosedBetaAuth";
import { useToastConfig } from "~/hooks/useToastConfig";

global.Buffer = global.Buffer || Buffer;

const UnauthorizedStack =
  createNativeStackNavigator<UnauthorizedStackParamList>();

const UncompletedProfileStack =
  createNativeStackNavigator<UncompletedProfileStackParamList>();

const CompletedProfileStack =
  createBottomTabNavigator<CompletedProfileStackParamList>();

const queryClient = new QueryClient();

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

if (!__DEV__) {
  Sentry.init({
    dsn: SENTRY_DSN,
    enableInExpoDevelopment: false,
    debug: false,
  });
}

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
    <ThemeProvider theme={theme}>
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
  const [fetchingSession, setFetchingSession] = useState(true);
  const { data: profile, isSuccess: hasLoadedProfile } = useProfileQuery({
    enabled: !!session,
  });

  useEffect(() => {
    setMode(colorMode as "light" | "dark");
  }, [colorMode]);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
      })
      .finally(() => {
        setFetchingSession(false);
      });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  const isLoggedIn = !!session?.user;

  const hasCompletedProfile =
    !!profile?.preferedMeasurementSystem &&
    !!profile.initialTdeeEstimation &&
    !!profile.gender &&
    !!profile.goalId;

  const tdeeEstimationMutation = useTdeeEstimationMutation();
  const toastConfig = useToastConfig();

  useEffect(() => {
    if (hasCompletedProfile && isLoggedIn) {
      // This will try to create a tdee estimation for every 7 days of data.
      // If there isn't enough data it won't create anything but we need to run this
      // on app load to make sure we don't miss any data.
      tdeeEstimationMutation.mutate({ profile });
    }
  }, [hasCompletedProfile, isLoggedIn]);

  let appIsReady = false;
  if (isLoggedIn) {
    appIsReady =
      !fetchingSession &&
      fontsLoaded &&
      hasLoadedProfile &&
      (hasCompletedProfile && isLoggedIn
        ? !tdeeEstimationMutation.isLoading
        : true);
  } else {
    appIsReady = !fetchingSession && fontsLoaded;
  }

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately! If we call this after
      // `!appIsReady`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout.
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <>
      <NavigationContainer onReady={onLayoutRootView}>
        <StatusBar
          backgroundColor="transparent"
          barStyle={mode === "light" ? "dark-content" : "light-content"}
          translucent={true}
        />

        {isLoggedIn ? (
          hasCompletedProfile ? (
            <CompletedProfileStack.Navigator
              initialRouteName="Home"
              tabBar={(props) => <BottomTabBar {...props} />}
            >
              <CompletedProfileStack.Screen
                name="Home"
                component={HomeScreen}
                options={{
                  headerShown: false,
                }}
              />
              <CompletedProfileStack.Screen
                name="Insights"
                component={InsightsScreen}
                initialParams={{
                  screen: "EnergyExpenditure",
                }}
                options={{
                  headerShown: false,
                }}
              />
              <CompletedProfileStack.Screen
                name="Strategy"
                component={StrategyScreen}
                options={{
                  headerShown: false,
                }}
              />
              <CompletedProfileStack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                  headerShown: false,
                }}
              />
            </CompletedProfileStack.Navigator>
          ) : (
            <UncompletedProfileStack.Navigator
              initialRouteName={
                profile?.preferedMeasurementSystem &&
                profile.initialTdeeEstimation &&
                profile.initialWeight &&
                profile.gender
                  ? "StepTwo"
                  : "StepOne"
              }
            >
              <UncompletedProfileStack.Screen
                name="StepOne"
                component={ProfileStepOneScreen}
                options={{
                  headerShown: false,
                }}
              />
              <UncompletedProfileStack.Screen
                name="StepTwo"
                component={ProfileStepTwoScreen}
                options={{
                  headerShown: false,
                }}
              />
            </UncompletedProfileStack.Navigator>
          )
        ) : (
          <UnauthorizedStack.Navigator initialRouteName="ClosedBetaAuth">
            <UnauthorizedStack.Screen
              name="ClosedBetaAuth"
              component={ClosedBetaAuthScreen}
              options={{
                headerShown: false,
              }}
            />
          </UnauthorizedStack.Navigator>
        )}
      </NavigationContainer>

      <Toast config={toastConfig} />
    </>
  );
}
