import { Text, useTheme } from "@rneui/themed";
import { Image, View } from "react-native";

export function Logo() {
  const { theme } = useTheme();

  return (
    <View style={{ alignItems: "center" }}>
      <Image
        style={{
          width: 150,
          height: 100,
          backgroundColor: theme.colors.grey5,
          borderRadius: 10,
        }}
        source={require("../../assets/icon.png")}
      />
    </View>
  );
}
