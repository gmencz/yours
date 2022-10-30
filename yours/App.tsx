import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCallback } from "react";
import Home from "./features/home";

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

export default function App() {
  const [fontsLoaded] = useFonts({
    InterBlack: require("./assets/fonts/Inter/Inter-Black.ttf"),
    InterBold: require("./assets/fonts/Inter/Inter-Bold.ttf"),
    InterExtraBold: require("./assets/fonts/Inter/Inter-ExtraBold.ttf"),
    InterExtraLight: require("./assets/fonts/Inter/Inter-ExtraLight.ttf"),
    InterLight: require("./assets/fonts/Inter/Inter-Light.ttf"),
    InterMedum: require("./assets/fonts/Inter/Inter-Medium.ttf"),
    InterRegular: require("./assets/fonts/Inter/Inter-Regular.ttf"),
    InterSemiBold: require("./assets/fonts/Inter/Inter-SemiBold.ttf"),
    InterThin: require("./assets/fonts/Inter/Inter-Thin.ttf"),
  });

  const isLoading = !fontsLoaded;

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

  if (isLoading) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer onReady={onLayoutRootView}>
        <Stack.Navigator>
          <>
            <Stack.Screen
              name="Home"
              component={Home}
              options={{
                headerShown: false,
              }}
            />
          </>
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
}
