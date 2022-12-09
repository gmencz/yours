import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "@rneui/themed";
import { theme as appTheme } from "./lib/theme";
import { Screens } from "./screens";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
