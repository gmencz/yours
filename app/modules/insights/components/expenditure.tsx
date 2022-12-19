import { Text, useTheme } from "@rneui/themed";
import { View } from "react-native";

export function Expenditure() {
  const { theme } = useTheme();

  return (
    <View
      style={{
        paddingHorizontal: theme.spacing.xl,
        marginTop: theme.spacing.lg,
      }}
    >
      <Text>Cock</Text>
    </View>
  );
}
