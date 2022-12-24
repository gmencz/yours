import { Text, useTheme } from "@rneui/themed";
import { View } from "react-native";

interface StrategyTargetProps {
  color: string;
  amount: number;
  unit: string;
  name: string;
  icon: JSX.Element;
}

export function StrategyTarget({
  color,
  amount,
  unit,
  name,
  icon,
}: StrategyTargetProps) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: color,
        padding: theme.spacing.xl,
        borderRadius: 15,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            marginBottom: theme.spacing.sm,
          }}
        >
          <Text style={{ fontFamily: "InterBold", fontSize: 16 }}>
            {amount}{" "}
          </Text>
          <Text style={{ color: theme.colors.grey1 }}>{unit}</Text>
        </View>
        <Text style={{ color: theme.colors.grey0 }}>{name}</Text>
      </View>

      <View
        style={{
          marginLeft: "auto",
          padding: theme.spacing.lg,
          borderRadius: 15,
          backgroundColor: color,
        }}
      >
        {icon}
      </View>
    </View>
  );
}
