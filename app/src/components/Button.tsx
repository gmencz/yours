import { makeStyles, Text, ThemeMode, useThemeMode } from "@rneui/themed";
import {
  GestureResponderEvent,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";

type ButtonVariant = "1" | "2" | "3";

interface ButtonProps extends TouchableOpacityProps {
  onPress: (event: GestureResponderEvent) => void;
  variant: ButtonVariant;
  title: string;
  icon?: JSX.Element;
  small?: boolean;
}

export function Button({
  onPress,
  variant,
  title,
  style,
  icon,
  small,
}: ButtonProps) {
  const { mode } = useThemeMode();
  const styles = useStyles({ hasIcon: !!icon, small: !!small, variant, mode });

  return (
    <TouchableOpacity onPress={onPress} style={[styles.container, style]}>
      {icon}
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

interface UseStylesProps {
  hasIcon: boolean;
  variant: ButtonVariant;
  small: boolean;
  mode: ThemeMode;
}

const useStyles = makeStyles((theme, props: UseStylesProps) => ({
  container: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingRight: props.hasIcon ? theme.spacing.xl : undefined,
    backgroundColor:
      props.variant === "1"
        ? theme.colors.black
        : props.variant === "2"
        ? theme.colors.grey5
        : theme.colors.primary,
  },

  text: {
    color:
      props.variant === "1"
        ? theme.colors.white
        : props.variant === "2"
        ? theme.colors.black
        : props.mode === "dark"
        ? theme.colors.white
        : theme.colors.black,
    fontSize: props.small ? 14 : 16,
    fontFamily: "SoraMedium",
  },
}));
