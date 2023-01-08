import { makeStyles, Text } from "@rneui/themed";
import {
  GestureResponderEvent,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";

type ButtonVariant = "1" | "2";

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
  const styles = useStyles({ hasIcon: !!icon, small: !!small, variant });

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
}

const useStyles = makeStyles((theme, props: UseStylesProps) => ({
  container: {
    paddingVertical: 10,
    borderRadius: 5,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingRight: props.hasIcon ? theme.spacing.xl : undefined,
    backgroundColor:
      props.variant === "1" ? theme.colors.black : theme.colors.grey5,
  },

  text: {
    color: props.variant === "1" ? theme.colors.white : theme.colors.black,
    fontSize: props.small ? 12 : 14,
    fontFamily: "SoraBold",
  },
}));
