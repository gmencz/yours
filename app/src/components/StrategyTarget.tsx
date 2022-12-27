import { makeStyles, Text } from "@rneui/themed";
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
  const styles = useStyles({ color });

  return (
    <View style={styles.container}>
      <View>
        <View style={styles.row}>
          <Text style={styles.amount}>{amount} </Text>
          <Text style={styles.unit}>{unit}</Text>
        </View>
        <Text style={styles.name}>{name}</Text>
      </View>

      <View style={styles.icon}>{icon}</View>
    </View>
  );
}

interface UseStylesProps {
  color: string;
}

const useStyles = makeStyles((theme, props: UseStylesProps) => ({
  container: {
    borderWidth: 1,
    borderColor: props.color,
    padding: theme.spacing.xl,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: theme.spacing.sm,
  },

  amount: {
    fontFamily: "InterBold",
    fontSize: 16,
  },

  unit: {
    color: theme.colors.grey1,
  },

  name: {
    color: theme.colors.grey0,
  },

  icon: {
    marginLeft: "auto",
    padding: theme.spacing.lg,
    borderRadius: 15,
    backgroundColor: props.color,
  },
}));
