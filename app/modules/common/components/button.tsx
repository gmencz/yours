import { Text, useTheme, useThemeMode } from "@rneui/themed";
import {
  GestureResponderEvent,
  StyleProp,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

type ButtonProps = {
  onPress: (event: GestureResponderEvent) => void;
  variant: "1" | "2";
  style?: StyleProp<ViewStyle>;
  title: string;
  icon?: JSX.Element;
  small?: boolean;
};

export function Button({
  onPress,
  variant,
  style = {},
  title,
  icon,
  small,
}: ButtonProps) {
  const { theme } = useTheme();
  const { mode } = useThemeMode();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        variant === "1"
          ? {
              backgroundColor: theme.colors.black,
            }
          : variant === "2"
          ? {
              backgroundColor: theme.colors.grey5,
            }
          : undefined,

        {
          paddingVertical: 10,
          borderRadius: 5,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: icon ? undefined : "center",
          paddingLeft: icon ? 25 : undefined,
        },

        style,
      ]}
    >
      {icon}

      <Text
        style={{
          color:
            variant === "1"
              ? theme.colors.white
              : variant === "2"
              ? theme.colors.black
              : undefined,
          fontSize: small ? 12 : 14,
          fontFamily: "InterBold",
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}
