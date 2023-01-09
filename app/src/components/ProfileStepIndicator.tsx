import { makeStyles } from "@rneui/themed";
import { View } from "react-native";

interface ProfileStepIndicatorProps {
  currentStepNumber: number;
}

export function ProfileStepIndicator({
  currentStepNumber,
}: ProfileStepIndicatorProps) {
  const styles = useStyles();

  return (
    <View style={styles.container}>
      {[1, 2, 3].map((stepNumber) => (
        <View
          key={stepNumber}
          style={
            stepNumber === currentStepNumber
              ? styles.activeStepNumber
              : styles.stepNumber
          }
        />
      ))}
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    flexDirection: "row",
  },
  stepNumber: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
    marginRight: theme.spacing.md,
  },
  activeStepNumber: {
    width: 35,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
    marginRight: theme.spacing.md,
  },
}));
