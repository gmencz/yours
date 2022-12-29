import { makeStyles, Text } from "@rneui/themed";
import { TouchableOpacity, View, ViewProps } from "react-native";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface RadioButtonProps<Value = any> extends ViewProps {
  value: Value;
  label: string;
  labelDescription: string;
  pressed: boolean;
  onPress: (value: Value) => void;
}

export function RadioButton({
  value,
  label,
  labelDescription,
  onPress,
  pressed,
  style,
}: RadioButtonProps) {
  const styles = useStyles({ pressed });

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        onPress={() => {
          onPress(value);
        }}
        style={styles.touchableOpacity}
      >
        {pressed ? <View style={styles.pressedIndicator} /> : null}
      </TouchableOpacity>

      <View style={styles.labelsContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.labelDescription}>{labelDescription}</Text>
      </View>
    </View>
  );
}

interface UseStylesProps {
  pressed: boolean;
}

const useStyles = makeStyles((theme, props: UseStylesProps) => ({
  container: {
    flexDirection: "row",
  },

  touchableOpacity: {
    height: 30,
    width: 30,
    borderRadius: 30,
    backgroundColor: props.pressed ? theme.colors.primary : theme.colors.grey5,
    borderWidth: 2,
    borderColor: theme.colors.grey4,
    marginTop: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  label: {
    marginLeft: theme.spacing.md,
    fontFamily: "InterMedium",
  },

  labelDescription: {
    marginLeft: theme.spacing.md,
    color: theme.colors.grey1,
    fontSize: 13,
  },

  labelsContainer: {
    flex: 1,
  },

  pressedIndicator: {
    width: 15,
    height: 15,
    backgroundColor: theme.colors.grey5,
    borderRadius: 15,
  },
}));
