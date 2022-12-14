import { Text, useTheme } from "@rneui/themed";
import { SafeAreaView } from "react-native-safe-area-context";

export function AnalyticsScreen() {
  const { theme } = useTheme();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        padding: theme.spacing.xl,
      }}
    >
      <Text style={{ fontFamily: "InterBold", fontSize: 20 }}>Analytics</Text>
    </SafeAreaView>
  );
}
