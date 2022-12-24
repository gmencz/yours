import "react-native-url-polyfill/auto";
import { Buffer } from "buffer";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, useTheme, useThemeMode } from "@rneui/themed";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
} from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { PostgrestError, Session } from "@supabase/supabase-js";
import { useFonts } from "expo-font";
import { StatusBar, useColorScheme } from "react-native";
import * as SplashScreen from "expo-splash-screen";

import Toast, {
  BaseToast,
  ErrorToast,
  ToastConfig,
} from "react-native-toast-message";
import { theme as appTheme, theme } from "./theme";
import { supabase } from "modules/supabase/client";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  CompletedProfileStackParamList,
  UncompletedProfileStackParamList,
  UnauthorizedStackParamList,
} from "./modules/common/types";
import { HomeScreen } from "modules/completed-profile/home/screens/root";
import { WelcomeScreen } from "modules/auth/screens/welcome";
import { LinkSignInScreen } from "modules/auth/screens/link-sign-in";
import { EmailSignInScreen } from "modules/auth/screens/email-sign-in";
import { TabBar } from "modules/common/components/bottom-tab-bar";
import { Profile, useProfileQuery } from "modules/auth/hooks/use-profile-query";
import { BasalEnergyExpenditureScreen } from "modules/uncompleted-profile/basal-energy-expenditure/screens/root";
import { GoalScreen } from "modules/uncompleted-profile/goal/screens/root";
import { InsightsScreen } from "modules/completed-profile/insights/screens/root";
import { runTdeeEstimator } from "modules/completed-profile/insights/utils/tdee-estimator";
import { StrategyScreen } from "modules/completed-profile/strategy/screens/root";

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
  const { theme } = useTheme();
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
    !!profile?.prefered_measurement_system &&
    !!profile.initial_tdee_estimation &&
    !!profile.goal_id;

  const tdeeEstimationMutation = useMutation<
    boolean,
    PostgrestError,
    { profile: Profile }
  >({
    mutationFn: async ({ profile }) => {
      await runTdeeEstimator({ profile });
      return true;
    },
  });

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
        ? tdeeEstimationMutation.isSuccess
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

  // Custom toast config
  const toastConfig: ToastConfig = {
    /*
    Overwrite 'success' type,
    by modifying the existing `BaseToast` component
  */
    success: (props) => (
      <BaseToast
        {...props}
        style={{ borderLeftColor: "pink" }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 15,
          fontWeight: "400",
        }}
      />
    ),
    /*
    Overwrite 'error' type,
    by modifying the existing `ErrorToast` component
  */
    error: (props) => (
      <ErrorToast
        {...props}
        style={{
          borderLeftColor: theme.colors.error,
          backgroundColor: theme.colors.grey5,
        }}
        text2NumberOfLines={2}
        text1Style={{
          color: theme.colors.black,
          fontSize: 14,
        }}
        text2Style={{
          color: theme.colors.grey1,
          fontSize: 14,
        }}
      />
    ),
  };

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
              tabBar={(props) => <TabBar {...props} />}
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

              {/* The food feature is disabled for now */}
              {/* <CompletedProfileStack.Screen
              name="Food"
              component={FoodScreen}
              initialParams={{
                screen: "Barcode",
              }}
              options={{
                headerShown: false,
              }}
            /> */}
            </CompletedProfileStack.Navigator>
          ) : (
            <UncompletedProfileStack.Navigator
              initialRouteName={
                profile?.prefered_measurement_system &&
                profile.initial_tdee_estimation &&
                profile.initial_weight &&
                profile.gender
                  ? "Goal"
                  : "BasalEnergyExpenditure"
              }
            >
              <UncompletedProfileStack.Screen
                name="BasalEnergyExpenditure"
                component={BasalEnergyExpenditureScreen}
                options={{
                  headerShown: false,
                }}
              />
              <UncompletedProfileStack.Screen
                name="Goal"
                component={GoalScreen}
                options={{
                  headerShown: false,
                }}
              />
            </UncompletedProfileStack.Navigator>
          )
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

      <Toast config={toastConfig} />
    </>
  );
}
