import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@rneui/themed";
import { WeeksSwiper } from "../components/weeks-swiper";

export function HomeScreen() {
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
