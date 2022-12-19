import { SafeAreaView } from "react-native-safe-area-context";
import { Text, useTheme } from "@rneui/themed";
import { View } from "react-native";
import { Expenditure } from "../components/expenditure";

export function InsightsScreen() {
  const { theme } = useTheme();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingVertical: theme.spacing.xl,
      }}
    >
      <View style={{ paddingHorizontal: theme.spacing.xl }}>
        <Text
          style={{
            fontFamily: "InterBold",
            fontSize: 20,
          }}
        >
          Insights
        </Text>
      </View>

      {/* <WeightTrend /> */}
      <Expenditure />
    </SafeAreaView>
  );
}
