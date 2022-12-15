import { Text, useTheme } from "@rneui/themed";
import { View } from "react-native";

export function WeekInsights() {
  const { theme } = useTheme();

  return (
    <View style={{ marginTop: 40, paddingBottom: 60 }}>
      <Text
        style={{
          fontFamily: "InterMedium",
          fontSize: 18,
          marginBottom: theme.spacing.md,
        }}
      >
        Insights
      </Text>

      <View style={{ flexDirection: "row" }}>
        <View
          style={{
            backgroundColor: theme.colors.grey5,
            flex: 1,
            marginRight: theme.spacing.xl,
          }}
        >
          <Text>TDEE</Text>
        </View>

        <View style={{ backgroundColor: theme.colors.grey5, flex: 1 }}>
          <Text>Weight Trend</Text>
        </View>
      </View>
    </View>
  );
}
