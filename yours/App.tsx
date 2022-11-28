import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, useThemeMode } from "@rneui/themed";
import { theme as appTheme } from "./lib/theme";
import { Screens } from "./screens";
import { useColorScheme } from "react-native";
import { useEffect } from "react";

export default function App() {
  return (
    <ThemeProvider theme={appTheme}>
      <SafeAreaProvider>
        <Screens />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
