import { Text, useTheme } from "@rneui/themed";
import { View } from "react-native";

export function Logo() {
  const { theme } = useTheme();

  return (
    <View
      style={{
        width: 70,
      }}
    >
      <Text
        style={{
          fontSize: 20,
          fontFamily: "InterBlack",
        }}
      >
        yours
      </Text>

      <View
        style={{
          height: 2,
          width: 53,
          backgroundColor: theme.colors.black,
          marginLeft: 10,
          marginTop: -3.5,
          borderRadius: 10,
        }}
      />
    </View>
  );
}
