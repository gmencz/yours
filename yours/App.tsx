import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "@rneui/themed";
import { theme as appTheme } from "./lib/theme";
import { Screens } from "./screens";

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
      <App />
    </ThemeProvider>
  );
}
