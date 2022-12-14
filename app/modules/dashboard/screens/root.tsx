import { SafeAreaView } from "react-native-safe-area-context";
import { Text, useTheme } from "@rneui/themed";
import { WeeksSwiper } from "../components/weeks-swiper";

export function DashboardScreen() {
  const { theme } = useTheme();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
      }}
    >
      <WeeksSwiper />
    </SafeAreaView>
  );
}
